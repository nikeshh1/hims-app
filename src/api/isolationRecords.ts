import apiClient from "./apiClient";

// ─── Isolation Records ────────────────────────────────────

export const getIsolationRecords = async () => {
  const res = await apiClient.get("/isolation-records");
  return res.data.data;
};

export const getIsolationRecord = async (id: string) => {
  const res = await apiClient.get(`/isolation-records/${id}`);
  return res.data.data;
};

export const createIsolationRecord = async (data: any) => {
  const res = await apiClient.post("/isolation-records", data);
  return res.data.data;
};

export const updateIsolationRecord = async (id: string, data: any) => {
  const res = await apiClient.put(`/isolation-records/${id}`, data);
  return res.data.data;
};

export const deleteIsolationRecord = async (id: string) => {
  const res = await apiClient.delete(`/isolation-records/${id}`);
  return res.data;
};

// Get by patient
export const getIsolationRecordByPatient = async (patientId: string) => {
  const res = await apiClient.get(`/isolation-records/patient/${patientId}`);
  return res.data.data;
};

// Get by nurse
export const getIsolationRecordByNurse = async (nurseId: string) => {
  const res = await apiClient.get(`/isolation-records/nurse/${nurseId}`);
  return res.data.data;
};

// Get active isolations
export const getActiveIsolationRecords = async () => {
  const res = await apiClient.get("/isolation-records/status/active");
  return res.data.data;
};
