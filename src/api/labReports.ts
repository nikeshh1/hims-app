import apiClient from './apiClient';

export const getLabReports = async () => {
  const res = await apiClient.get('/laboratories');
  return res.data?.data || res.data || [];
};

export const getLabReport = async (id: string) => {
  const res = await apiClient.get(`/laboratories/${id}`);
  return res.data?.data || res.data;
};

export const createLabReport = async (data: any) => {
  const res = await apiClient.post('/laboratories', data);
  return res.data?.data || res.data;
};

export const updateLabReport = async (id: string, data: any) => {
  const res = await apiClient.put(`/laboratories/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteLabReport = async (id: string) => {
  const res = await apiClient.delete(`/laboratories/${id}`);
  return res.data;
};

export const getLabSamples = async () => {
  const res = await apiClient.get('/laboratories/samples');
  return res.data?.data || res.data;
};

export const getPendingSamples = async () => {
  const res = await apiClient.get('/laboratories/samples/pending');
  return res.data?.data || res.data;
};

export const collectSample = async (id: string, data: any) => {
  const res = await apiClient.post(`/laboratories/samples/collect/${id}`, data);
  return res.data?.data || res.data;
};

export const getLabResults = async () => {
  const res = await apiClient.get('/laboratories/samples/results');
  return res.data?.data || res.data;
};

export const getLabResult = async (id: string) => {
  const res = await apiClient.get(`/laboratories/samples/results/${id}`);
  return res.data?.data || res.data;
};

export const saveResultDraft = async (id: string, data: any) => {
  const res = await apiClient.post(`/laboratories/samples/results/save-draft/${id}`, data);
  return res.data?.data || res.data;
};

export const submitResult = async (id: string, data: any) => {
  const res = await apiClient.post(`/laboratories/samples/results/submit/${id}`, data);
  return res.data?.data || res.data;
};

export const getLabRequests = async () => {
  const res = await apiClient.get('/laboratories/requests');
  return res.data?.data || res.data;
};

export const getPatients = async () => {
  const res = await apiClient.get('/laboratories/patients');
  return res.data?.data || res.data;
};

export const getLabTests = async () => {
  const res = await apiClient.get('/laboratories/tests');
  return res.data?.data || res.data;
};
