import { apiClient } from './client';

export interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'BOOKED' | 'HELD';
  durationMinutes: number;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: string;
  isWorkingDay: boolean;
  slots: TimeSlot[];
}

export interface AvailabilityResponse {
  practitionerId: string;
  practitionerName: string;
  timeZone: string;
  granularityMin: number;
  durationMinutes: number;
  dates: DayAvailability[];
}

export interface AppointmentTypeConfig {
  id: string;
  code: string;
  name: string;
  durationMinutes: number;
  preBufferMin: number;
  postBufferMin: number;
  color?: string;
}

export interface AppointmentHold {
  id: string;
  token: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'RELEASED';
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  fromStatus?: string;
  toStatus: string;
  reason?: string;
  changedBy: string;
  metadata?: any;
  createdAt: string;
}

export interface AppointmentRequest {
  id: string;
  appointmentId?: string;
  patientId: string;
  requestType: 'RESCHEDULE' | 'CANCELLATION' | 'NEW_BOOKING';
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  priority: string;
  reason?: string;
  notes?: string;
  requestedBy: string;
  requestedNewStart?: string;
  createdAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    phone: string;
    email?: string;
    dateOfBirth?: string;
  };
  appointment?: {
    id: string;
    doctorId: string;
    startTime: string;
    endTime: string;
    status: string;
    doctor: { user: { firstName: string; lastName: string } };
    facility?: { name: string };
    department?: { name: string };
    statusHistory?: AppointmentStatusHistory[];
  };
}

export const SchedulingAPI = {
  getAvailability: async (params: {
    practitionerId: string;
    facilityId?: string;
    departmentId?: string;
    appointmentTypeId?: string;
    from: string;
    to: string;
    excludeAppointmentId?: string;
  }): Promise<AvailabilityResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('practitionerId', params.practitionerId);
    searchParams.append('from', params.from);
    searchParams.append('to', params.to);
    if (params.facilityId) searchParams.append('facilityId', params.facilityId);
    if (params.departmentId) searchParams.append('departmentId', params.departmentId);
    if (params.appointmentTypeId) searchParams.append('appointmentTypeId', params.appointmentTypeId);
    if (params.excludeAppointmentId) searchParams.append('excludeAppointmentId', params.excludeAppointmentId);

    const res = await apiClient.get(`/scheduling/availability?${searchParams.toString()}`);
    return res?.data || res;
  },

  getAppointmentTypes: async (): Promise<AppointmentTypeConfig[]> => {
    const res = await apiClient.get('/scheduling/appointment-types');
    return res?.data || res;
  },
};

export const AppointmentHoldAPI = {
  create: async (dto: { doctorId: string; startTime: string; endTime: string }): Promise<AppointmentHold> => {
    const res = await apiClient.post('/appointment-holds', dto);
    return res?.data || res;
  },

  release: async (holdId: string): Promise<void> => {
    await apiClient.delete(`/appointment-holds/${holdId}`);
  },
};

export const AppointmentRequestAPI = {
  list: async (status?: string): Promise<AppointmentRequest[]> => {
    const endpoint = status ? `/appointment-requests?status=${status}` : '/appointment-requests';
    const res = await apiClient.get(endpoint);
    return res?.data || res;
  },

  get: async (id: string): Promise<AppointmentRequest> => {
    const res = await apiClient.get(`/appointment-requests/${id}`);
    return res?.data || res;
  },

  complete: async (id: string, dto: { status: string; notes?: string }): Promise<AppointmentRequest> => {
    const res = await apiClient.post(`/appointment-requests/${id}/complete`, dto);
    return res?.data || res;
  },
};

export const AppointmentAPI = {
  create: async (dto: any) => {
    const res = await apiClient.post('/appointments', dto);
    return res?.data || res;
  },

  get: async (id: string) => {
    const res = await apiClient.get(`/appointments/${id}`);
    return res?.data || res;
  },

  reschedule: async (id: string, dto: { newStartTime: string; durationMinutes?: number; reason?: string }) => {
    const res = await apiClient.put(`/appointments/${id}/reschedule`, dto);
    return res?.data || res;
  },

  cancel: async (id: string, reason: string) => {
    const res = await apiClient.post(`/appointments/${id}/cancel`, { reason });
    return res?.data || res;
  },

  checkIn: async (id: string) => {
    const res = await apiClient.post(`/appointments/${id}/check-in`);
    return res?.data || res;
  },

  getHistory: async (id: string): Promise<AppointmentStatusHistory[]> => {
    const res = await apiClient.get(`/appointments/${id}/history`);
    return res?.data || res;
  },
};
