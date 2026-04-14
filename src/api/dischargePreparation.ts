import apiClient from './apiClient';

export const getDischargeAdmissions = () => 
  apiClient.get('/nurse-discharge');

export const getDischargePreparation = (ipdId: string) => 
  apiClient.get(`/nurse-discharge/${ipdId}`);

export const createDischargePreparation = (data: any) => 
  apiClient.post('/nurse-discharge/save', data);

export const updateDischargePreparation = (data: any) => 
  apiClient.post('/nurse-discharge/save', data);

export const markDischargeReady = (id: string) => 
  apiClient.post(`/nurse-discharge/mark-ready/${id}`);

export const dischargePatient = (admissionId: string) => 
  apiClient.post(`/discharge/${admissionId}/discharge`);
