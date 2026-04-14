import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  getDischargeAdmissions as getAdmissionsApi,
  getDischargePreparation as getPrepApi,
  createDischargePreparation as createPrepApi,
  updateDischargePreparation as updatePrepApi,
  markDischargeReady as markReadyApi,
  dischargePatient as dischargePatientApi,
} from '../api/dischargePreparation';

export interface ChecklistItem {
  id?: string;
  name: string;
  completed: boolean;
}

export interface DischargePreparation {
  id?: string;
  hospital_id?: string;
  patient_id: string;
  ipd_admission_id: string;
  nurse_id: string;
  checklist?: ChecklistItem[];
  belongings_status: boolean;
  status: 'pending' | 'in_progress' | 'ready';
  is_ready: boolean;
  prepared_at?: string;
  created_at?: string;
  updated_at?: string;
  patient?: any;
}

export interface IPDAdmission {
  id: string;
  admission_id?: string;
  ipd_id?: string;
  patient_id: string;
  patient_name?: string;
  patient?: any;
  bed?: any;
  ward?: string;
  status: string;
  admission_date?: string;
  discharge_preparation?: DischargePreparation;
}

interface DischargeContextType {
  admissions: IPDAdmission[];
  currentDischarge: DischargePreparation | null;
  loading: boolean;
  error: string | null;
  fetchAdmissions: () => Promise<void>;
  fetchDischargePrep: (ipdId: string) => Promise<void>;
  saveDischargePrep: (data: DischargePreparation) => Promise<any>;
  markReady: (id: string) => Promise<any>;
  dischargePatient: (admissionId: string) => Promise<void>;
  refreshAdmissions: () => Promise<void>;
}

const DischargeContext = createContext<DischargeContextType | null>(null);

export const DischargeProvider = ({ children }: { children: ReactNode }) => {
  const [admissions, setAdmissions] = useState<IPDAdmission[]>([]);
  const [currentDischarge, setCurrentDischarge] = useState<DischargePreparation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdmissionsApi();
      let data = response.data?.data || response.data || [];
      console.log('Raw admissions response:', data);
      
      // Transform the data: the backend returns status directly on admission
      // but our code expects discharge_preparation object
      if (Array.isArray(data)) {
        data = data.map((item: any) => ({
          ...item,
          // Create discharge_preparation object from top-level status fields
          discharge_preparation: item.status ? {
            status: item.status,
            is_ready: item.status === 'ready',
            id: item.ipd_id,
          } : null,
        }));
      }
      
      console.log('Transformed admissions:', data);
      setAdmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch admissions';
      setError(errorMsg);
      console.error('Failed to fetch admissions:', err);
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDischargePrep = async (ipdId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPrepApi(ipdId);
      const prep = response.data?.data || response.data || null;
      setCurrentDischarge(prep);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch discharge preparation';
      setError(errorMsg);
      console.error('Failed to fetch discharge prep:', err);
      setCurrentDischarge(null);
    } finally {
      setLoading(false);
    }
  };

  const saveDischargePrep = async (data: DischargePreparation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createPrepApi(data);
      console.log('Save response:', response.data);
      
      // After saving, refetch all admissions to get fresh data
      const admissionsResponse = await getAdmissionsApi();
      let freshAdmissions = admissionsResponse.data?.data || [];
      let updatedData = Array.isArray(freshAdmissions) ? freshAdmissions : [freshAdmissions];
      
      // Transform the data to add discharge_preparation object
      updatedData = updatedData.map((item: any) => ({
        ...item,
        discharge_preparation: item.status ? {
          status: item.status,
          is_ready: item.status === 'ready',
          id: item.ipd_id,
        } : null,
      }));
      
      console.log('Refetched all admissions after save:', updatedData);
      setAdmissions(updatedData);
      
      // Return the specific admission with updated prep data
      const admissionIdToFind = data.ipd_admission_id;
      console.log('Looking for admission with ID:', admissionIdToFind);
      
      const updatedAdmission = updatedData.find((adm: any) => 
        adm.ipd_id === admissionIdToFind || 
        adm.id === admissionIdToFind || 
        adm.admission_id === admissionIdToFind
      );
      
      console.log('Found admission after save:', updatedAdmission);
      return updatedAdmission?.discharge_preparation || response.data?.data || data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save discharge preparation';
      setError(errorMsg);
      console.error('Failed to save discharge prep:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markReady = async (admissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Calling markReadyApi for:', admissionId);
      const response = await markReadyApi(admissionId);
      console.log('Mark ready response:', response.data);
      
      // Refetch fresh data after marking ready
      const admissionsResponse = await getAdmissionsApi();
      let freshAdmissions = admissionsResponse.data?.data || [];
      let updatedData = Array.isArray(freshAdmissions) ? freshAdmissions : [freshAdmissions];
      
      // Transform the data to add discharge_preparation object
      updatedData = updatedData.map((item: any) => ({
        ...item,
        discharge_preparation: item.status ? {
          status: item.status,
          is_ready: item.status === 'ready',
          id: item.ipd_id,
        } : null,
      }));
      
      console.log('Refetched all admissions after mark ready:', updatedData);
      setAdmissions(updatedData);
      
      // Find and return the updated admission's discharge prep
      const updatedAdmission = updatedData.find((adm: any) => 
        adm.ipd_id === admissionId || 
        adm.id === admissionId || 
        adm.admission_id === admissionId
      );
      
      console.log('Found updated admission after mark ready:', updatedAdmission);
      const resultPrep = updatedAdmission?.discharge_preparation;
      
      if (resultPrep) {
        setCurrentDischarge(resultPrep);
      }
      
      return resultPrep;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mark as ready';
      setError(errorMsg);
      console.error('Failed to mark ready:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const dischargePatient = async (admissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await dischargePatientApi(admissionId);
      // Remove from admissions list
      setAdmissions(admissions.filter(adm => adm.id !== admissionId));
      setCurrentDischarge(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to discharge patient';
      setError(errorMsg);
      console.error('Failed to discharge patient:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshAdmissions = async () => {
    await fetchAdmissions();
  };

  return (
    <DischargeContext.Provider value={{
      admissions,
      currentDischarge,
      loading,
      error,
      fetchAdmissions,
      fetchDischargePrep,
      saveDischargePrep,
      markReady,
      dischargePatient,
      refreshAdmissions,
    }}>
      {children}
    </DischargeContext.Provider>
  );
};

export const useDischarge = () => {
  const context = useContext(DischargeContext);
  if (!context) {
    throw new Error('useDischarge must be used within DischargeProvider');
  }
  return context;
};
