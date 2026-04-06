import apiClient from './apiClient';

export const getVitals = () => apiClient.get('/vitals');

export const getVital = (id: string) => apiClient.get(`/vitals/${id}`);

export const createVital = (data: any) => apiClient.post('/vitals', data);

export const updateVital = (id: string, data: any) => apiClient.put(`/vitals/${id}`, data);

export const deleteVital = (id: string) => apiClient.delete(`/vitals/${id}`);

export const getDeletedVitals = () => apiClient.get('/vitals/trash');

export const restoreVital = (id: string) => apiClient.put(`/vitals/${id}/restore`);

export const forceDeleteVital = (id: string) => apiClient.delete(`/vitals/${id}/force-delete`);

export const getPatients = () => apiClient.get('/vitals/patients');

export const getNurses = () => apiClient.get('/vitals/nurses');
