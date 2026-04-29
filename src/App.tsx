/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Papa from 'papaparse';

import { useMedicationData } from './hooks/useMedicationData';
import { useModalState } from './hooks/useModalState';
import { useNativeShell } from './hooks/useNativeShell';
import { getMillis, toDate } from './lib/utils';
import { useAuth } from './hooks/useAuth';

// Components
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { ScrollToTop } from './components/ScrollToTop';
import { Toast } from './components/Toast';
import { MainDashboard } from './components/MainDashboard';
import { AdminPage } from './components/AdminPage';
import { ImportExportPage } from './components/ImportExportPage';
import { ModalManager } from './components/ModalManager';
import { parseGS1QRCode } from './lib/gs1Parser';

// --- Main App ---

export default function App() {
  useNativeShell();

  const { user, loading, logout } = useAuth();
  const medicationData = useMedicationData();
  const {
    isDataLoading,
    loadingProgress,
    medications,
    batches,
    searchTerm,
    setSearchTerm,
    activeSearchTerm,
    setActiveSearchTerm,
    selectedMedication,
    setSelectedMedication,
    isAddingMedication,
    setIsAddingMedication,
    isEditingMedication,
    setIsEditingMedication,
    isAddingBatch,
    setIsAddingBatch,
    isEditingBatch,
    setIsEditingBatch,
    editingBatch,
    setEditingBatch,
    geminiScanCount,
    isScanning,
    setIsScanning,
    scannedBarcode,
    setScannedBarcode,
    medicationName,
    setMedicationName,
    isBulkImporting,
    setIsBulkImporting,
    isOCRScanning,
    setIsOCRScanning,
    isGS1Scanning,
    setIsGS1Scanning,
    isSubmitting,
    batchNumber,
    setBatchNumber,
    expiryMonth,
    setExpiryMonth,
    expiryYear,
    setExpiryYear,
    sortBy,
    setSortBy,
    showAll,
    setShowAll,
    currentPage,
    setCurrentPage,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    isAdminSettingsOpen,
    setIsAdminSettingsOpen,
    isImportExportOpen,
    setIsImportExportOpen,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    deleteConfirmation,
    setDeleteConfirmation,
    incrementGeminiScanCount,
    totalInputTokens,
    totalOutputTokens,
    handleSaveMedication,
    handleSaveBatch,
    confirmDelete,
    handleBulkImport,
    quantity,
    setQuantity,
    resetFilters,
    resetToDashboard,
    toast,
    setToast,
    showToast,
    setIsGTINScanning,
    isGTINScanning,
    gtinValue,
    setGtinValue
  } = medicationData;

  const prevIsProfileSettingsOpen = useRef(isProfileSettingsOpen);
  const prevIsAdminSettingsOpen = useRef(isAdminSettingsOpen);
  const prevIsBulkImporting = useRef(isBulkImporting);
  const prevIsImportExportOpen = useRef(isImportExportOpen);

  useEffect(() => {
    const wasOffDashboard = 
      prevIsProfileSettingsOpen.current || 
      prevIsAdminSettingsOpen.current || 
      prevIsBulkImporting.current ||
      prevIsImportExportOpen.current;
    
    const isOnDashboard = 
      !isProfileSettingsOpen && 
      !isAdminSettingsOpen && 
      !isBulkImporting &&
      !isImportExportOpen;

    if (wasOffDashboard && isOnDashboard) {
      resetToDashboard();
    }

    prevIsProfileSettingsOpen.current = isProfileSettingsOpen;
    prevIsAdminSettingsOpen.current = isAdminSettingsOpen;
    prevIsBulkImporting.current = isBulkImporting;
    prevIsImportExportOpen.current = isImportExportOpen;
  }, [isProfileSettingsOpen, isAdminSettingsOpen, isBulkImporting, isImportExportOpen, resetToDashboard]);

  const handleGs1Scan = (data: any) => {
    // 1. Close all scanners immediately
    setIsGS1Scanning(false);
    setIsScanning(false);
    setIsGTINScanning(false);
    
    if (!data) return;

    // 2. Extract and sanitize core data
    const { gtin, batchNumber: bNum, expiryMonth: eMonth, expiryYear: eYear } = data;

    // 3. Check for existing medication by GTIN
    if (gtin) {
      const gtinClean = gtin.replace(/^0+/, '');
      const medByGtin = medications.find(m => {
        const mGtin = m.gtin?.replace(/^0+/, '');
        return mGtin === gtinClean;
      });

      if (medByGtin) {
        // Known medication: Select and prepare for batch entry
        setSelectedMedication(medByGtin);
        
        // Ensure filters don't hide the medication we just found
        setSearchTerm(medByGtin.name);
        setActiveSearchTerm(medByGtin.name);
        setScannedBarcode(medByGtin.name);

        // Open/Ensure batch form is open
        if (!isAddingBatch && !isEditingBatch) {
          setIsAddingBatch(true);
        }
      } else {
        // Unknown medication: Pass GTIN to MedicationForm
        setGtinValue(gtin);
        
        if (!isAddingBatch && !isEditingBatch) {
          setSearchTerm(gtin);
          setActiveSearchTerm(gtin);
          setScannedBarcode(gtin);
          showToast(`GTIN ${gtin} not in database.`, 'error');
        }
      }
    }

    // 4. Set the batch details
    // We do this AFTER navigation logic to ensure the target state is correctly primed
    if (bNum) setBatchNumber(bNum);
    if (eMonth) setExpiryMonth(eMonth);
    if (eYear) setExpiryYear(eYear);
  };

  useModalState(
    {
      isAddingMedication,
      isEditingMedication,
      isAddingBatch,
      isEditingBatch,
      isScanning,
      isBulkImporting,
      isOCRScanning,
      isGS1Scanning,
      isProfileSettingsOpen,
      isImportExportOpen,
      deleteConfirmation,
      selectedMedication
    },
    {
      setIsAddingMedication,
      setIsEditingMedication,
      setIsAddingBatch,
      setIsEditingBatch,
      setIsScanning,
      setIsBulkImporting,
      setIsOCRScanning,
      setIsGS1Scanning,
      setIsProfileSettingsOpen,
      setIsImportExportOpen,
      setDeleteConfirmation,
      setSelectedMedication
    }
  );

  const handleBarcodeScan = async (barcode: string) => {
    setIsScanning(false);
    
    // If we're currently adding/editing a medication, just capture the barcode
    if (isAddingMedication) {
      setScannedBarcode(barcode);
      return;
    }

    setScannedBarcode(barcode);
    setSearchTerm(barcode);
    setActiveSearchTerm(barcode);
    
    const existing = medications.find(m => m.barcode === barcode || m.gtin === barcode);
    if (existing) {
      setSelectedMedication(existing);
    } else {
      showToast(`Scanned: ${barcode}. No exact match found.`, 'error');
    }
  };

  const handleExport = () => {
    const exportData: any[] = [];
    
    medications.forEach(medication => {
      const medicationBatches = batches.filter(b => b.medicationId === medication.id);
      
      if (medicationBatches.length > 0) {
        medicationBatches.forEach(batch => {
          exportData.push({
            'Item Code': medication.itemCode || '',
            'Barcode': medication.barcode || '',
            'Medication Name': medication.name,
            'GTIN': medication.gtin || '',
            'Brand Name': medication.brandName || '',
            'Location': medication.category || '',
            'Supplier': medication.supplierName || '',
            'Batch Number': batch.batchNumber,
            'Expiry Date (DD-MM-YYYY)': format(toDate(batch.expiryDate), 'dd-MM-yyyy'),
            'Quantity': batch.quantity,
            'Status': batch.status
          });
        });
      } else {
        exportData.push({
          'Item Code': medication.itemCode || '',
          'Barcode': medication.barcode || '',
          'Medication Name': medication.name,
          'GTIN': medication.gtin || '',
          'Brand Name': medication.brandName || '',
          'Location': medication.category || '',
          'Supplier': medication.supplierName || '',
          'Batch Number': '',
          'Expiry Date (DD-MM-YYYY)': '',
          'Quantity': 0,
          'Status': 'active'
        });
      }
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `meditrack_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    // Some mobile browsers block clicks on hidden elements
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDeleteMedication = (id: string) => {
    setDeleteConfirmation({
      id,
      type: 'medication',
      title: 'Delete Medication',
      message: 'Are you sure you want to delete this medication? All associated batches will also be permanently deleted.'
    });
  };

  const handleDeleteBatch = (id: string) => {
    setDeleteConfirmation({
      id,
      type: 'batch',
      title: 'Delete Batch',
      message: 'Are you sure you want to delete this batch? This action cannot be undone.'
    });
  };

  const handleDeleteAllData = () => {
    setDeleteConfirmation({
      id: 'all',
      type: 'all',
      title: 'Clear My Database Data',
      message: 'Are you sure you want to delete ALL your medications and batches? This action is irreversible and will wipe your personal database.'
    });
  };

  const activeMedicationsCount = useMemo(() => {
    return medications.filter(m => batches.some(b => b.medicationId === m.id)).length;
  }, [medications, batches]);

  const categories = useMemo(() => {
    const cats = new Set(medications.map(m => m.category).filter(c => c && c !== 'All'));
    return ['All', ...Array.from(cats).sort()];
  }, [medications]);

  const brands = useMemo(() => {
    const brs = new Set(medications.map(m => m.brandName).filter(b => b && b !== 'All'));
    return ['All', ...Array.from(brs).sort()];
  }, [medications]);

  const filteredMedications = useMemo(() => {
    let result = medications.filter(m => {
      const lowerSearch = activeSearchTerm.toLowerCase();
      const matchesMed = 
        m.name.toLowerCase().includes(lowerSearch) ||
        m.brandName?.toLowerCase().includes(lowerSearch) ||
        m.itemCode?.toLowerCase().includes(lowerSearch) ||
        m.barcode?.toLowerCase().includes(lowerSearch) ||
        m.gtin?.toLowerCase().includes(lowerSearch) ||
        m.category?.toLowerCase().includes(lowerSearch);
      
      // Also allow searching by batch number within medications
      const matchesBatch = batches.some(b => 
        b.medicationId === m.id && 
        b.batchNumber.toLowerCase().includes(lowerSearch)
      );

      return matchesMed || matchesBatch;
    });

    if (!showAll) {
      result = result.filter(m => batches.some(b => b.medicationId === m.id));
    }

    if (selectedCategory !== 'All') {
      result = result.filter(m => m.category === selectedCategory);
    }

    if (selectedBrand !== 'All') {
      result = result.filter(m => m.brandName === selectedBrand);
    }

    if (sortBy === 'zero-stock') {
      result = result.filter(m => {
        const mBatches = batches.filter(bt => bt.medicationId === m.id);
        const totalQty = mBatches.reduce((sum, bt) => sum + bt.quantity, 0);
        return totalQty === 0;
      });
    }

    return result.sort((a, b) => {
      const aBatches = batches.filter(bt => bt.medicationId === a.id);
      const bBatches = batches.filter(bt => bt.medicationId === b.id);

      const aTotalQty = aBatches.reduce((sum, bt) => sum + bt.quantity, 0);
      const bTotalQty = bBatches.reduce((sum, bt) => sum + bt.quantity, 0);

      const aNearestExpiry = aBatches.length > 0 
        ? Math.min(...aBatches.map(bt => getMillis(bt.expiryDate))) 
        : Infinity;
      const bNearestExpiry = bBatches.length > 0 
        ? Math.min(...bBatches.map(bt => getMillis(bt.expiryDate))) 
        : Infinity;

      if (sortBy === 'near-expiry') return aNearestExpiry - bNearestExpiry;
      if (sortBy === 'far-expiry') {
        if (aNearestExpiry === Infinity && bNearestExpiry === Infinity) return 0;
        if (aNearestExpiry === Infinity) return 1;
        if (bNearestExpiry === Infinity) return -1;
        return bNearestExpiry - aNearestExpiry;
      }
      if (sortBy === 'less-qty') return aTotalQty - bTotalQty;
      if (sortBy === 'more-qty') return bTotalQty - aTotalQty;
      if (sortBy === 'newest') return getMillis(b.updatedAt) - getMillis(a.updatedAt);
      return 0;
    });
  }, [medications, activeSearchTerm, showAll, sortBy, batches, selectedCategory, selectedBrand]);

  const ITEMS_PER_PAGE = 50;
  const paginatedMedications = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMedications, currentPage]);

  const totalPages = Math.ceil(filteredMedications.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-14 h-14 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Signing In</p>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="app-shell bg-premium-bg text-premium-text font-sans min-h-screen">
      <Header 
        user={user}
        isDataLoading={isDataLoading}
        onProfileSettingsClick={() => setIsProfileSettingsOpen(true)}
        onImportExportClick={() => setIsImportExportOpen(true)}
        onAdminSettingsClick={() => setIsAdminSettingsOpen(true)}
        onLogout={logout}
      />

      {isAdminSettingsOpen ? (
        <AdminPage onBack={() => setIsAdminSettingsOpen(false)} />
      ) : isImportExportOpen ? (
        <ImportExportPage 
          onBack={() => setIsImportExportOpen(false)} 
          onImportClick={() => setIsBulkImporting(true)}
          onExportClick={handleExport}
        />
      ) : (
        <MainDashboard
          isDataLoading={isDataLoading}
          loadingProgress={loadingProgress}
          error={medicationData.error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setActiveSearchTerm={setActiveSearchTerm}
          setIsScanning={setIsScanning}
          setIsGS1Scanning={setIsGS1Scanning}
          setScannedBarcode={setScannedBarcode}
          setIsAddingMedication={setIsAddingMedication}
          showAll={showAll}
          setShowAll={setShowAll}
          activeMedicationsCount={activeMedicationsCount}
          allMedicationsCount={medications.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
          filteredMedications={filteredMedications}
          medications={medications}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          brands={brands}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          resetFilters={resetFilters}
          activeSearchTerm={activeSearchTerm}
          paginatedMedications={paginatedMedications}
          batches={batches}
          selectedMedication={selectedMedication}
          setSelectedMedication={setSelectedMedication}
          setMedicationName={setMedicationName}
          setIsEditingMedication={setIsEditingMedication}
          handleDeleteMedication={handleDeleteMedication}
          setIsAddingBatch={setIsAddingBatch}
          setBatchNumber={setBatchNumber}
          setExpiryMonth={setExpiryMonth}
          setExpiryYear={setExpiryYear}
          setQuantity={setQuantity}
          setEditingBatch={setEditingBatch}
          setIsEditingBatch={setIsEditingBatch}
          handleDeleteBatch={handleDeleteBatch}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      <ModalManager
        {...medicationData}
        handleDeleteAllData={handleDeleteAllData}
        handleBarcodeScan={handleBarcodeScan}
        handleGs1Scan={handleGs1Scan}
      />

      {!selectedMedication && <ScrollToTop />}
      
      <Toast 
        isVisible={!!toast}
        message={toast?.message || ''}
        type={toast?.type || 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
