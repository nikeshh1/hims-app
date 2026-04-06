import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  getVitals,
  deleteVital as deleteVitalApi,
  createVital as createVitalApi,
  updateVital as updateVitalApi,
} from '../api/vitals';

export interface Vital {
  id: string;
  institution_id: string;
  patient_id: string;
  nurse_id: string;
  temperature: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
  respiratory_rate?: number;
  spo2?: number;
  blood_sugar?: number;
  weight?: number;
  recorded_at: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  patient?: {id: string; patient_code: string; first_name: string; last_name: string; blood_group?: string};
  nurse?: {id: string; name: string};
}

interface VitalsContextType {
  vitals: Vital[];
  loading: boolean;
  addVital: (data: any) => Promise<void>;
  editVital: (id: string, data: any) => Promise<void>;
  removeVital: (id: string) => Promise<void>;
  refreshVitals: () => Promise<void>;
}

const VitalsContext = createContext<VitalsContextType | null>(null);

export const VitalsProvider = ({children}: {children: ReactNode}) => {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVitals = async () => {
    setLoading(true);
    try {
      const res = await getVitals();
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setVitals(list);
      } else {
        setVitals([]);
      }
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
      setVitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const addVital = async (data: any) => {
    await createVitalApi(data);
    await fetchVitals();
  };

  const removeVital = async (id: string) => {
    await deleteVitalApi(id);
    await fetchVitals();
  };

  const editVital = async (id: string, data: any) => {
    await updateVitalApi(id, data);
    await fetchVitals();
  };

  return (
    <VitalsContext.Provider
      value={{
        vitals,
        loading,
        addVital,
        editVital,
        removeVital,
        refreshVitals: fetchVitals,
      }}>
      {children}
    </VitalsContext.Provider>
  );
};

export const useVitals = () => {
  const ctx = useContext(VitalsContext);
  if (!ctx) throw new Error('useVitals must be used within VitalsProvider');
  return ctx;
};
