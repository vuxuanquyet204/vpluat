package com.lawfirm.brs.dto.request;

import java.util.UUID;

/**
 * Update status request DTO.
 */
public record UpdateStatusRequest(
    String status,
    UUID assignedTo,
    String notes
) {}
