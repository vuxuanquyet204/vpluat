package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.constants.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Lead repository.
 */
@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);

    Optional<Lead> findByDuplicateHash(String duplicateHash);

    List<Lead> findAllByDuplicateHash(String duplicateHash);

    boolean existsByPhoneOrEmail(String phone, String email);

    long countByStatus(LeadStatus status);

    long countByStatusAndCreatedAtAfter(LeadStatus status, Instant after);
}
