package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.constants.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Lead repository.
 */
@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID>, JpaSpecificationExecutor<Lead> {

    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

    Optional<Lead> findByDuplicateHash(String duplicateHash);

    List<Lead> findAllByDuplicateHash(String duplicateHash);

    boolean existsByPhoneOrEmail(String phone, String email);

    long countByStatus(LeadStatus status);

    long countByStatusAndCreatedAtAfter(LeadStatus status, Instant after);

    long countByCreatedAtBetween(Instant from, Instant to);

    long countByStatusAndCreatedAtBetween(LeadStatus status, Instant from, Instant to);

    @Query("SELECT l.source AS source, COUNT(l) AS count FROM Lead l " +
           "WHERE l.createdAt BETWEEN :from AND :to " +
           "GROUP BY l.source ORDER BY COUNT(l) DESC")
    List<Object[]> countBySourceInRange(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT l.service.slug AS service, COUNT(l) AS count FROM Lead l " +
           "WHERE l.createdAt BETWEEN :from AND :to AND l.service IS NOT NULL " +
           "GROUP BY l.service.slug ORDER BY COUNT(l) DESC")
    List<Object[]> countByServiceInRange(@Param("from") Instant from, @Param("to") Instant to);
}
