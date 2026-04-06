import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getIsolationRecords,
  createIsolationRecord as createIsoApi,
  updateIsolationRecord as updateIsoApi,
  deleteIsolationRecord as deleteIsoApi,
  getIsolationRecordByPatient,
  getActiveIsolationRecords,
} from '../api/isolationRecords';

export interface IsolationRecord {
  id: string;
  patient_id: string;
  nurse_id: string;
  isolation_type: string; // e.g., 'contact', 'droplet', 'airborne', 'standard'
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'discontinued';
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  nurse?: any;
}

interface IsolationContextType {
  records: IsolationRecord[];
  loading: boolean;
  error: string | null;
  addRecord: (data: any) => Promise<void>;
  editRecord: (id: string, data: any) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  getActiveRecords: () => Promise<void>;
  getRecordsByPatient: (patientId: string) => Promise<void>;
  refreshRecords: () => Promise<void>;
}

const IsolationContext = createContext<IsolationContextType | null>(null);

export const IsolationProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<IsolationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getIsolationRecords();
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch isolation records';
      setError(errorMsg);
      console.error('Failed to fetch isolation records:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newRecord = await createIsoApi(data);
      setRecords([...records, newRecord]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add isolation record';
      setError(errorMsg);
      console.error('Failed to add isolation record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editRecord = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateIsoApi(id, data);
      setRecords(records.map(r => r.id === id ? updated : r));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update isolation record';
      setError(errorMsg);
      console.error('Failed to update isolation record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeRecord = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteIsoApi(id);
      setRecords(records.filter(r => r.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete isolation record';
      setError(errorMsg);
      console.error('Failed to delete isolation record:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getActiveRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getActiveIsolationRecords();
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch active isolation records';
      setError(errorMsg);
      console.error('Failed to fetch active isolation records:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRecordsByPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getIsolationRecordByPatient(patientId);
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch patient isolation records';
      setError(errorMsg);
      console.error('Failed to fetch isolation records by patient:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <IsolationContext.Provider
      value={{
        records,
        loading,
        error,
        addRecord,
        editRecord,
        removeRecord,
        getActiveRecords,
        getRecordsByPatient,
        refreshRecords: fetchRecords,
      }}
    >
      {children}
    </IsolationContext.Provider>
  );
};

export const useIsolationRecords = () => {
  const ctx = useContext(IsolationContext);
  if (!ctx) {
    throw new Error('useIsolationRecords must be used within IsolationProvider');
  }
  return ctx;
};
