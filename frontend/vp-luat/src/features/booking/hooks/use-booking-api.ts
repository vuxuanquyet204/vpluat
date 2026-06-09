import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchAvailability,
  releaseReservation,
  reserveSlot,
  submitBooking,
  verifyReservation,
  type ReserveSlotPayload,
  type SubmitBookingPayload,
} from '../api';

export function useAvailabilityQuery(params: { lawyerId: string | null; date: string | null }) {
  return useQuery({
    queryKey: ['booking-slots', params.lawyerId, params.date],
    queryFn: () => fetchAvailability({ lawyerId: params.lawyerId!, date: params.date! }),
    enabled: Boolean(params.lawyerId && params.date),
  });
}

export function useReserveSlotMutation() {
  return useMutation({
    mutationFn: (payload: ReserveSlotPayload) => reserveSlot(payload),
  });
}

export function useReleaseReservationMutation() {
  return useMutation({
    mutationFn: (reservationId: string) => releaseReservation(reservationId),
  });
}

export function useVerifyReservationQuery(reservationId: string | null) {
  return useQuery({
    queryKey: ['booking-reservation', reservationId],
    queryFn: () => verifyReservation(reservationId!),
    enabled: Boolean(reservationId),
    refetchOnWindowFocus: true,
  });
}

export function useSubmitBookingMutation() {
  return useMutation({
    mutationFn: (payload: SubmitBookingPayload) => submitBooking(payload),
  });
}
