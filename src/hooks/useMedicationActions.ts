import { lastDayOfMonth, format } from 'date-fns';
import { Medication, Batch } from '../types';
import { OperationType, handleApiError, toDate, parseDate } from '../lib/utils';
import { apiService } from '../services/api';

export function useMedicationActions(user: any, medications: Medication[], batches: Batch[], showToast: (msg: string, type?: 'success' | 'error') => void) {
  
  const handleSaveMedication = async (
    e: React.FormEvent<HTMLFormElement>, 
    isEditing: boolean, 
    selectedMedication: Medication | null,
    onSuccess: (med: Medication | null) => void,
    setIsSubmitting: (v: boolean) => void
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const barcode = formData.get('barcode') as string;
    const itemCode = formData.get('itemCode') as string;
    const brandName = formData.get('brandName') as string;
    const supplierName = formData.get('supplierName') as string;
    const category = formData.get('category') as string;
    const gtin = formData.get('gtin') as string;

    if (!name || !user) return;

    if (barcode) {
      const isDuplicate = medications.some(m => 
        m.barcode === barcode && (!isEditing || m.id !== selectedMedication?.id)
      );
      if (isDuplicate) {
        showToast(`Barcode "${barcode}" is already assigned to another medication.`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const id = (isEditing && selectedMedication) ? selectedMedication.id : crypto.randomUUID();
      const data: Medication = {
        id,
        name,
        barcode: barcode || '',
        itemCode: itemCode || '',
        brandName: brandName || '',
        supplierName: supplierName || '',
        category: category || '',
        gtin: gtin || '',
        updatedAt: Date.now(),
      };

      if (isEditing && selectedMedication) {
        await apiService.updateMedication(id, data);
        onSuccess(data);
      } else {
        await apiService.createMedication(data);
        onSuccess(null);
      }
      
      showToast(isEditing ? `${name} – Details updated` : `${name} – Medication added`);
    } catch (error) {
      handleApiError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'medications');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBatch = async (
    e: React.FormEvent<HTMLFormElement>,
    selectedMedication: Medication | null,
    isEditing: boolean,
    editingBatch: Batch | null,
    quantity: string,
    onSuccess: () => void,
    setIsSubmitting: (v: boolean) => void
  ) => {
    e.preventDefault();
    if (!selectedMedication || !user) return;

    const formData = new FormData(e.currentTarget);
    const batchNumber = formData.get('batchNumber') as string;
    const expiryMonth = parseInt(formData.get('expiryMonth') as string);
    const expiryYear = parseInt(formData.get('expiryYear') as string);
    const qtyValue = parseInt(quantity);

    if (!batchNumber) {
      showToast('Please enter a batch number.', 'error');
      return;
    }

    if (isNaN(qtyValue) || qtyValue <= 0) {
      showToast('Quantity must be a positive number.', 'error');
      return;
    }

    if (isNaN(expiryMonth) || isNaN(expiryYear)) {
      showToast('Please select a valid expiry date.', 'error');
      return;
    }

    let year = expiryYear;
    if (year < 100) year += 2000;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear || (year === currentYear && expiryMonth < currentMonth)) {
      showToast('Expiry date cannot be in the past.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const expiryDateObj = lastDayOfMonth(new Date(year, expiryMonth - 1));
      const id = (isEditing && editingBatch) ? editingBatch.id : crypto.randomUUID();
      const data: Batch = {
        id,
        medicationId: selectedMedication.id,
        batchNumber,
        expiryDate: expiryDateObj.getTime(),
        quantity: qtyValue,
        status: 'active',
        updatedAt: Date.now(),
        createdAt: editingBatch?.createdAt || Date.now()
      };

      if (isEditing && editingBatch) {
        await apiService.updateBatch(id, data);
      } else {
        await apiService.createBatch(data);
      }
      
      onSuccess();
      showToast(isEditing ? `${selectedMedication.name} – Batch updated` : `${selectedMedication.name} – Batch added`);
    } catch (error) {
      handleApiError(error, isEditing ? OperationType.UPDATE : OperationType.CREATE, 'batches');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (
    deleteConfirmation: any,
    onSuccess: () => void,
    setIsSubmitting: (v: boolean) => void
  ) => {
    if (!deleteConfirmation || !user) return;
    const { id, type } = deleteConfirmation;
    
    try {
      setIsSubmitting(true);
      const medName = type === 'medication' 
        ? medications.find(m => m.id === id)?.name 
        : type === 'batch' 
          ? medications.find(m => m.id === batches.find(b => b.id === id)?.medicationId)?.name 
          : '';

      if (type === 'medication') {
        await apiService.deleteMedication(id);
      } else if (type === 'batch') {
        await apiService.deleteBatch(id);
      } else if (type === 'all') {
        await apiService.clearAllData();
      }
      
      const successMessage = type === 'all' 
        ? 'Database cleared successfully' 
        : `${medName} – ${type.charAt(0).toUpperCase() + type.slice(1)} deleted`;
      
      showToast(successMessage);
      onSuccess();
    } catch (error) {
      handleApiError(error, OperationType.DELETE, `${type}s/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImport = async (data: any[], onProgress?: (stats: { current: number, total: number, success: number, fail: number, lastError?: string }) => void) => {
    if (!user) return;
    
    const medicationMap = new Map<string, string>(); // name -> id
    const medDetailsMap = new Map<string, Medication>(); // id -> object
    const barcodeMap = new Map<string, string>(); // barcode -> id
    const gtinMap = new Map<string, string>(); // gtin -> id
    const itemCodeMap = new Map<string, string>(); // itemCode -> id

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    medications.forEach(m => {
      const id = m.id;
      medDetailsMap.set(id, m);
      if (m.name) medicationMap.set(m.name.trim().toLowerCase(), id);
      if (m.barcode) barcodeMap.set(m.barcode.trim(), id);
      if (m.gtin) gtinMap.set(m.gtin.trim(), id);
      if (m.itemCode) itemCodeMap.set(m.itemCode.trim(), id);
    });

    const batchMap = new Map<string, string>(); // key: medicationId:batchNumber, value: batchId
    const batchDetailsMap = new Map<string, Batch>(); // batchId -> object
    batches.forEach(b => {
      batchMap.set(`${b.medicationId}:${b.batchNumber}`, b.id);
      batchDetailsMap.set(b.id, b);
    });

    const medsToSync: Medication[] = [];
    const batchesToSync: Batch[] = [];

    const syncBatch = async () => {
      if (medsToSync.length > 0 || batchesToSync.length > 0) {
        // Create copies to send before splicing to avoid potential race conditions
        const medsPayload = [...medsToSync];
        const batchesPayload = [...batchesToSync];
        medsToSync.length = 0;
        batchesToSync.length = 0;
        
        await apiService.bulkImportData({ 
          medications: medsPayload, 
          batches: batchesPayload 
        });
      }
    };

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowNum = i + 1;

      try {
        const getFieldValue = (keys: string[]) => {
          const itemKeys = Object.keys(item);
          const normalizedTargetKeys = keys.map(k => k.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
          
          // 1. Direct match
          for (const key of keys) {
            const val = item[key];
            if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
          }
          
          // 2. Normalized match
          for (const itemKey of itemKeys) {
            const normalizedItemKey = itemKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedTargetKeys.includes(normalizedItemKey)) {
              const val = item[itemKey];
              if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
            }
          }
          
          // 3. Fuzzy contains match (e.g. "Medication Name" contains "Medication")
          for (const itemKey of itemKeys) {
            const lowKey = itemKey.toLowerCase();
            for (const targetKey of keys) {
              const lowTarget = targetKey.toLowerCase();
              if (lowKey.includes(lowTarget) || lowTarget.includes(lowKey)) {
                const val = item[itemKey];
                if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
              }
            }
          }
          return '';
        };

        const medName = getFieldValue(['Medication Name', 'Medication', 'Item Name', 'Description', 'Product', 'Name', 'Item', 'Med']);
        if (!medName) {
          const hasAnyData = Object.values(item).some(v => v !== undefined && v !== null && String(v).trim() !== '');
          if (!hasAnyData) continue;
          throw new Error(`Row ${rowNum}: Medication name is missing.`);
        }

        const barcode = getFieldValue(['Barcode', 'barcode', 'EAN', 'UPC', 'Code', 'Scan Code']);
        const itemCode = getFieldValue(['Item Code', 'itemCode', 'Item Number', 'Reference', 'Ref', 'SKU']);
        const brandName = getFieldValue(['Brand Name', 'brandName', 'Brand', 'Manufacturer', 'Make']);
        const supplierName = getFieldValue(['Supplier', 'supplierName', 'supplier', 'Distributor', 'Vendor', 'Source']);
        const location = getFieldValue(['Location', 'location', 'Category', 'category', 'Shelf', 'Aisle', 'Storage']);
        const gtin = getFieldValue(['GTIN', 'gtin', 'Global Trade Item Number', 'GTIN-13', 'GTIN-14']);
        
        let medId = '';
        const nameKey = medName.toLowerCase();
        
        const normalizeId = (val: string) => {
          if (!val) return '';
          const trimmed = val.trim();
          if (/^\d+\.?\d*e\+\d+$/i.test(trimmed)) return String(Number(trimmed));
          return trimmed.replace(/\.0$/, '');
        };

        const cleanBarcode = normalizeId(barcode);
        const cleanGtin = normalizeId(gtin);
        const cleanItemCode = normalizeId(itemCode);

        const existingIdByName = medicationMap.get(nameKey);
        const existingIdByBarcode = cleanBarcode ? barcodeMap.get(cleanBarcode) : null;
        const existingIdByGtin = cleanGtin ? gtinMap.get(cleanGtin) : null;
        const existingIdByItemCode = cleanItemCode ? itemCodeMap.get(cleanItemCode) : null;
        
        const medIdToUse = existingIdByName || existingIdByBarcode || existingIdByGtin || existingIdByItemCode;
        const existingMed = medIdToUse ? medDetailsMap.get(medIdToUse) : null;

        if (existingMed) {
          medId = existingMed.id;
          const hasChanged = 
            (cleanBarcode && existingMed.barcode !== cleanBarcode) ||
            (cleanGtin && existingMed.gtin !== cleanGtin) ||
            (cleanItemCode && existingMed.itemCode !== cleanItemCode) ||
            (brandName && existingMed.brandName !== brandName) ||
            (supplierName && existingMed.supplierName !== supplierName) ||
            (location && existingMed.category !== location);

          if (hasChanged) {
            const updatedMed = { 
              ...existingMed, 
              barcode: cleanBarcode || existingMed.barcode || '',
              gtin: cleanGtin || existingMed.gtin || '',
              itemCode: cleanItemCode || existingMed.itemCode || '',
              brandName: brandName || existingMed.brandName || '',
              supplierName: supplierName || existingMed.supplierName || '',
              category: location || existingMed.category || '',
              updatedAt: Date.now()
            };
            medsToSync.push(updatedMed);
            medDetailsMap.set(medId, updatedMed);
          }
        } else {
          medId = crypto.randomUUID();
          const newMed: Medication = {
            id: medId,
            name: medName,
            barcode: cleanBarcode,
            itemCode: cleanItemCode,
            brandName,
            supplierName,
            category: location,
            gtin: cleanGtin,
            updatedAt: Date.now()
          };
          medsToSync.push(newMed);
          medicationMap.set(nameKey, medId);
          medDetailsMap.set(medId, newMed);
          if (cleanBarcode) barcodeMap.set(cleanBarcode, medId);
          if (cleanGtin) gtinMap.set(cleanGtin, medId);
          if (cleanItemCode) itemCodeMap.set(cleanItemCode, medId);
        }

        const batchNumber = getFieldValue(['Batch Number', 'batchNumber', 'Batch', 'Lot', 'Batch No', 'BatchNumber', 'Lot Number', 'B/N']);
        const expiryStr = getFieldValue(['Expiry Date (DD-MM-YYYY)', 'Expiry Date', 'expiry', 'Exp', 'Expiry', 'ExpiryDate', 'Exp Date', 'EXP']);
        const rawQty = getFieldValue(['Quantity', 'quantity', 'Qty', 'Stock', 'Amount', 'Units']);
        const quantityVal = parseInt(rawQty || '0');

        if (batchNumber && expiryStr) {
          // Robust date parsing
          const expDate = parseDate(expiryStr);
          if (!expDate) throw new Error(`Row ${rowNum}: Invalid expiry date "${expiryStr}"`);

          const existingBatchId = batchMap.get(`${medId}:${batchNumber}`);
          if (existingBatchId) {
            const existingBatchObj = batchDetailsMap.get(existingBatchId);
            const newQty = isNaN(quantityVal) ? 0 : quantityVal;
            if (existingBatchObj && (existingBatchObj.quantity !== newQty || existingBatchObj.status !== 'active')) {
              const updatedBatch = { ...existingBatchObj, quantity: newQty, status: 'active' as const, updatedAt: Date.now() };
              batchesToSync.push(updatedBatch);
              batchDetailsMap.set(existingBatchId, updatedBatch);
            }
          } else {
            const newBatchId = crypto.randomUUID();
            const batchData: Batch = {
              id: newBatchId,
              medicationId: medId,
              batchNumber,
              expiryDate: lastDayOfMonth(expDate).getTime(),
              quantity: isNaN(quantityVal) ? 0 : quantityVal,
              status: 'active',
              updatedAt: Date.now(),
              createdAt: Date.now()
            };
            batchesToSync.push(batchData);
            batchMap.set(`${medId}:${batchNumber}`, newBatchId);
            batchDetailsMap.set(newBatchId, batchData);
          }
        }
        successCount++;
      } catch (err: any) {
        errorCount++;
        errors.push(err.message);
      }

      // Sync in chunks of 100 to keep it fast but provide feedback
      if (i > 0 && i % 100 === 0) {
        await syncBatch();
      }

      if (onProgress && i % 10 === 0) {
        onProgress({
          current: i + 1,
          total: data.length,
          success: successCount,
          fail: errorCount,
          lastError: errors.length > 0 ? errors[errors.length - 1] : undefined
        });
      }
    }

    // Final sync
    await syncBatch();

    return { success: successCount, fail: errorCount, errors };
  };

  return {
    handleSaveMedication,
    handleSaveBatch,
    confirmDelete,
    handleBulkImport
  };
}
