package com.lawfirm.brs.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service DTO for API responses.
 *
 * <p>Fields map 1:1 to {@code services} table columns plus a denormalized
 * {@code parentName} for convenient UI rendering. No synthetic multi-language
 * fields — translation support, if needed, must be added via a separate
 * translations table.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {

    private UUID id;
    private UUID parentId;
    private String slug;
    private String name;
    private String icon;
    private Integer displayOrder;
    private Boolean isFeatured;
    private Boolean isActive;
    private Instant createdAt;

    private String parentName;

    /**
     * IDs of lawyers assigned to this service. Populated from the
     * {@code service_lawyers} join table by the service-management service.
     * Excluded from JSON output when {@code null} so older clients that don't
     * expect the field aren't broken during a partial rollout.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<UUID> lawyerIds;
}