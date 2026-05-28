package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.JobPosting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {
    Page<JobPosting> findByStatus(String status, Pageable pageable);
    Page<JobPosting> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
}
