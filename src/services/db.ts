import Dexie, { type Table } from 'dexie';
import { Medication, Batch } from '../types';

export class LocalDatabase extends Dexie {
  medications!: Table<Medication, string>;
  batches!: Table<Batch, string>;
  syncMetadata!: Table<{ id: string; lastSync: number }, string>;

  constructor() {
    super('MediTrackDB');
    this.version(1).stores({
      medications: 'id, name, barcode, gtin, itemCode, updatedAt',
      batches: 'id, medicationId, batchNumber, updatedAt, expiryDate',
      syncMetadata: 'id'
    });
  }

  async getLastSync(type: 'medications' | 'batches'): Promise<number> {
    const meta = await this.syncMetadata.get(type);
    return meta ? meta.lastSync : 0;
  }

  async setLastSync(type: 'medications' | 'batches', timestamp: number) {
    await this.syncMetadata.put({ id: type, lastSync: timestamp });
  }

  async clearAll() {
    await this.medications.clear();
    await this.batches.clear();
    await this.syncMetadata.clear();
  }
}

export const localDB = new LocalDatabase();
