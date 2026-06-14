import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  BookingConfirmation,
  BookingConsultationType,
  BookingCustomerInfo,
  BookingLawyerOption,
  BookingReservation,
  BookingServiceOption,
  BookingStep,
  BookingTimeSlot,
} from '../types';

export interface BookingStoreState {
  step: BookingStep;
  service: BookingServiceOption | null;
  lawyer: BookingLawyerOption | null;
  date: string | null;
  timeSlot: BookingTimeSlot | null;
  consultationType: BookingConsultationType;
  reservation: BookingReservation | null;
  customerInfo: BookingCustomerInfo;
  confirmation: BookingConfirmation | null;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setStep: (step: BookingStep) => void;
  setService: (service: BookingServiceOption) => void;
  setLawyer: (lawyer: BookingLawyerOption) => void;
  setDate: (date: string | null) => void;
  setTimeSlot: (timeSlot: BookingTimeSlot | null) => void;
  setConsultationType: (type: BookingConsultationType) => void;
  setReservation: (reservation: BookingReservation | null) => void;
  setCustomerInfo: (customerInfo: Partial<BookingCustomerInfo>) => void;
  setConfirmation: (confirmation: BookingConfirmation | null) => void;
  resetDownstreamFromService: () => void;
  resetDownstreamFromLawyer: () => void;
  resetDownstreamFromDate: () => void;
  resetAll: () => void;
}

type BookingStore = () => BookingStoreState;

const initialCustomerInfo: BookingCustomerInfo = {
  fullName: '',
  phone: '',
  email: '',
  issueSummary: '',
  agreedToTerms: false,
};

const initialState: Pick<BookingStoreState, 'step' | 'service' | 'lawyer' | 'date' | 'timeSlot' | 'consultationType' | 'reservation' | 'customerInfo' | 'confirmation' | 'isHydrated'> = {
  step: 'service',
  service: null,
  lawyer: null,
  date: null,
  timeSlot: null,
  consultationType: 'office',
  reservation: null,
  customerInfo: initialCustomerInfo,
  confirmation: null,
  isHydrated: false,
};

export const useBookingStore = create<BookingStoreState>()(
  persist(
    (set) => ({
      ...initialState,
      setHydrated: (value) => set({ isHydrated: value }),
      setStep: (step) => set({ step }),
      setService: (service) =>
        set((state) => {
          const isSame = state.service?.id === service.id;
          if (isSame) {
            return { service };
          }

          return {
            service,
            lawyer: null,
            date: null,
            timeSlot: null,
            reservation: null,
            confirmation: null,
            step: 'service',
          };
        }),
      setLawyer: (lawyer) =>
        set((state) => {
          const isSame = state.lawyer?.id === lawyer.id;
          if (isSame) {
            return { lawyer };
          }

          return {
            lawyer,
            date: null,
            timeSlot: null,
            reservation: null,
            confirmation: null,
          };
        }),
      setDate: (date) =>
        set({
          date,
          timeSlot: null,
          reservation: null,
          confirmation: null,
        }),
      setTimeSlot: (timeSlot) => set({ timeSlot, confirmation: null }),
      setConsultationType: (consultationType) => set({ consultationType }),
      setReservation: (reservation) => set({ reservation }),
      setCustomerInfo: (customerInfo) =>
        set((state) => ({
          customerInfo: {
            ...state.customerInfo,
            ...customerInfo,
          },
        })),
      setConfirmation: (confirmation) => set({ confirmation }),
      resetDownstreamFromService: () =>
        set({
          lawyer: null,
          date: null,
          timeSlot: null,
          reservation: null,
          confirmation: null,
          step: 'service',
        }),
      resetDownstreamFromLawyer: () =>
        set({
          date: null,
          timeSlot: null,
          reservation: null,
          confirmation: null,
        }),
      resetDownstreamFromDate: () =>
        set({
          timeSlot: null,
          reservation: null,
          confirmation: null,
        }),
      resetAll: () => set({ ...initialState, isHydrated: true }),
    }),
    {
      name: 'booking-flow-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        step: state.step,
        service: state.service,
        lawyer: state.lawyer,
        date: state.date,
        timeSlot: state.timeSlot,
        consultationType: state.consultationType,
        reservation: state.reservation,
        customerInfo: state.customerInfo,
        confirmation: state.confirmation,
      }),
      onRehydrateStorage: () => (_state, _error) => {
        return (_persistedState: unknown) => {
          const ps = _persistedState as Partial<BookingStoreState> & { setHydrated?: (v: boolean) => void } | undefined;
          if (ps) {
            ps.setHydrated?.(true);
          }
        };
      },
    },
  ),
);
