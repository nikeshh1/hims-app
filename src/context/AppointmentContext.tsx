import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  getAppointments,
  deleteAppointment as deleteAppointmentApi,
  createAppointment as createAppointmentApi,
  updateAppointment as updateAppointmentApi,
} from '../api/appointment';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: number;
  department_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_status: 'Scheduled' | 'Cancelled' | 'Completed';
  consultation_fee: number;
  institution_id: string;
  receptionist_user_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  patient?: {id: string; first_name: string; last_name: string; mobile?: string};
  doctor?: {id: number; name: string};
  department?: {id: string; department_name: string};
}

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  addAppointment: (data: any) => Promise<void>;
  editAppointment: (id: string, data: any) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | null>(null);

export const AppointmentProvider = ({children}: {children: ReactNode}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setAppointments(list);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addAppointment = async (data: any) => {
    await createAppointmentApi(data);
    await fetchAppointments();
  };

  const removeAppointment = async (id: string) => {
    await deleteAppointmentApi(id);
    await fetchAppointments();
  };

  const editAppointment = async (id: string, data: any) => {
    await updateAppointmentApi(id, data);
    await fetchAppointments();
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        addAppointment,
        editAppointment,
        removeAppointment,
        refreshAppointments: fetchAppointments,
      }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const ctx = useContext(AppointmentContext);
  if (!ctx) throw new Error('useAppointments must be used within AppointmentProvider');
  return ctx;
};
