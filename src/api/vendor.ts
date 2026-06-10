import apiClient from "./apiClient";

// Fetch all vendors
export const getVendors = async () => {
  const res = await apiClient.get("/vendors");
  return res.data.data;
};

// Create vendor
export const createVendor = async (data: any) => {
  const res = await apiClient.post("/vendors", data);
  return res.data.data;
};

// Update vendor
export const updateVendor = async (id: string, data: any) => {
  const res = await apiClient.put(`/vendors/${id}`, data);
  return res.data.data;
};

// Delete vendor (soft)
export const deleteVendor = async (id: string) => {
  const res = await apiClient.delete(`/vendors/${id}`);
  return res.data;
};

// Fetch deleted vendors
export const getDeletedVendors = async () => {
  const res = await apiClient.get("/vendors/deleted");
  return res.data.data;
};

// Restore vendor
export const restoreVendor = async (id: string) => {
  const res = await apiClient.put(`/vendors/${id}/restore`);
  return res.data.data;
};

// Force delete vendor
export const forceDeleteVendor = async (id: string) => {
  const res = await apiClient.delete(`/vendors/${id}/force-delete`);
  return res.data;
};
