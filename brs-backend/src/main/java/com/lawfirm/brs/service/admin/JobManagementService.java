package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.JobApplicationRequest;
import com.lawfirm.brs.dto.request.JobPostingRequest;
import com.lawfirm.brs.dto.response.JobApplicationDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.PostDTO;
import com.lawfirm.brs.entity.JobApplication;
import com.lawfirm.brs.entity.JobPosting;
import com.lawfirm.brs.mapper.JobApplicationMapper;
import com.lawfirm.brs.repository.JobApplicationRepository;
import com.lawfirm.brs.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for managing job postings and applications.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JobManagementService {

    private final JobPostingRepository jobPostingRepository;
    private final JobApplicationRepository applicationRepository;
    private final JobApplicationMapper applicationMapper;

    // ==================== Public Operations ====================

    @Transactional(readOnly = true)
    public PageResponse<PostDTO> getPublishedJobs(int page, int size) {
        log.debug("Fetching published jobs: page={}, size={}", page, size);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<JobPosting> jobPage = jobPostingRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED", pageRequest);
        return toPostPageResponse(jobPage);
    }

    @Transactional(readOnly = true)
    public PostDTO getJobById(UUID id) {
        log.debug("Fetching job by id: {}", id);
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        return toPostDTO(job);
    }

    public JobApplicationDTO applyForJob(UUID jobId, JobApplicationRequest request) {
        log.debug("Applying for job: {}", jobId);
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        
        JobApplication application = JobApplication.builder()
                .job(job)
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .coverLetter(request.coverLetter())
                .build();
        
        return applicationMapper.toDTO(applicationRepository.save(application));
    }

    // ==================== Admin Operations ====================

    public PostDTO createJob(JobPostingRequest request) {
        log.debug("Creating job: {}", request.title());
        JobPosting job = JobPosting.builder()
                .title(request.title())
                .titleEn(request.titleEn())
                .department(request.department())
                .location(request.location())
                .jobType(request.jobType())
                .descriptionVi(request.descriptionVi())
                .descriptionEn(request.descriptionEn())
                .requirementsVi(request.requirementsVi())
                .requirementsEn(request.requirementsEn())
                .salaryRange(request.salaryRange())
                .deadline(request.deadline())
                .status(request.status() != null ? request.status() : "DRAFT")
                .build();
        
        return toPostDTO(jobPostingRepository.save(job));
    }

    public PostDTO updateJob(UUID id, JobPostingRequest request) {
        log.debug("Updating job: {}", id);
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        
        job.setTitle(request.title());
        job.setTitleEn(request.titleEn());
        job.setDepartment(request.department());
        job.setLocation(request.location());
        job.setJobType(request.jobType());
        job.setDescriptionVi(request.descriptionVi());
        job.setDescriptionEn(request.descriptionEn());
        job.setRequirementsVi(request.requirementsVi());
        job.setRequirementsEn(request.requirementsEn());
        job.setSalaryRange(request.salaryRange());
        job.setDeadline(request.deadline());
        if (request.status() != null) {
            job.setStatus(request.status());
        }
        
        return toPostDTO(jobPostingRepository.save(job));
    }

    public PostDTO publishJob(UUID id) {
        log.debug("Publishing job: {}", id);
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.publish();
        return toPostDTO(jobPostingRepository.save(job));
    }

    public PostDTO closeJob(UUID id) {
        log.debug("Closing job: {}", id);
        JobPosting job = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.close();
        return toPostDTO(jobPostingRepository.save(job));
    }

    public void deleteJob(UUID id) {
        log.debug("Deleting job: {}", id);
        jobPostingRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<PostDTO> getAllJobs(int page, int size, String status) {
        log.debug("Fetching all jobs: page={}, size={}, status={}", page, size, status);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<JobPosting> jobPage;
        
        if (status != null) {
            jobPage = jobPostingRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
        } else {
            jobPage = jobPostingRepository.findAll(pageRequest);
        }
        
        return toPostPageResponse(jobPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<JobApplicationDTO> getAllApplications(int page, int size, UUID jobId, String status) {
        log.debug("Fetching applications: page={}, size={}, jobId={}, status={}", page, size, jobId, status);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<JobApplication> appPage;
        
        if (jobId != null) {
            appPage = applicationRepository.findByJobId(jobId, pageRequest);
        } else {
            appPage = applicationRepository.findAll(pageRequest);
        }
        
        return PageResponse.<JobApplicationDTO>builder()
                .content(applicationMapper.toDTOList(appPage.getContent()))
                .page(appPage.getNumber())
                .size(appPage.getSize())
                .totalElements(appPage.getTotalElements())
                .totalPages(appPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public JobApplicationDTO getApplicationById(UUID id) {
        log.debug("Fetching application by id: {}", id);
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        return applicationMapper.toDTO(application);
    }

    public JobApplicationDTO updateApplicationStatus(UUID id, String status) {
        log.debug("Updating application status: id={}, status={}", id, status);
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found: " + id));
        application.updateStatus(com.lawfirm.brs.constants.JobApplicationStatus.valueOf(status));
        return applicationMapper.toDTO(applicationRepository.save(application));
    }

    // ==================== Helper Methods ====================

    private PageResponse<PostDTO> toPostPageResponse(Page<JobPosting> page) {
        return PageResponse.<PostDTO>builder()
                .content(page.getContent().stream().map(this::toPostDTO).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private PostDTO toPostDTO(JobPosting job) {
        return PostDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getTitle())
                .build();
    }
}
