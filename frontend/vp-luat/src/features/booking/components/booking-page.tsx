'use client';

import { useEffect, useRef } from 'react';
import { BookingShell } from './booking-shell';
import { StepConfirmation } from './step-confirmation';
import { StepDatetime } from './step-datetime';
import { StepInfo } from './step-info';
import { StepService } from './step-service';
import {
  trackBookingReservationExpired,
  trackBookingStarted,
  trackBookingStepCompleted,
} from '../analytics';
import {
  useBookingStore,
  useReservationPolling,
  useSlotPolling,
  useVerifyReservationQuery,
  useVisibilityRefetch,
} from '../hooks';

export function BookingPage() {
  const step = useBookingStore((state) => state.step);
  const setStep = useBookingStore((state) => state.setStep);
  const isHydrated = useBookingStore((state) => state.isHydrated);
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const date = useBookingStore((state) => state.date);
  const timeSlot = useBookingStore((state) => state.timeSlot);
  const reservation = useBookingStore((state) => state.reservation);
  const confirmation = useBookingStore((state) => state.confirmation);
  const setReservation = useBookingStore((state) => state.setReservation);
  const setTimeSlot = useBookingStore((state) => state.setTimeSlot);
  const resetAll = useBookingStore((state) => state.resetAll);
  const prevStepRef = useRef<typeof step | null>(null);

  const reservationVerification = useVerifyReservationQuery(
    step === 'info' && reservation?.reservationId ? reservation.reservationId : null,
  );

  useSlotPolling(lawyer?.id ?? null, date);
  useReservationPolling(step === 'info' ? reservation?.reservationId ?? null : null);
  useVisibilityRefetch(lawyer?.id ?? null, date, reservation?.reservationId ?? null);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (step !== 'service' && (!service || !lawyer)) {
      setStep('service');
      return;
    }

    if ((step === 'info' || step === 'confirmation') && (!date || !timeSlot)) {
      setStep('datetime');
      return;
    }

    if (step === 'confirmation' && !confirmation) {
      setStep('info');
    }
  }, [confirmation, date, isHydrated, lawyer, service, setStep, step, timeSlot]);

  useEffect(() => {
    if (step === 'info' && reservation?.reservationId && reservationVerification.data) {
      const { status } = reservationVerification.data;
      if (status === 'expired' || status === 'released') {
        trackBookingReservationExpired(reservation.reservationId);
        setReservation(null);
        setTimeSlot(null);
        setStep('datetime');
      }
    }
  }, [step, reservation, reservationVerification.data, setReservation, setTimeSlot, setStep]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const prev = prevStepRef.current;
    if (prev !== null && prev !== step) {
      if (step === 'service') {
        trackBookingStarted();
      }
      trackBookingStepCompleted(step);
    }
    prevStepRef.current = step;
  }, [step, isHydrated]);

  return (
    <BookingShell step={step}>
      {step === 'service' ? <StepService onNext={() => setStep('datetime')} /> : null}
      {step === 'datetime' ? (
        <StepDatetime onBack={() => setStep('service')} onNext={() => setStep('info')} />
      ) : null}
      {step === 'info' ? (
        <StepInfo onBack={() => setStep('datetime')} onSubmitSuccess={() => setStep('confirmation')} />
      ) : null}
      {step === 'confirmation' ? <StepConfirmation onReset={resetAll} /> : null}
    </BookingShell>
  );
}
