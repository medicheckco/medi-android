import { AnimatePresence } from 'motion/react';
import { MedicationForm } from './MedicationForm';
import { BatchForm } from './BatchForm';
import { BarcodeScanner } from './BarcodeScanner';
import { BatchOCRScanner } from './BatchOCRScanner';
import { GS1Scanner } from './GS1Scanner';
import { BulkImportModal } from './BulkImportModal';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { ConfirmationModal } from './ConfirmationModal';

interface ModalManagerProps {
  user: any;
  isProfileSettingsOpen: boolean;
  setIsProfileSettingsOpen: (v: boolean) => void;
  geminiScanCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  handleDeleteAllData: () => void;
  hardSync: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isBulkImporting: boolean;
  setIsBulkImporting: (v: boolean) => void;
  handleBulkImport: (data: any[], onProgress?: any) => Promise<any>;
  isAddingMedication: boolean;
  isEditingMedication: boolean;
  selectedMedication: any;
  medicationName: string;
  scannedBarcode: string;
  gtinValue: string;
  isSubmitting: boolean;
  setMedicationName: (v: string) => void;
  setScannedBarcode: (v: string) => void;
  setGtinValue: (v: string) => void;
  setIsScanning: (v: boolean) => void;
  setIsAddingMedication: (v: boolean) => void;
  setIsEditingMedication: (v: boolean) => void;
  setSelectedMedication: (v: any) => void;
  handleSaveMedication: (e: any) => void;
  isAddingBatch: boolean;
  isEditingBatch: boolean;
  editingBatch: any;
  batchNumber: string;
  expiryMonth: string;
  expiryYear: string;
  quantity: string;
  setBatchNumber: (v: string) => void;
  setExpiryMonth: (v: string) => void;
  setExpiryYear: (v: string) => void;
  setQuantity: (v: string) => void;
  setIsAddingBatch: (v: boolean) => void;
  setIsEditingBatch: (v: boolean) => void;
  setEditingBatch: (v: any) => void;
  handleSaveBatch: (e: any) => void;
  setIsOCRScanning: (v: boolean) => void;
  setIsGS1Scanning: (v: boolean) => void;
  isScanning: boolean;
  handleBarcodeScan: (barcode: string) => void;
  handleGs1Scan: (data: any) => void;
  isOCRScanning: boolean;
  incrementGeminiScanCount: (input?: number, output?: number) => void;
  isGS1Scanning: boolean;
  isGTINScanning: boolean;
  setIsGTINScanning: (v: boolean) => void;
  deleteConfirmation: any;
  setDeleteConfirmation: (v: any) => void;
  confirmDelete: () => void;
}

export function ModalManager(props: ModalManagerProps) {
  const {
    user,
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
    geminiScanCount,
    totalInputTokens,
    totalOutputTokens,
    handleDeleteAllData,
    hardSync,
    showToast,
    isBulkImporting,
    setIsBulkImporting,
    handleBulkImport,
    isAddingMedication,
    isEditingMedication,
    selectedMedication,
    medicationName,
    scannedBarcode,
    gtinValue,
    isSubmitting,
    setMedicationName,
    setScannedBarcode,
    setGtinValue,
    setIsScanning,
    setIsAddingMedication,
    setIsEditingMedication,
    setSelectedMedication,
    handleSaveMedication,
    isAddingBatch,
    isEditingBatch,
    editingBatch,
    batchNumber,
    expiryMonth,
    expiryYear,
    quantity,
    setBatchNumber,
    setExpiryMonth,
    setExpiryYear,
    setQuantity,
    setIsAddingBatch,
    setIsEditingBatch,
    setEditingBatch,
    handleSaveBatch,
    setIsOCRScanning,
    setIsGS1Scanning,
    isScanning,
    handleBarcodeScan,
    handleGs1Scan,
    isOCRScanning,
    incrementGeminiScanCount,
    isGS1Scanning,
    isGTINScanning,
    setIsGTINScanning,
    deleteConfirmation,
    setDeleteConfirmation,
    confirmDelete
  } = props;

  return (
    <AnimatePresence>
      {isProfileSettingsOpen && (
        <ProfileSettingsModal
          key="modal-profile"
          user={user}
          geminiScanCount={geminiScanCount}
          totalInputTokens={totalInputTokens}
          totalOutputTokens={totalOutputTokens}
          onClose={() => setIsProfileSettingsOpen(false)}
          onDeleteAllData={handleDeleteAllData}
          onHardSync={hardSync}
          showToast={showToast}
        />
      )}
      {isBulkImporting && (
        <BulkImportModal
          key="modal-bulk-import"
          onImport={handleBulkImport}
          onClose={() => setIsBulkImporting(false)}
        />
      )}
      {isAddingMedication && (
        <MedicationForm
          key="modal-medication-form"
          isEditing={isEditingMedication}
          medication={selectedMedication}
          medicationName={medicationName}
          scannedBarcode={scannedBarcode}
          gtinValue={gtinValue}
          isSubmitting={isSubmitting}
          onMedicationNameChange={setMedicationName}
          onBarcodeChange={setScannedBarcode}
          onGtinChange={setGtinValue}
          onScanBarcode={() => setIsScanning(true)}
          onScanGTIN={() => setIsGTINScanning(true)}
          onClose={() => {
            setIsAddingMedication(false);
            // If we're not editing, clear the selection (for fresh "Add New" cases)
            // But if we're editing, we want to stay on the medication's detail page
            if (!isEditingMedication) {
              setSelectedMedication(null);
            }
            setIsEditingMedication(false);
            setMedicationName('');
            setScannedBarcode('');
            setGtinValue('');
          }}
          onSubmit={handleSaveMedication}
        />
      )}

      {isAddingBatch && selectedMedication && (
        <BatchForm
          key="modal-batch-form"
          isEditing={isEditingBatch}
          medicationName={selectedMedication.name}
          batchNumber={batchNumber}
          expiryMonth={expiryMonth}
          expiryYear={expiryYear}
          quantity={quantity}
          isSubmitting={isSubmitting}
          onBatchNumberChange={setBatchNumber}
          onExpiryMonthChange={setExpiryMonth}
          onExpiryYearChange={setExpiryYear}
          onQuantityChange={setQuantity}
          onStartOCR={() => setIsOCRScanning(true)}
          onStartGS1={() => setIsGS1Scanning(true)}
          onClose={() => {
            setIsAddingBatch(false);
            setIsEditingBatch(false);
            setEditingBatch(null);
          }}
          onSubmit={handleSaveBatch}
        />
      )}

      {isScanning && (
        <BarcodeScanner 
          key="modal-barcode-scanner"
          onScan={handleBarcodeScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {isGTINScanning && (
        <GS1Scanner 
          key="modal-gtin-scanner"
          title="GTIN 2D Scan"
          subtitle="GS1 DataMatrix Scanner"
          onScan={(details) => {
            if (details.gtin) {
              setGtinValue(details.gtin);
              setIsGTINScanning(false);
            }
          }} 
          onClose={() => setIsGTINScanning(false)} 
        />
      )}

      {isOCRScanning && (
        <BatchOCRScanner
          key="modal-ocr-scanner"
          onScan={(details) => {
            if (details.batchNumber) setBatchNumber(details.batchNumber);
            if (details.expiryMonth) setExpiryMonth(details.expiryMonth.toString());
            if (details.expiryYear) setExpiryYear(details.expiryYear.toString());
            setQuantity('');
          }}
          onClose={() => setIsOCRScanning(false)}
          onGeminiScan={incrementGeminiScanCount}
        />
      )}

      {isGS1Scanning && (
        <GS1Scanner
          key="modal-gs1-scanner"
          onScan={handleGs1Scan}
          onClose={() => setIsGS1Scanning(false)}
        />
      )}

      {deleteConfirmation && (
        <ConfirmationModal
          key="modal-confirmation"
          title={deleteConfirmation.title}
          message={deleteConfirmation.message}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </AnimatePresence>
  );
}
