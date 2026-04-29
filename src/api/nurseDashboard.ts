import apiClient from './apiClient';

/**
 * Get nurse dashboard metrics
 * Returns: assigned patients, critical patients, pending medications, pending vitals, ready for discharge
 */
export const getNurseDashboardMetrics = async () => {
  try {
    const res = await apiClient.get('/nurse/dashboard');
    console.log('📊 Dashboard Metrics Response:', res.data);
    return res.data?.data || res.data || {};
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    throw error;
  }
};

/**
 * Get list of vital records
 */
export const getVitals = async () => {
  try {
    const res = await apiClient.get('/vitals');
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('❌ Error fetching vitals:', error);
    throw error;
  }
};

/**
 * Get list of nurse shift assignments with handover entries
 */
export const getNurseShifts = async () => {
  try {
    const res = await apiClient.get('/nurse-shifts');
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('❌ Error fetching nurse shifts:', error);
    throw error;
  }
};

/**
 * Get specific shift with handover entries
 */
export const getNurseShiftDetail = async (shiftId: string) => {
  try {
    const res = await apiClient.get(`/nurse-shifts/${shiftId}`);
    return res.data?.data || res.data || null;
  } catch (error) {
    console.error('❌ Error fetching shift detail:', error);
    throw error;
  }
};

/**
 * Get discharge preparation records
 */
export const getDischargePreparation = async () => {
  try {
    const res = await apiClient.get('/nurse-discharge');
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('❌ Error fetching discharge records:', error);
    throw error;
  }
};

/**
 * Get all patients
 */
export const getPatients = async () => {
  try {
    const res = await apiClient.get('/vitals/patients');
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    throw error;
  }
};
