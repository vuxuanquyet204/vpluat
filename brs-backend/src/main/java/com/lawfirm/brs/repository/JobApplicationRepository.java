package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.JobApplication;
import com.lawfirm.brs.constants.JobApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {

    @Query("SELECT a FROM JobApplication a WHERE a.job.id = :jobId")
    Page<JobApplication> findByJobId(@Param("jobId") UUID jobId, Pageable pageable);

    long countByStatus(JobApplicationStatus status);

    long countByJobId(UUID jobId);
}
