import apiClient from './apiClient';

// Shifts Management
export const getShifts = (search?: string) => {
  const params = search ? `?search=${search}` : '';
  return apiClient.get(`/hr/shifts${params}`);
};

export const getShift = (id: string) => apiClient.get(`/hr/shifts/${id}`);

export const createShift = (data: any) => apiClient.post('/hr/shifts', data);

export const updateShift = (id: string, data: any) => apiClient.put(`/hr/shifts/${id}`, data);

export const deleteShift = (id: string) => apiClient.delete(`/hr/shifts/${id}`);

export const getDeletedShifts = () => apiClient.get('/hr/shifts/deleted');

export const restoreShift = (id: string) => apiClient.put(`/hr/shifts/${id}/restore`);

export const forceDeleteShift = (id: string) => apiClient.delete(`/hr/shifts/${id}/force-delete`);

export const toggleShiftStatus = (id: string) => apiClient.put(`/hr/shifts/${id}/toggle-status`);

// Shift Assignments
export const getShiftAssignments = () => apiClient.get('/hr/shift-assignments');

export const getShiftAssignment = (id: string) => apiClient.get(`/hr/shift-assignments/${id}`);

export const createShiftAssignment = (data: any) => apiClient.post('/hr/shift-assignments', data);

export const updateShiftAssignment = (id: string, data: any) => apiClient.put(`/hr/shift-assignments/${id}`, data);

export const deleteShiftAssignment = (id: string) => apiClient.delete(`/hr/shift-assignments/${id}`);

export const getDeletedAssignments = () => apiClient.get('/hr/shift-assignments/deleted');

export const restoreAssignment = (id: string) => apiClient.put(`/hr/shift-assignments/${id}/restore`);

export const forceDeleteAssignment = (id: string) => apiClient.delete(`/hr/shift-assignments/${id}/force-delete`);

// Shift Rotations
export const getShiftRotations = () => apiClient.get('/hr/shift-rotations');

export const getShiftRotation = (id: string) => apiClient.get(`/hr/shift-rotations/${id}`);

export const createShiftRotation = (data: any) => apiClient.post('/hr/shift-rotations', data);

export const updateShiftRotation = (id: string, data: any) => apiClient.put(`/hr/shift-rotations/${id}`, data);

export const deleteShiftRotation = (id: string) => apiClient.delete(`/hr/shift-rotations/${id}`);

export const getDeletedRotations = () => apiClient.get('/hr/shift-rotations/deleted');

export const restoreRotation = (id: string) => apiClient.put(`/hr/shift-rotations/${id}/restore`);

// Weekly Offs
export const getWeeklyOffs = () => apiClient.get('/hr/weekly-offs');

export const getWeeklyOff = (id: string) => apiClient.get(`/hr/weekly-offs/${id}`);

export const createWeeklyOff = (data: any) => apiClient.post('/hr/weekly-offs', data);

export const updateWeeklyOff = (id: string, data: any) => apiClient.put(`/hr/weekly-offs/${id}`, data);

export const deleteWeeklyOff = (id: string) => apiClient.delete(`/hr/weekly-offs/${id}`);

// Get staff list for assignment
export const getStaff = () => apiClient.get('/hr/staff');

// Handover Notes (Nurse Shift Handover)
export const getHandoverNotes = (shiftAssignmentId: string) => 
  apiClient.get(`/nurse-shift-handover/assignment/${shiftAssignmentId}`);

export const createHandoverNote = (data: any) => 
  apiClient.post('/nurse-shift-handover', data);

export const updateHandoverNote = (id: string, data: any) => 
  apiClient.put(`/nurse-shift-handover/${id}`, data);

export const deleteHandoverNote = (id: string) => 
  apiClient.delete(`/nurse-shift-handover/${id}`);

export const updateHandoverStatus = (id: string, status: string) => 
  apiClient.put(`/nurse-shift-handover/${id}/status`, {task_status: status});
