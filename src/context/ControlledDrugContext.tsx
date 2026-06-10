import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  getControlledDrugs,
  createControlledDrug as createDrugApi,
  updateControlledDrug as updateDrugApi,
  deleteControlledDrug as deleteDrugApi,
} from '../api/controlledDrug';

export interface ControlledDrug {
  controlled_drug_id: number;
  drug_name: string;
  batch_number: string;
  expiry_date: string;
  stock_quantity: number;
  vendor_id: string | null;
  vendor?: {vendor_id: number; vendor_name: string} | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ControlledDrugContextType {
  drugs: ControlledDrug[];
  loading: boolean;
  addDrug: (data: any) => Promise<void>;
  editDrug: (id: number, data: any) => Promise<void>;
  removeDrug: (id: number) => Promise<void>;
  refreshDrugs: () => Promise<void>;
}

const ControlledDrugContext = createContext<ControlledDrugContextType | null>(null);

export const ControlledDrugProvider = ({children}: {children: ReactNode}) => {
  const [drugs, setDrugs] = useState<ControlledDrug[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrugs = async () => {
    setLoading(true);
    try {
      const list = await getControlledDrugs();
      setDrugs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch controlled drugs:', err);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  const addDrug = async (data: any) => {
    await createDrugApi(data);
    await fetchDrugs();
  };

  const editDrug = async (id: number, data: any) => {
    await updateDrugApi(id, data);
    await fetchDrugs();
  };

  const removeDrug = async (id: number) => {
    await deleteDrugApi(id);
    await fetchDrugs();
  };

  return (
    <ControlledDrugContext.Provider
      value={{drugs, loading, addDrug, editDrug, removeDrug, refreshDrugs: fetchDrugs}}>
      {children}
    </ControlledDrugContext.Provider>
  );
};

export const useControlledDrugs = () => {
  const ctx = useContext(ControlledDrugContext);
  if (!ctx) {
    throw new Error('useControlledDrugs must be used within ControlledDrugProvider');
  }
  return ctx;
};
