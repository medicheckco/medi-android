export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  geminiScanCount?: number;
  gs1ScanCount?: number;
  role: 'admin' | 'user';
}

export interface Medication {
  id: string;
  name: string;
  barcode?: string;
  itemCode?: string;
  brandName?: string;
  supplierName?: string;
  category?: string;
  gtin?: string;
  updatedAt: number; // UNIX timestamp
  isDeleted?: boolean;
}

export interface Batch {
  id: string;
  medicationId: string;
  batchNumber: string;
  expiryDate: number; // UNIX timestamp
  quantity: number;
  status: 'active' | 'expired' | 'low-stock';
  createdAt: number;
  updatedAt: number;
  isDeleted?: boolean;
}

export interface MedicationWithBatches extends Medication {
  batches: Batch[];
}

export interface UserStats {
  uid: string;
  email: string | null;
  displayName: string | null;
  medicationCount: number;
  batchCount: number;
  geminiScanCount: number;
  gs1ScanCount: number;
  lastLogin: any;
  role: 'admin' | 'user';
}
