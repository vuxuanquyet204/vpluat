/**
 * Centralised mapping between frontend lead status tokens and the
 * backend `LeadStatus` enum (uppercase: NEW, CONTACTED, QUALIFIED,
 * PROPOSAL, NEGOTIATION, WON, LOST, DUPLICATE).
 *
 * The CRM page UI uses lowercase semantic tokens: 'new' | 'contacted'
 * | 'progress' | 'converted' | 'lost'. Several backend statuses
 * collapse into one UI token — e.g. QUALIFIED, PROPOSAL and
 * NEGOTIATION all surface as 'progress' (Đang xử lý).
 */
import type { LeadStatus as FELeadStatus } from '@/features/admin/types';

export type BackendLeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'DUPLICATE';

const FE_TO_BE: Record<FELeadStatus, BackendLeadStatus> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  // All "in progress" backend statuses share the same UI token.
  progress: 'NEGOTIATION',
  converted: 'WON',
  lost: 'LOST',
};

const BE_TO_FE: Record<BackendLeadStatus, FELeadStatus> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'progress',
  PROPOSAL: 'progress',
  NEGOTIATION: 'progress',
  WON: 'converted',
  LOST: 'lost',
  DUPLICATE: 'lost',
};

const VALID_BE: ReadonlySet<string> = new Set(Object.keys(BE_TO_FE));

/** Convert a frontend token (or raw backend enum string) to a valid backend enum value. */
export function toBackendStatus(value: string | null | undefined): BackendLeadStatus | undefined {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (VALID_BE.has(upper)) {
    return upper as BackendLeadStatus;
  }
  // Lowercase frontend token — look up via the dedicated map.
  const lower = value.toLowerCase() as FELeadStatus;
  if (lower in FE_TO_BE) {
    return FE_TO_BE[lower];
  }
  return undefined;
}

/** Convert any backend status string (or frontend token) to the canonical frontend token. */
export function toFrontendStatus(value: string | null | undefined): FELeadStatus {
  if (!value) return 'new';
  const upper = value.toUpperCase();
  if (upper in BE_TO_FE) {
    return BE_TO_FE[upper as BackendLeadStatus];
  }
  const lower = value.toLowerCase() as FELeadStatus;
  if (lower in FE_TO_BE) {
    return lower;
  }
  return 'new';
}

/** Re-export the union for type-safe comparisons. */
export { FE_TO_BE, BE_TO_FE };
