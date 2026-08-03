package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.ServiceLawyer;
import com.lawfirm.brs.entity.ServiceLawyer.ServiceLawyerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for the {@code service_lawyers} join table.
 * Used by admin service-management endpoints to set which lawyers offer which service.
 */
@Repository
public interface ServiceLawyerRepository extends JpaRepository<ServiceLawyer, ServiceLawyerId> {

    /**
     * Return all lawyer IDs currently assigned to the given service.
     */
    @Query("SELECT sl.id.lawyerId FROM ServiceLawyer sl WHERE sl.id.serviceId = :serviceId")
    List<UUID> findLawyerIdsByServiceId(@Param("serviceId") UUID serviceId);

    /**
     * Bulk-remove all rows for a service. Used when admin resets the full list
     * via {@code PUT /api/admin/services/{id}} with an explicit lawyerIds array.
     */
    @Modifying
    @Query("DELETE FROM ServiceLawyer sl WHERE sl.id.serviceId = :serviceId")
    void deleteByServiceId(@Param("serviceId") UUID serviceId);

    /**
     * Bulk-remove all rows for a lawyer. Mirror used by the lawyer-side update
     * so that toggling on one side stays consistent with the join table.
     */
    @Modifying
    @Query("DELETE FROM ServiceLawyer sl WHERE sl.id.lawyerId = :lawyerId")
    void deleteByLawyerId(@Param("lawyerId") UUID lawyerId);

    /**
     * Return all service IDs currently assigned to the given lawyer.
     */
    @Query("SELECT sl.id.serviceId FROM ServiceLawyer sl WHERE sl.id.lawyerId = :lawyerId")
    List<UUID> findServiceIdsByLawyerId(@Param("lawyerId") UUID lawyerId);

    /**
     * Remove a specific service-lawyer mapping.
     */
    @Modifying
    @Query("DELETE FROM ServiceLawyer sl WHERE sl.id.serviceId = :serviceId AND sl.id.lawyerId = :lawyerId")
    void deleteByLawyerIdAndServiceId(@Param("lawyerId") UUID lawyerId, @Param("serviceId") UUID serviceId);

    /**
     * Count rows so admin can detect at a glance whether a service is unassigned.
     */
    long countById_ServiceId(UUID serviceId);
}
