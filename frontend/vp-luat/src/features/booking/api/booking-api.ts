import { apiClient } from '@/lib/api';
import type {
  BookingConfirmation,
  BookingConsultationType,
  BookingReservation,
  BookingTimeSlot,
} from '../types';

export interface AvailabilityResponse {
  date: string;
  lawyerId: string;
  slots: BookingTimeSlot[];
}

export interface ReserveSlotPayload {
  lawyerId: string;
  date: string;
  slotId: string;
}

export interface SubmitBookingPayload {
  reservationId: string;
  serviceId: string;
  lawyerId: string;
  consultationType: BookingConsultationType;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    issueSummary: string;
  };
}

export async function fetchAvailability(params: {
  lawyerId: string;
  date: string;
}): Promise<AvailabilityResponse> {
  const response = await apiClient.get<AvailabilityResponse>('/availability', {
    params,
  });

  return response.data;
}

export async function reserveSlot(payload: ReserveSlotPayload): Promise<BookingReservation> {
  const response = await apiClient.post<BookingReservation>('/availability/reserve', payload);
  return response.data;
}

export async function releaseReservation(reservationId: string): Promise<void> {
  await apiClient.post('/availability/release', { reservationId });
}

export async function verifyReservation(reservationId: string): Promise<{
  reservationId: string;
  status: 'active' | 'expired' | 'released' | 'converted';
  expiresAt: string;
}> {
  const response = await apiClient.get(`/availability/reservations/${reservationId}`);
  return response.data;
}

export async function submitBooking(payload: SubmitBookingPayload): Promise<BookingConfirmation> {
  const response = await apiClient.post<BookingConfirmation>('/bookings', payload);
  return response.data;
}
