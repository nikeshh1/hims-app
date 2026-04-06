import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getMedicationAdministrations,
  createMedicationAdministration as createMedApi,
  updateMedicationAdministration as updateMedApi,
  deleteMedicationAdministration as deleteMedApi,
  getMedicationAdministrationByPatient,
  getMedicationAdministrationByStatus,
} from '../api/medicationAdministration';

export interface MedicationAdministration {
  id: string;
  patient_id: string;
  nurse_id: string;
  prescription_item_id: string;
  administered_time: string;
  status: 'administered' | 'pending' | 'skipped' | 'refused';
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: any;
  nurse?: any;
}

interface MedicationContextType {
  medications: MedicationAdministration[];
  loading: boolean;
  error: string | null;
  addMedication: (data: any) => Promise<void>;
  editMedication: (id: string, data: any) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  getMedicationsByStatus: (status: string) => Promise<void>;
  getMedicationsByPatient: (patientId: string) => Promise<void>;
  refreshMedications: () => Promise<void>;
}

const MedicationContext = createContext<MedicationContextType | null>(null);

export const MedicationProvider = ({ children }: { children: ReactNode }) => {
  const [medications, setMedications] = useState<MedicationAdministration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMedicationAdministrations();
      setMedications(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch medications';
      setError(errorMsg);
      console.error('Failed to fetch medications:', err);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const newMed = await createMedApi(data);
      setMedications([...medications, newMed]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add medication';
      setError(errorMsg);
      console.error('Failed to add medication:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editMedication = async (id: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateMedApi(id, data);
      setMedications(medications.map(m => m.id === id ? updated : m));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update medication';
      setError(errorMsg);
      console.error('Failed to update medication:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMedication = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMedApi(id);
      setMedications(medications.filter(m => m.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete medication';
      setError(errorMsg);
      console.error('Failed to delete medication:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMedicationsByStatus = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMedicationAdministrationByStatus(status);
      setMedications(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to fetch medications with status ${status}`;
      setError(errorMsg);
      console.error('Failed to fetch medications by status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedicationsByPatient = async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMedicationAdministrationByPatient(patientId);
      setMedications(Array.isArray(list) ? list : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch patient medications';
      setError(errorMsg);
      console.error('Failed to fetch medications by patient:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  return (
    <MedicationContext.Provider
      value={{
        medications,
        loading,
        error,
        addMedication,
        editMedication,
        removeMedication,
        getMedicationsByStatus,
        getMedicationsByPatient,
        refreshMedications: fetchMedications,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedicationAdministration = () => {
  const ctx = useContext(MedicationContext);
  if (!ctx) {
    throw new Error('useMedicationAdministration must be used within MedicationProvider');
  }
  return ctx;
};
