package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.JobApplication;
import com.lawfirm.brs.constants.JobApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
    Page<JobApplication> findByJobId(UUID jobId, Pageable pageable);
    long countByStatus(JobApplicationStatus status);
    long countByJobId(UUID jobId);
}
