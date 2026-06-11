import apiClient from './apiClient';

export const getAppointments = () => apiClient.get('/appointments');

export const getAppointment = (id: string) => apiClient.get(`/appointments/${id}`);

export const createAppointment = (data: any) => apiClient.post('/appointments', data);

export const updateAppointment = (id: string, data: any) => apiClient.put(`/appointments/${id}`, data);

export const deleteAppointment = (id: string) => apiClient.delete(`/appointments/${id}`);

export const getDeletedAppointments = () => apiClient.get('/appointments/trash');

export const restoreAppointment = (id: string) => apiClient.put(`/appointments/${id}/restore`);

export const forceDeleteAppointment = (id: string) => apiClient.delete(`/appointments/${id}/force-delete`);

export const getPatients = () => apiClient.get('/appointments/patients');

export const getDepartments = () => apiClient.get('/appointments/departments');

export const getDoctorsByDepartment = (departmentId: string) =>
  apiClient.get(`/appointments/doctors/${departmentId}`);
