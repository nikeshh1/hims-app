import apiClient from "./apiClient";

// ─── Infection Control Logs ────────────────────────────────

export const getInfectionLogs = async () => {
  const res = await apiClient.get("/infection-logs");
  return res.data.data;
};

export const getInfectionLog = async (id: string) => {
  const res = await apiClient.get(`/infection-logs/${id}`);
  return res.data.data;
};

export const createInfectionLog = async (data: any) => {
  const res = await apiClient.post("/infection-logs", data);
  return res.data.data;
};

export const updateInfectionLog = async (id: string, data: any) => {
  const res = await apiClient.put(`/infection-logs/${id}`, data);
  return res.data.data;
};

export const deleteInfectionLog = async (id: string) => {
  const res = await apiClient.delete(`/infection-logs/${id}`);
  return res.data;
};

export const getDeletedInfectionLogs = async () => {
  const res = await apiClient.get("/infection-logs/deleted");
  return res.data.data;
};

export const restoreInfectionLog = async (id: string) => {
  const res = await apiClient.post(`/infection-logs/${id}/restore`);
  return res.data.data;
};

export const forceDeleteInfectionLog = async (id: string) => {
  const res = await apiClient.delete(`/infection-logs/${id}/force-delete`);
  return res.data;
};
