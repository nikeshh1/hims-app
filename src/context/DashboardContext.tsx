import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  getNurseDashboardMetrics,
  getVitals,
  getNurseShifts,
  getDischargePreparation,
  getPatients,
} from '../api/nurseDashboard';

export interface CriticalPatient {
  first_name: string;
  last_name: string;
  patient_code: string;
  spo2?: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
}

export interface DashboardMetrics {
  patients?: any[];
  criticalPatients?: number;
  criticalList?: CriticalPatient[];
  pendingMedications?: number;
  pendingVitals?: number;
  discharges?: number;
}

interface DashboardContextType {
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  fetchDashboardMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching dashboard metrics...');
      
      const data = await getNurseDashboardMetrics();
      console.log('✅ Dashboard metrics loaded:', data);
      
      setMetrics(data);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard';
      console.error('❌ Dashboard error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    await fetchDashboardMetrics();
  };

  return (
    <DashboardContext.Provider value={{ metrics, loading, error, fetchDashboardMetrics, refreshMetrics }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
