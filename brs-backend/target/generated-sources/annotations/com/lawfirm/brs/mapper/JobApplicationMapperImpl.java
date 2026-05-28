package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.JobApplicationDTO;
import com.lawfirm.brs.entity.JobApplication;
import com.lawfirm.brs.entity.JobPosting;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:02+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class JobApplicationMapperImpl implements JobApplicationMapper {

    @Override
    public JobApplicationDTO toDTO(JobApplication application) {
        if ( application == null ) {
            return null;
        }

        JobApplicationDTO.JobApplicationDTOBuilder jobApplicationDTO = JobApplicationDTO.builder();

        jobApplicationDTO.jobId( applicationJobId( application ) );
        jobApplicationDTO.jobTitle( applicationJobTitle( application ) );
        jobApplicationDTO.id( application.getId() );
        jobApplicationDTO.fullName( application.getFullName() );
        jobApplicationDTO.email( application.getEmail() );
        jobApplicationDTO.phone( application.getPhone() );
        jobApplicationDTO.cvUrl( application.getCvUrl() );
        jobApplicationDTO.coverLetter( application.getCoverLetter() );
        jobApplicationDTO.appliedAt( application.getAppliedAt() );
        jobApplicationDTO.updatedAt( application.getUpdatedAt() );

        jobApplicationDTO.status( application.getStatus().name() );

        return jobApplicationDTO.build();
    }

    @Override
    public JobApplicationDTO toDTOWithDetails(JobApplication application) {
        if ( application == null ) {
            return null;
        }

        JobApplicationDTO.JobApplicationDTOBuilder jobApplicationDTO = JobApplicationDTO.builder();

        jobApplicationDTO.jobId( applicationJobId( application ) );
        jobApplicationDTO.jobTitle( applicationJobTitle( application ) );
        jobApplicationDTO.id( application.getId() );
        jobApplicationDTO.fullName( application.getFullName() );
        jobApplicationDTO.email( application.getEmail() );
        jobApplicationDTO.phone( application.getPhone() );
        jobApplicationDTO.cvUrl( application.getCvUrl() );
        jobApplicationDTO.coverLetter( application.getCoverLetter() );
        jobApplicationDTO.appliedAt( application.getAppliedAt() );
        jobApplicationDTO.updatedAt( application.getUpdatedAt() );

        jobApplicationDTO.status( application.getStatus().name() );

        return jobApplicationDTO.build();
    }

    @Override
    public List<JobApplicationDTO> toDTOList(List<JobApplication> applications) {
        if ( applications == null ) {
            return null;
        }

        List<JobApplicationDTO> list = new ArrayList<JobApplicationDTO>( applications.size() );
        for ( JobApplication jobApplication : applications ) {
            list.add( jobApplicationToJobApplicationDTO( jobApplication ) );
        }

        return list;
    }

    private UUID applicationJobId(JobApplication jobApplication) {
        if ( jobApplication == null ) {
            return null;
        }
        JobPosting job = jobApplication.getJob();
        if ( job == null ) {
            return null;
        }
        UUID id = job.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String applicationJobTitle(JobApplication jobApplication) {
        if ( jobApplication == null ) {
            return null;
        }
        JobPosting job = jobApplication.getJob();
        if ( job == null ) {
            return null;
        }
        String title = job.getTitle();
        if ( title == null ) {
            return null;
        }
        return title;
    }

    protected JobApplicationDTO jobApplicationToJobApplicationDTO(JobApplication jobApplication) {
        if ( jobApplication == null ) {
            return null;
        }

        JobApplicationDTO.JobApplicationDTOBuilder jobApplicationDTO = JobApplicationDTO.builder();

        jobApplicationDTO.id( jobApplication.getId() );
        jobApplicationDTO.fullName( jobApplication.getFullName() );
        jobApplicationDTO.email( jobApplication.getEmail() );
        jobApplicationDTO.phone( jobApplication.getPhone() );
        jobApplicationDTO.cvUrl( jobApplication.getCvUrl() );
        jobApplicationDTO.coverLetter( jobApplication.getCoverLetter() );
        if ( jobApplication.getStatus() != null ) {
            jobApplicationDTO.status( jobApplication.getStatus().name() );
        }
        jobApplicationDTO.appliedAt( jobApplication.getAppliedAt() );
        jobApplicationDTO.updatedAt( jobApplication.getUpdatedAt() );

        return jobApplicationDTO.build();
    }
}
