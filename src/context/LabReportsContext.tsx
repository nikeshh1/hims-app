import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getLabReports,
  getLabResults,
  deleteLabReport as deleteLabReportApi,
  createLabReport as createLabReportApi,
  updateLabReport as updateLabReportApi,
} from '../api/labReports';

export interface LabReportData {
  id: string;
  type: 'lab' | 'radiology';
  sample_id?: string;
  scan_request_id?: string;
  test_name?: string;
  test_type?: string;
  patient_id?: string;
  nurse_id?: string;
  status: string;
  priority?: string;
  result_data?: {
    observations?: string;
    findings?: string;
    diagnosis?: string;
    WBC?: string;
    RBC?: string;
    [key: string]: any;
  };
  entered_at?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  patient?: {
    id: string;
    patient_code: string;
    first_name: string;
    last_name: string;
    blood_group?: string;
  };
  nurse?: {
    id: string;
    name: string;
  };
}

interface LabReportsContextType {
  labReports: LabReportData[];
  loading: boolean;
  addLabReport: (data: any) => Promise<void>;
  editLabReport: (id: string, data: any) => Promise<void>;
  removeLabReport: (id: string) => Promise<void>;
  refreshLabReports: () => Promise<void>;
}

const LabReportsContext = createContext<LabReportsContextType | null>(null);

export const LabReportsProvider = ({ children }: { children: ReactNode }) => {
  const [labReports, setLabReports] = useState<LabReportData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLabReports = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching lab reports...');
      const list = await getLabReports();
      
      if (Array.isArray(list) && list.length > 0) {
        console.log(`✅ Successfully fetched ${list.length} lab reports`);
        setLabReports(list);
      } else if (Array.isArray(list)) {
        console.warn('⚠️ No lab reports found in database');
        setLabReports([]);
      } else {
        console.warn('⚠️ Unexpected response format:', list);
        setLabReports([]);
      }
    } catch (err: any) {
      console.error('❌ Error fetching lab reports:', err?.message);
      setLabReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabReports();
  }, []);

  const addLabReport = async (data: any) => {
    await createLabReportApi(data);
    await fetchLabReports();
  };

  const removeLabReport = async (id: string) => {
    await deleteLabReportApi(id);
    await fetchLabReports();
  };

  const editLabReport = async (id: string, data: any) => {
    await updateLabReportApi(id, data);
    await fetchLabReports();
  };

  return (
    <LabReportsContext.Provider
      value={{
        labReports,
        loading,
        addLabReport,
        editLabReport,
        removeLabReport,
        refreshLabReports: fetchLabReports,
      }}>
      {children}
    </LabReportsContext.Provider>
  );
};

export const useLabReports = () => {
  const ctx = useContext(LabReportsContext);
  if (!ctx) throw new Error('useLabReports must be used within LabReportsProvider');
  return ctx;
};
