import apiClient from "./apiClient";

// ─── PPE Compliance Logs ────────────────────────────────────

export const getPpeLogs = async () => {
  const res = await apiClient.get("/ppe-compliance");
  return res.data.data;
};

export const getPpeLog = async (id: string) => {
  const res = await apiClient.get(`/ppe-compliance/${id}`);
  return res.data.data;
};

export const createPpeLog = async (data: any) => {
  const res = await apiClient.post("/ppe-compliance", data);
  return res.data.data;
};

export const updatePpeLog = async (id: string, data: any) => {
  const res = await apiClient.put(`/ppe-compliance/${id}`, data);
  return res.data.data;
};

export const deletePpeLog = async (id: string) => {
  const res = await apiClient.delete(`/ppe-compliance/${id}`);
  return res.data;
};

// Get by patient
export const getPpeLogByPatient = async (patientId: string) => {
  const res = await apiClient.get(`/ppe-compliance/patient/${patientId}`);
  return res.data.data;
};

// Get by nurse
export const getPpeLogByNurse = async (nurseId: string) => {
  const res = await apiClient.get(`/ppe-compliance/nurse/${nurseId}`);
  return res.data.data;
};

// Get by compliance status
export const getPpeLogByStatus = async (status: string) => {
  const res = await apiClient.get(`/ppe-compliance/status/${status}`);
  return res.data.data;
};

// Get PPE compliance report
export const getPpeComplianceReport = async (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  
  const res = await apiClient.get(`/ppe-compliance/report?${params.toString()}`);
  return res.data.data;
};
