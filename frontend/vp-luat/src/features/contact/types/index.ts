export type OfficeInfoType = 'address' | 'phone' | 'email' | 'hours';

export interface OfficeInfo {
  type: OfficeInfoType;
  icon: string;
  label: string;
  value: string;
  sub?: string;
}

export interface ContactFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  agreeTerms: boolean;
}

export interface OfficeLocation {
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  isMain?: boolean;
}
