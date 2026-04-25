import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  getVitalsReport,
  getVitalsPatients,
  getMedicationsReport,
  getShiftReport,
  getPatientSummary,
} from '../api/nurseReports';

export interface VitalReportData {
  id: string;
  patient_id: string;
  patient_name: string;
  nurse_id: string;
  nurse_name: string;
  temperature: number;
  blood_pressure: string;
  pulse: number;
  spo2: number;
  recorded_at: string;
}

export interface MedicationReportData {
  id: string;
  patient_id: string;
  patient_name: string;
  nurse_id: string;
  nurse_name: string;
  prescription_item_id: string;
  medication_name: string;
  status: string;
  administered_time: string;
  notes?: string;
}

export interface ShiftReportData {
  id: string;
  shift_assignment_id: string;
  nurse_name: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  entry_type: string;
  description: string;
  task_status: string;
  created_at: string;
}

export interface PatientSummaryData {
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    patient_code?: string;
    age?: number;
    gender?: string;
  };
  vitals?: VitalReportData[];
  medications?: MedicationReportData[];
  notes?: any[];
  patients?: { [key: string]: string };
}

type PatientMap = { [key: string]: string };

interface NurseReportsContextType {
  vitalsReport: VitalReportData[];
  medicationsReport: MedicationReportData[];
  shiftReport: ShiftReportData[];
  patientSummary: PatientSummaryData;
  loading: boolean;
  vitalsPatients: PatientMap;
  fetchVitalsReport: (patientId?: string, from?: string, to?: string) => Promise<void>;
  fetchMedicationsReport: (patientId?: string, status?: string) => Promise<void>;
  fetchShiftReport: (entryType?: string, taskStatus?: string) => Promise<void>;
  fetchPatientSummary: (patientId?: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

const NurseReportsContext = createContext<NurseReportsContextType | null>(null);

const normalizePatients = (patients: any): PatientMap => {
  if (!patients) return {};

  if (Array.isArray(patients)) {
    return patients.reduce((acc: PatientMap, patient: any) => {
      const id = patient?.id || patient?.patient_id;
      if (!id) return acc;

      const name =
        patient?.patient_name ||
        [patient?.first_name, patient?.last_name].filter(Boolean).join(' ') ||
        patient?.name ||
        patient?.patient_code ||
        id;

      acc[id] = name;
      return acc;
    }, {});
  }

  if (typeof patients === 'object') {
    return Object.entries(patients).reduce((acc: PatientMap, [id, value]) => {
      if (!id) return acc;

      if (typeof value === 'string') {
        acc[id] = value;
      } else if (value && typeof value === 'object') {
        const patient = value as any;
        acc[id] =
          patient?.patient_name ||
          [patient?.first_name, patient?.last_name].filter(Boolean).join(' ') ||
          patient?.name ||
          patient?.patient_code ||
          id;
      }

      return acc;
    }, {});
  }

  return {};
};

const getPatientsFromVitals = (vitals: VitalReportData[]): PatientMap =>
  vitals.reduce((acc: PatientMap, vital) => {
    if (vital.patient_id && vital.patient_name) {
      acc[vital.patient_id] = vital.patient_name;
    }
    return acc;
  }, {});

export const NurseReportsProvider = ({ children }: { children: ReactNode }) => {
  const [vitalsReport, setVitalsReport] = useState<VitalReportData[]>([]);
  const [medicationsReport, setMedicationsReport] = useState<MedicationReportData[]>([]);
  const [shiftReport, setShiftReport] = useState<ShiftReportData[]>([]);
  const [patientSummary, setPatientSummary] = useState<PatientSummaryData>({});
  const [loading, setLoading] = useState(false);
  const [vitalsPatients, setVitalsPatients] = useState<PatientMap>({});

  const fetchPatientOptions = async (fallbackVitals: VitalReportData[] = []) => {
    const fallbackPatients = getPatientsFromVitals(fallbackVitals);

    try {
      const patients = await getVitalsPatients();
      const normalizedPatients = normalizePatients(patients);
      const patientOptions = { ...fallbackPatients, ...normalizedPatients };

      setVitalsPatients(patientOptions);
      return patientOptions;
    } catch (err: any) {
      console.error('Error fetching report patients:', err?.message);
      setVitalsPatients((current) => ({ ...current, ...fallbackPatients }));
      return fallbackPatients;
    }
  };

  const fetchVitalsReport = async (patientId?: string, from?: string, to?: string) => {
    setLoading(true);
    try {
      const data = await getVitalsReport(patientId, from, to);
      const vitals = Array.isArray(data) ? data : [];
      setVitalsReport(vitals);
      await fetchPatientOptions(vitals);
    } catch (err: any) {
      console.error('Error fetching vitals report:', err?.message);
      setVitalsReport([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicationsReport = async (patientId?: string, status?: string) => {
    setLoading(true);
    console.log('[NurseReportsContext] Fetching medications report...', { patientId, status });
    try {
      const data = await getMedicationsReport(patientId, status);
      console.log('[NurseReportsContext] Medications data fetched:', data);
      setMedicationsReport(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching medications report:', err?.message);
      setMedicationsReport([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchShiftReport = async (entryType?: string, taskStatus?: string) => {
    setLoading(true);
    console.log('[NurseReportsContext] Fetching shift report...', { entryType, taskStatus });
    try {
      const data = await getShiftReport(entryType, taskStatus);
      console.log('[NurseReportsContext] Shift report data fetched:', data);
      setShiftReport(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching shift report:', err?.message);
      setShiftReport([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientSummary = async (patientId?: string) => {
    setLoading(true);
    console.log('[NurseReportsContext] Fetching patient summary...', { patientId });
    try {
      const data = await getPatientSummary(patientId);
      console.log('[NurseReportsContext] Patient summary data fetched:', data);
      setPatientSummary(patientId ? data || {} : { patients: data?.patients });

      const summaryPatients = normalizePatients(data?.patients);
      if (Object.keys(summaryPatients).length > 0) {
        setVitalsPatients((current) => ({ ...current, ...summaryPatients }));
      }

      await fetchPatientOptions();
    } catch (err: any) {
      console.error('Error fetching patient summary:', err?.message);
      setPatientSummary({});
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    await Promise.all([
      fetchVitalsReport(),
      fetchMedicationsReport(),
      fetchShiftReport(),
    ]);
  };

  return (
    <NurseReportsContext.Provider
      value={{
        vitalsReport,
        medicationsReport,
        shiftReport,
        patientSummary,
        loading,
        vitalsPatients,
        fetchVitalsReport,
        fetchMedicationsReport,
        fetchShiftReport,
        fetchPatientSummary,
        refreshReports,
      }}>
      {children}
    </NurseReportsContext.Provider>
  );
};

export const useNurseReports = () => {
  const ctx = useContext(NurseReportsContext);
  if (!ctx) {
    throw new Error('useNurseReports must be used within NurseReportsProvider');
  }
  return ctx;
};
