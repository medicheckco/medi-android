import { Medication, Batch, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const REQUEST_TIMEOUT_MS = 15000;

async function apiFetch(input: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('API request timed out. Check that the backend server is running.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('meditrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiService = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User }> {
    const res = await apiFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return await res.json();
  },

  async register(email: string, password?: string, name?: string): Promise<{ user: User }> {
    const res = await apiFetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return await res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiFetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  logout() {
    localStorage.removeItem('meditrack_token');
  },

  // Medications
  async getMedications(): Promise<Medication[]> {
    const res = await apiFetch(`${API_BASE}/medications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch medications');
    return res.json();
  },

  async createMedication(medication: Medication): Promise<{ id: string }> {
    const res = await apiFetch(`${API_BASE}/medications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(medication),
    });
    if (!res.ok) throw new Error('Failed to create medication');
    return res.json();
  },

  async updateMedication(id: string, medication: Partial<Medication>): Promise<void> {
    const res = await apiFetch(`${API_BASE}/medications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(medication),
    });
    if (!res.ok) throw new Error('Failed to update medication');
  },

  async deleteMedication(id: string): Promise<void> {
    const res = await apiFetch(`${API_BASE}/medications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete medication');
  },

  // Batches
  async getBatches(): Promise<Batch[]> {
    const res = await apiFetch(`${API_BASE}/batches`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch batches');
    return res.json();
  },

  async createBatch(batch: Batch): Promise<{ id: string }> {
    const res = await apiFetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error('Failed to create batch');
    return res.json();
  },

  async updateBatch(id: string, batch: Partial<Batch>): Promise<void> {
    const res = await apiFetch(`${API_BASE}/batches/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error('Failed to update batch');
  },

  async deleteBatch(id: string): Promise<void> {
    const res = await apiFetch(`${API_BASE}/batches/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete batch');
  },

  async clearAllData(): Promise<void> {
    const response = await apiFetch(`${API_BASE}/clear`, { 
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to clear database');
  },

  async bulkImportData(data: { medications: any[], batches: any[] }): Promise<void> {
    const response = await apiFetch(`${API_BASE}/bulk-import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Bulk import failed');
    }
  },

  async getAdminStats(): Promise<any> {
    const response = await apiFetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  }
};
