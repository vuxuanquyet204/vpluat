'use client';

import { useEffect } from 'react';
import { BookingShell } from './booking-shell';
import { StepConfirmation } from './step-confirmation';
import { StepDatetime } from './step-datetime';
import { StepInfo } from './step-info';
import { StepService } from './step-service';
import { useBookingStore } from '../hooks';

export function BookingPage() {
  const step = useBookingStore((state) => state.step);
  const setStep = useBookingStore((state) => state.setStep);
  const isHydrated = useBookingStore((state) => state.isHydrated);
  const service = useBookingStore((state) => state.service);
  const lawyer = useBookingStore((state) => state.lawyer);
  const date = useBookingStore((state) => state.date);
  const timeSlot = useBookingStore((state) => state.timeSlot);
  const confirmation = useBookingStore((state) => state.confirmation);
  const resetAll = useBookingStore((state) => state.resetAll);

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
