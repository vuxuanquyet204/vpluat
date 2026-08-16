// features/contact/api/contact-api.ts
// API client for the public contact form.
//
// The backend does not expose a dedicated `/public/contact-messages` endpoint;
// the contract is to create a Lead via `POST /api/crm/leads` (which the
// security config marks as anonymous/public). Any extra UI fields (e.g. a
// `subject`) are folded into the lead `message` so they are not lost.

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { ContactFormValues } from '../types';

export interface ContactSubmitPayload {
  name: string;
  email: string;
  phone: string;
  /** Optional, folded into `message` before sending to the BE. */
  subject?: string;
  message: string;
  source?: string;
}

export async function submitContactMessage(
  values: ContactFormValues,
  source: string,
): Promise<ApiResponse<{ id: string }>> {
  const trimmedSubject = values.subject?.trim();
  const messageWithSubject = trimmedSubject
    ? `[${trimmedSubject}] ${values.message.trim()}`
    : values.message.trim();

  const payload: ContactSubmitPayload = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.replace(/\s+/g, ''),
    subject: trimmedSubject,
    message: messageWithSubject,
    source,
  };

  const { data } = await apiClient.post<ApiResponse<{ id: string }>>(
    '/crm/leads',
    payload,
  );

  return data;
}
