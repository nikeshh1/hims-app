import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getPpeLogs,
  createPpeLog as createPpeApi,
  updatePpeLog as updatePpeApi,
  deletePpeLog as deletePpeApi,
  getPpeLogByPatient,
  getPpeLogByStatus,
  getPpeComplianceReport,
} from '../api/ppeCompliance';

export interface PpeComplianceLog {
  id: string;
  patient_id: string;
  nurse_id: string;
  ppe_used: boolean;
  ppe_type: string; // e.g., 'mask', 'gloves', 'gown', 'shield', 'all'
  compliance_status: 'compliant' | 'non-compliant' | 'partial';
  notes?: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  nurse?: any;
}

interface PpeContextType {
  logs: PpeComplianceLog[];
  loading: boolean;
  error: string | null;
  addLog: (data: any) => Promise<void>;
  editLog: (id: string, data: any) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  getLogsByStatus: (status: string) => Promise<void>;
  getLogsByPatient: (patientId: string) => Promise<void>;
  getComplianceReport: (startDate?: string, endDate?: string) => Promise<any>;
  refreshLogs: () => Promise<void>;
}

const PpeContext = createContext<PpeContextType | null>(null);

export const PpeProvider = ({ children }: { children: ReactNode }) => {
  const [logs, setLogs] = useState<PpeComplianceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getPpeLogs();
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch PPE compliance logs';
      setError(errorMsg);
      console.error('Failed to fetch PPE compliance logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newLog = await createPpeApi(data);
      setLogs([...logs, newLog]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add PPE compliance log';
      setError(errorMsg);
      console.error('Failed to add PPE compliance log:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editLog = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updatePpeApi(id, data);
      setLogs(logs.map(l => l.id === id ? updated : l));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update PPE compliance log';
      setError(errorMsg);
      console.error('Failed to update PPE compliance log:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeLog = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePpeApi(id);
      setLogs(logs.filter(l => l.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete PPE compliance log';
      setError(errorMsg);
      console.error('Failed to delete PPE compliance log:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLogsByStatus = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getPpeLogByStatus(status);
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to fetch PPE logs with status ${status}`;
      setError(errorMsg);
      console.error('Failed to fetch PPE logs by status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLogsByPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getPpeLogByPatient(patientId);
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch patient PPE logs';
      setError(errorMsg);
      console.error('Failed to fetch PPE logs by patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceReport = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const report = await getPpeComplianceReport(startDate, endDate);
      return report;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch PPE compliance report';
      setError(errorMsg);
      console.error('Failed to fetch PPE compliance report:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <PpeContext.Provider
      value={{
        logs,
        loading,
        error,
        addLog,
        editLog,
        removeLog,
        getLogsByStatus,
        getLogsByPatient,
        getComplianceReport,
        refreshLogs: fetchLogs,
      }}
    >
      {children}
    </PpeContext.Provider>
  );
};

export const usePpeCompliance = () => {
  const ctx = useContext(PpeContext);
  if (!ctx) {
    throw new Error('usePpeCompliance must be used within PpeProvider');
  }
  return ctx;
};
