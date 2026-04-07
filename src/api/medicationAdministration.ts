import apiClient from "./apiClient";

// ─── Medication Administration ────────────────────────────────

export const getMedicationAdministrations = async () => {
  const res = await apiClient.get("/medication-administration");
  return res.data.data;
};

export const getMedicationAdministration = async (id: string) => {
  const res = await apiClient.get(`/medication-administration/${id}`);
  return res.data.data;
};

export const createMedicationAdministration = async (data: any) => {
  const res = await apiClient.post("/medication-administration", data);
  return res.data.data;
};

export const updateMedicationAdministration = async (id: string, data: any) => {
  const res = await apiClient.put(`/medication-administration/${id}`, data);
  return res.data.data;
};

export const deleteMedicationAdministration = async (id: string) => {
  const res = await apiClient.delete(`/medication-administration/${id}`);
  return res.data;
};

// Get by patient
export const getMedicationAdministrationByPatient = async (patientId: string) => {
  const res = await apiClient.get(`/medication-administration/patient/${patientId}`);
  return res.data.data;
};

// Get by nurse
export const getMedicationAdministrationByNurse = async (nurseId: string) => {
  const res = await apiClient.get(`/medication-administration/nurse/${nurseId}`);
  return res.data.data;
};

// Get by status
export const getMedicationAdministrationByStatus = async (status: string) => {
  const res = await apiClient.get(`/medication-administration/status/${status}`);
  return res.data.data;
};

export const getDeletedMedicationAdministrations = async () => {
  const res = await apiClient.get("/medication-administration/deleted");
  return res.data.data;
};

export const restoreMedicationAdministration = async (id: string) => {
  const res = await apiClient.post(`/medication-administration/${id}/restore`);
  return res.data.data;
};

export const forceDeleteMedicationAdministration = async (id: string) => {
  const res = await apiClient.delete(`/medication-administration/${id}/force-delete`);
  return res.data;
};
