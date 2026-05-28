package com.lawfirm.brs.constants;

/**
 * Lead status values for CRM tracking.
 */
public enum LeadStatus {
    NEW,           // Newly created lead
    CONTACTED,     // First contact made
    QUALIFIED,     // Lead qualified
    PROPOSAL,      // Proposal sent
    NEGOTIATION,   // In negotiation
    WON,           // Converted to customer
    LOST,          // Lead lost
    DUPLICATE      // Duplicate lead
}
