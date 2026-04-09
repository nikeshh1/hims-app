import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {
  getShifts,
  getShiftAssignments,
  createShift as createShiftApi,
  updateShift as updateShiftApi,
  deleteShift as deleteShiftApi,
  getHandoverNotes,
  createHandoverNote as createHandoverNoteApi,
  updateHandoverNote as updateHandoverNoteApi,
  deleteHandoverNote as deleteHandoverNoteApi,
  updateHandoverStatus as updateHandoverStatusApi,
} from '../api/nurseShifts';

export interface Shift {
  id: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  grace_minutes?: number;
  break_minutes?: number;
  remarks?: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ShiftAssignment {
  id: string;
  staff_id: string;
  shift_id: string;
  start_date: string;
  end_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  staff?: {
    id: string;
    name: string;
    email?: string;
    designation?: string;
  };
  shift?: Shift;
}

export interface HandoverNote {
  id: string;
  hospital_id?: string;
  nurse_id: string;
  shift_assignment_id: string;
  entry_type: 'note' | 'task'; // 'Note' or 'Task'
  description: string;
  task_status?: 'pending' | 'completed'; // Only for tasks
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  nurse?: {
    id: string;
    name: string;
  };
}

interface NurseShiftsContextType {
  shifts: Shift[];
  shiftAssignments: ShiftAssignment[];
  handoverNotes: HandoverNote[];
  loading: boolean;
  refreshShifts: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
  getHandoverNotesForAssignment: (shiftAssignmentId: string) => Promise<void>;
  addHandoverNote: (data: any) => Promise<void>;
  editHandoverNote: (id: string, data: any) => Promise<void>;
  removeHandoverNote: (id: string) => Promise<void>;
  updateHandoverTaskStatus: (id: string, status: string) => Promise<void>;
}

const NurseShiftsContext = createContext<NurseShiftsContextType | null>(null);

export const NurseShiftsProvider = ({children}: {children: ReactNode}) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [handoverNotes, setHandoverNotes] = useState<HandoverNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await getShifts();
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setShifts(list);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await getShiftAssignments();
      // Handle paginated response: res.data?.data?.data
      const list = res.data?.data?.data || res.data?.data;
      if (Array.isArray(list)) {
        setShiftAssignments(list);
      } else {
        setShiftAssignments([]);
      }
    } catch (err) {
      console.error('Failed to fetch shift assignments:', err);
      setShiftAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchAssignments();
  }, []);

  const getHandoverNotesForAssignment = async (shiftAssignmentId: string) => {
    setLoading(true);
    try {
      const res = await getHandoverNotes(shiftAssignmentId);
      // Backend returns entries in res.data.entries (from apiShow method)
      const list = res.data?.entries || res.data?.data;
      if (Array.isArray(list)) {
        setHandoverNotes(list);
      } else {
        setHandoverNotes([]);
      }
    } catch (err) {
      console.error('Failed to fetch handover notes:', err);
      setHandoverNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const addHandoverNote = async (data: any) => {
    await createHandoverNoteApi(data);
  };

  const editHandoverNote = async (id: string, data: any) => {
    await updateHandoverNoteApi(id, data);
  };

  const removeHandoverNote = async (id: string) => {
    await deleteHandoverNoteApi(id);
  };

  const updateHandoverTaskStatus = async (id: string, status: string) => {
    await updateHandoverStatusApi(id, status);
  };

  return (
    <NurseShiftsContext.Provider
      value={{
        shifts,
        shiftAssignments,
        handoverNotes,
        loading,
        refreshShifts: fetchShifts,
        refreshAssignments: fetchAssignments,
        getHandoverNotesForAssignment,
        addHandoverNote,
        editHandoverNote,
        removeHandoverNote,
        updateHandoverTaskStatus,
      }}>
      {children}
    </NurseShiftsContext.Provider>
  );
};

export const useNurseShifts = () => {
  const ctx = useContext(NurseShiftsContext);
  if (!ctx) throw new Error('useNurseShifts must be used within NurseShiftsProvider');
  return ctx;
};
