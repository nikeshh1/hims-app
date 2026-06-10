import apiClient from "./apiClient";

// ─── Controlled Drugs ────────────────────────────────────

export const getControlledDrugs = async () => {
  const res = await apiClient.get("/controlled-drugs");
  return res.data.data;
};

export const getControlledDrug = async (id: number) => {
  const res = await apiClient.get(`/controlled-drugs/${id}`);
  return res.data.data;
};

export const createControlledDrug = async (data: any) => {
  const res = await apiClient.post("/controlled-drugs", data);
  return res.data.data;
};

export const updateControlledDrug = async (id: number, data: any) => {
  const res = await apiClient.put(`/controlled-drugs/${id}`, data);
  return res.data.data;
};

export const deleteControlledDrug = async (id: number) => {
  const res = await apiClient.delete(`/controlled-drugs/${id}`);
  return res.data;
};

// Soft-delete management
export const getDeletedControlledDrugs = async () => {
  const res = await apiClient.get("/controlled-drugs-deleted");
  return res.data.data;
};

export const restoreControlledDrug = async (id: number) => {
  const res = await apiClient.put(`/controlled-drugs/${id}/restore`);
  return res.data.data;
};

export const forceDeleteControlledDrug = async (id: number) => {
  const res = await apiClient.delete(`/controlled-drugs/${id}/force-delete`);
  return res.data;
};

// ─── Drug Log ────────────────────────────────────────────

export const getDrugLog = async (controlledDrugId?: number) => {
  const params = controlledDrugId
    ? { controlled_drug_id: controlledDrugId }
    : {};
  const res = await apiClient.get("/controlled-drug-log", { params });
  return res.data.data;
};

// ─── Dispense Records ────────────────────────────────────

export const getDispenseRecords = async (controlledDrugId?: number) => {
  const params = controlledDrugId
    ? { controlled_drug_id: controlledDrugId }
    : {};
  const res = await apiClient.get("/controlled-drug-dispense", { params });
  return res.data.data;
};

export const createDispenseRecord = async (data: any) => {
  const res = await apiClient.post("/controlled-drug-dispense", data);
  return res.data.data;
};
