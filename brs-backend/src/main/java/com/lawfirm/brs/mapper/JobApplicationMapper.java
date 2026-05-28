package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.JobApplicationDTO;
import com.lawfirm.brs.entity.JobApplication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface JobApplicationMapper {

    @Named("jobAppToDTO")
    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    JobApplicationDTO toDTO(JobApplication application);

    @Named("jobAppToDTOWithDetails")
    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "jobTitle", source = "job.title")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    JobApplicationDTO toDTOWithDetails(JobApplication application);

    List<JobApplicationDTO> toDTOList(List<JobApplication> applications);
}
