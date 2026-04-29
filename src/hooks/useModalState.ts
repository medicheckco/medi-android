import { useEffect, useRef } from 'react';

interface ModalState {
  isAddingMedication: boolean;
  isEditingMedication: boolean;
  isAddingBatch: boolean;
  isEditingBatch: boolean;
  isScanning: boolean;
  isBulkImporting: boolean;
  isOCRScanning: boolean;
  isGS1Scanning: boolean;
  isProfileSettingsOpen: boolean;
  isImportExportOpen: boolean;
  deleteConfirmation: any;
  selectedMedication: any;
}

interface ModalActions {
  setIsAddingMedication: (v: boolean) => void;
  setIsEditingMedication: (v: boolean) => void;
  setIsAddingBatch: (v: boolean) => void;
  setIsEditingBatch: (v: boolean) => void;
  setIsScanning: (v: boolean) => void;
  setIsBulkImporting: (v: boolean) => void;
  setIsOCRScanning: (v: boolean) => void;
  setIsGS1Scanning: (v: boolean) => void;
  setIsProfileSettingsOpen: (v: boolean) => void;
  setIsImportExportOpen: (v: boolean) => void;
  setDeleteConfirmation: (v: any) => void;
  setSelectedMedication: (v: any) => void;
}

export function useModalState(state: ModalState, actions: ModalActions) {
  const {
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
  } = state;

  const {
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
  } = actions;

  // --- Disable body scroll when modal is open ---
  useEffect(() => {
    const isAnyModalOpen = 
      isAddingMedication || 
      isEditingMedication || 
      isAddingBatch || 
      isEditingBatch || 
      isScanning || 
      isBulkImporting || 
      isOCRScanning || 
      isGS1Scanning || 
      isProfileSettingsOpen || 
      isImportExportOpen ||
      !!deleteConfirmation;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [
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
    deleteConfirmation
  ]);

  // --- Back button support for mobile/PWA ---
  useEffect(() => {
    const handlePopState = () => {
      setSelectedMedication(null);
      setIsAddingMedication(false);
      setIsEditingMedication(false);
      setIsAddingBatch(false);
      setIsEditingBatch(false);
      setIsProfileSettingsOpen(false);
      setIsImportExportOpen(false);
      setIsScanning(false);
      setIsOCRScanning(false);
      setIsGS1Scanning(false);
      setIsBulkImporting(false);
      setDeleteConfirmation(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedMedication, setIsAddingMedication, setIsEditingMedication, setIsAddingBatch, setIsEditingBatch, setIsProfileSettingsOpen, setIsImportExportOpen, setIsScanning, setIsOCRScanning, setIsBulkImporting, setDeleteConfirmation]);

  // Push state whenever a modal opens to ensure back button works
  const prevModalState = useRef(false);
  useEffect(() => {
    const anyModalOpen = !!(selectedMedication || isAddingMedication || isEditingMedication || 
                         isAddingBatch || isEditingBatch || isProfileSettingsOpen || 
                         isScanning || isOCRScanning || isGS1Scanning || isBulkImporting || deleteConfirmation);
    
    if (anyModalOpen && !prevModalState.current) {
      window.history.pushState({ modal: true }, '');
    }
    prevModalState.current = anyModalOpen;
  }, [selectedMedication, isAddingMedication, isEditingMedication, isAddingBatch, isEditingBatch, isProfileSettingsOpen, isImportExportOpen, isScanning, isOCRScanning, isGS1Scanning, isBulkImporting, deleteConfirmation]);
}
