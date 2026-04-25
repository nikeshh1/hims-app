import apiClient from './apiClient';

// Vital Trends Report
export const getVitalsReport = async (patientId?: string, from?: string, to?: string) => {
  const res = await apiClient.get('/nurse-reports/vitals', {
    params: {
      patient_id: patientId,
      from,
      to,
    },
  });
  return res.data?.data || [];
};

export const getVitalsPatients = async () => {
  const res = await apiClient.get('/nurse-reports/vitals');
  return res.data?.patients || {};
};

// Medication Report
export const getMedicationsReport = async (patientId?: string, status?: string) => {
  const res = await apiClient.get('/nurse-reports/medications', {
    params: {
      patient_id: patientId,
      status,
    },
  });
  return res.data?.data || [];
};

// Shift Report
export const getShiftReport = async (entryType?: string, taskStatus?: string) => {
  const res = await apiClient.get('/nurse-reports/shifts', {
    params: {
      entry_type: entryType,
      task_status: taskStatus,
    },
  });
  return res.data?.data || [];
};

// Patient Summary Report
export const getPatientSummary = async (patientId?: string) => {
  const res = await apiClient.get('/nurse-reports/patient-summary', {
    params: {
      patient_id: patientId,
    },
  });
  return res.data || {};
};
