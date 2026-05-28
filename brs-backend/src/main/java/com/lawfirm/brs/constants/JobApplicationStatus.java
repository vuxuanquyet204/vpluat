package com.lawfirm.brs.constants;

/**
 * Job application status values.
 */
public enum JobApplicationStatus {
    NEW,            // Just applied
    SCREENING,      // Under initial screening
    INTERVIEW,      // Interview scheduled
    OFFER,          // Offer extended
    HIRED,          // Successfully hired
    REJECTED,       // Application rejected
    WITHDRAWN       // Candidate withdrew
}
