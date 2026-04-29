export function medicationToClient(row) {
  return {
    id: row.id,
    name: row.name,
    barcode: row.barcode || '',
    itemCode: row.item_code || '',
    brandName: row.brand_name || '',
    supplierName: row.supplier_name || '',
    category: row.category || '',
    gtin: row.gtin || '',
    updatedAt: Number(row.updated_at_ms),
    isDeleted: row.is_deleted,
  };
}

export function batchToClient(row) {
  return {
    id: row.id,
    medicationId: row.medication_id,
    batchNumber: row.batch_number,
    expiryDate: Number(row.expiry_date_ms),
    quantity: Number(row.quantity),
    status: row.status,
    createdAt: Number(row.created_at_ms),
    updatedAt: Number(row.updated_at_ms),
    isDeleted: row.is_deleted,
  };
}

export function msToDate(ms) {
  if (!Number.isFinite(Number(ms))) return null;
  return new Date(Number(ms)).toISOString().slice(0, 10);
}
