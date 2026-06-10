import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  getVendors,
  deleteVendor as deleteVendorApi,
  createVendor as createVendorApi,
  updateVendor as updateVendorApi,
} from '../api/vendor';

interface Vendor {
  id: string;
  vendor_name: string;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  addVendor: (data: any) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  updateVendor: (id: string, data: any) => Promise<void>;
  refreshVendors: () => Promise<void>;
}

const VendorContext = createContext<VendorContextType | null>(null);

export const VendorProvider = ({children}: {children: ReactNode}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const list = await getVendors();
      console.log('✅ VENDORS FETCHED:', list);

      if (Array.isArray(list)) {
        setVendors(list);
      } else {
        setVendors([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const addVendor = async (data: any) => {
    try {
      console.log('💾 ADDING VENDOR...', data);
      await createVendorApi(data);
      await fetchVendors();
    } catch (err) {
      console.error('❌ Failed to add vendor:', err);
      throw err;
    }
  };

  const deleteVendor = async (id: string) => {
    try {
      await deleteVendorApi(id);
      await fetchVendors();
    } catch (err) {
      console.error('❌ Failed to delete vendor:', err);
      throw err;
    }
  };

  const updateVendor = async (id: string, data: any) => {
    try {
      console.log('🔄 UPDATING VENDOR...', id, data);
      await updateVendorApi(id, data);
      await fetchVendors();
    } catch (err) {
      console.error('❌ Failed to update vendor:', err);
      throw err;
    }
  };

  return (
    <VendorContext.Provider
      value={{vendors, loading, addVendor, deleteVendor, updateVendor, refreshVendors: fetchVendors}}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const ctx = useContext(VendorContext);
  if (!ctx) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return ctx;
};
