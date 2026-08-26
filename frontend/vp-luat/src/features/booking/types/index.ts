export interface BookingServiceOption {
  id: string;
  slug: string;
  name: string;
  icon: string;
}

export interface BookingLawyerOption {
  /** UUID from backend (used for API calls) */
  id: string;
  name: string;
  initials: string;
  specialty: string;
  /** Real rating from API; omitted when not available so we don't fake 5.0. */
  rating?: number;
  /** Real review count from API. */
  reviewCount?: number;
  /** Pre-formatted label e.g. "Còn lịch hôm nay" / "Hết lịch hôm nay". */
  availabilityLabel?: string;
  isAvailableToday?: boolean;
  avatarGradient: string;
  avatarUrl?: string;
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

// Backend returns the full `AppointmentDTO` for POST /bookings; the only
// field we keep in the booking store is the appointment id, status, and
// creation timestamp. See AppointmentDTO.
export interface BookingConfirmation {
  /** UUID of the appointment (BE field: `id`). */
  bookingId: string;
  status: 'confirmed' | 'pending_confirmation';
  createdAt: string;
}

export type BookingConsultationType = 'office' | 'video' | 'phone';

export type BookingStep = 'service' | 'datetime' | 'info' | 'confirmation';
