import { useState, useEffect } from 'react';
import { Medication, Batch } from '../types';
import { getMillis } from '../lib/utils';
import { useAuth } from './useAuth';
import { useGeminiStats } from './useGeminiStats';
import { useMedicationActions } from './useMedicationActions';
import { localDB } from '../services/db';
import { apiService } from '../services/api';

export function useMedicationData() {
  const { user, loading } = useAuth();
  const { geminiScanCount, totalInputTokens, totalOutputTokens, incrementGeminiScanCount } = useGeminiStats(user);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [isEditingMedication, setIsEditingMedication] = useState(false);
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [isOCRScanning, setIsOCRScanning] = useState(false);
  const [isGS1Scanning, setIsGS1Scanning] = useState(false);
  const [isGTINScanning, setIsGTINScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [gtinValue, setGtinValue] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState((new Date().getMonth() + 1).toString());
  const [expiryYear, setExpiryYear] = useState(new Date().getFullYear().toString());
  const [quantity, setQuantity] = useState('');
  
  const [sortBy, setSortBy] = useState<'near-expiry' | 'far-expiry' | 'less-qty' | 'more-qty' | 'newest' | 'zero-stock'>('near-expiry');
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    type: 'medication' | 'batch' | 'all';
    title: string;
    message: string;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const { handleSaveMedication, handleSaveBatch, confirmDelete, handleBulkImport } = useMedicationActions(user, medications, batches, showToast);

  const fetchData = async () => {
    setIsDataLoading(true);
    try {
      setLoadingProgress(30);
      const [meds, batchList] = await Promise.all([
        apiService.getMedications(),
        apiService.getBatches()
      ]);
      
      setLoadingProgress(70);
      setMedications(meds.sort((a, b) => a.name.localeCompare(b.name)));
      setBatches(batchList.sort((a, b) => a.expiryDate - b.expiryDate));
      
      // Also sync to local DB for offline access
      await localDB.medications.bulkPut(meds);
      await localDB.batches.bulkPut(batchList);
      
      setLoadingProgress(100);
    } catch (err) {
      console.error("Fetch error:", err);
      // Fallback to local DB if API fails
      const [localMeds, localBatches] = await Promise.all([
        localDB.medications.toArray(),
        localDB.batches.toArray()
      ]);
      setMedications(localMeds.sort((a, b) => a.name.localeCompare(b.name)));
      setBatches(localBatches.sort((a, b) => a.expiryDate - b.expiryDate));
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsDataLoading(false);
      setMedications([]);
      setBatches([]);
      return;
    }

    fetchData();
  }, [user, loading]);

  useEffect(() => {
    if (isEditingMedication && selectedMedication) {
      setMedicationName(selectedMedication.name);
      setScannedBarcode(selectedMedication.barcode || '');
      setGtinValue(selectedMedication.gtin || '');
    }
  }, [isEditingMedication, selectedMedication]);

  return {
    user,
    loading,
    isDataLoading,
    loadingProgress,
    error,
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
    gtinValue,
    setGtinValue,
    isBulkImporting,
    setIsBulkImporting,
    isOCRScanning,
    setIsOCRScanning,
    isGS1Scanning,
    setIsGS1Scanning,
    isGTINScanning,
    setIsGTINScanning,
    isSubmitting,
    batchNumber,
    setBatchNumber,
    expiryMonth,
    setExpiryMonth,
    expiryYear,
    setExpiryYear,
    quantity,
    setQuantity,
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
    handleSaveMedication: (e: React.FormEvent<HTMLFormElement>) => 
      handleSaveMedication(e, isEditingMedication, selectedMedication, (med) => {
        if (med) setSelectedMedication(med);
        setIsAddingMedication(false);
        setIsEditingMedication(false);
        setScannedBarcode('');
        setGtinValue('');
        setMedicationName('');
        setSearchTerm('');
        setActiveSearchTerm('');
        setShowAll(true);
        setCurrentPage(1);
      }, setIsSubmitting),
    handleSaveBatch: (e: React.FormEvent<HTMLFormElement>) => 
      handleSaveBatch(e, selectedMedication, isEditingBatch, editingBatch, quantity, () => {
        setIsAddingBatch(false);
        setIsEditingBatch(false);
        setEditingBatch(null);
        setQuantity('');
        setSearchTerm('');
        setActiveSearchTerm('');
        setCurrentPage(1);
      }, setIsSubmitting),
    confirmDelete: () => confirmDelete(deleteConfirmation, () => {
      if (deleteConfirmation?.type === 'medication' && selectedMedication?.id === deleteConfirmation.id) {
        setSelectedMedication(null);
      } else if (deleteConfirmation?.type === 'all') {
        setSelectedMedication(null);
        setMedications([]);
        setBatches([]);
        setIsProfileSettingsOpen(false);
      }
      setDeleteConfirmation(null);
    }, setIsSubmitting),
    handleBulkImport: async (data: any[], onProgress?: any) => {
      const report = await handleBulkImport(data, onProgress);
      // Refresh data after import
      await fetchData();
      return report;
    },
    hardSync: async () => {
      setIsDataLoading(true);
      setLoadingProgress(10);
      try {
        await localDB.clearAll();
        setMedications([]);
        setBatches([]);
        // Reloading the page is the most robust way to restart all watchers and clear IndexedDB
        window.location.reload();
      } catch (e) {
        showToast("Hard sync failed", "error");
        setIsDataLoading(false);
      }
    },
    toast,
    setToast,
    showToast,
    resetFilters: () => {
      setSearchTerm('');
      setActiveSearchTerm('');
      setShowAll(true);
      setSelectedCategory('All');
      setSelectedBrand('All');
      setCurrentPage(1);
      setSelectedMedication(null);
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
    },
    resetToDashboard: () => {
      setSearchTerm('');
      setActiveSearchTerm('');
      setSelectedMedication(null);
      setSortBy('near-expiry');
      setShowAll(false);
      setCurrentPage(1);
      setSelectedCategory('All');
      setSelectedBrand('All');
      setIsAddingMedication(false);
      setIsAddingBatch(false);
      setIsEditingMedication(false);
      setIsEditingBatch(false);
      setIsScanning(false);
      setIsBulkImporting(false);
      setIsImportExportOpen(false);
      setIsOCRScanning(false);
      setIsGS1Scanning(false);
      setIsGTINScanning(false);
      setScannedBarcode('');
      setGtinValue('');
      setMedicationName('');
      setQuantity('');
      setEditingBatch(null);
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
    }
  };
}
