export interface BookingServiceOption {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface BookingLawyerOption {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  rating: number;
  availabilityLabel: string;
  avatarGradient: string;
}

export interface BookingTimeSlot {
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'reserved' | 'booked' | 'expired';
}

export interface BookingReservation {
  reservationId: string;
  slotId: string;
  lawyerId: string;
  date: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'released' | 'converted';
}

export interface BookingCustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  issueSummary: string;
  agreedToTerms: boolean;
}

export interface BookingConfirmation {
  bookingId: string;
  status: 'confirmed' | 'pending_confirmation';
  createdAt: string;
}

export type BookingConsultationType = 'office' | 'video' | 'phone';

export type BookingStep = 'service' | 'datetime' | 'info' | 'confirmation';
