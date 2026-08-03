package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Service-Lawyer assignment mapping.
 *
 * <p>Many-to-many link between {@link ServiceEntity} and {@link LawyerProfile}
 * so that admins can pick which lawyers offer a given legal service.
 * The composite primary key mirrors the {@code service_lawyers} table created
 * in {@code V1__init_schema.sql} (service_id, lawyer_id, is_primary).
 *
 * <p>We expose {@link #id} as a separate embedded key class so JPA can
 * tolerate updates from multiple sources (admin UI, lawyer-side mirror write)
 * without surprising detached-entity exceptions.
 */
@Entity
@Table(name = "service_lawyers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceLawyer {

    @EmbeddedId
    private ServiceLawyerId id;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("serviceId")
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceEntity service;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("lawyerId")
    @JoinColumn(name = "lawyer_id", nullable = false)
    private LawyerProfile lawyer;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceLawyer other)) return false;
        return id != null && other.id != null
            && Objects.equals(id.getServiceId(), other.id.getServiceId())
            && Objects.equals(id.getLawyerId(), other.id.getLawyerId());
    }

    @Override
    public int hashCode() {
        if (id == null) return 0;
        return Objects.hash(id.getServiceId(), id.getLawyerId());
    }

    /**
     * Composite primary key (service_id, lawyer_id).
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceLawyerId implements Serializable {

        @Column(name = "service_id", nullable = false)
        private UUID serviceId;

        @Column(name = "lawyer_id", nullable = false)
        private UUID lawyerId;
    }
}
