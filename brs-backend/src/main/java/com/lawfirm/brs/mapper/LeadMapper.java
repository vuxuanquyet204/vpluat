package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.entity.Lead;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {UserMapper.class})
public interface LeadMapper {

    @Named("leadToDTO")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "assignedToId", source = "assignedTo.id")
    @Mapping(target = "assignedToName", source = "assignedTo.fullName")
    @Mapping(target = "status", expression = "java(lead.getStatus().name())")
    LeadDTO toDTO(Lead lead);

    @Named("leadToDTOWithDetails")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "assignedToId", source = "assignedTo.id")
    @Mapping(target = "assignedToName", source = "assignedTo.fullName")
    @Mapping(target = "status", expression = "java(lead.getStatus().name())")
    LeadDTO toDTOWithDetails(Lead lead);

    List<LeadDTO> toDTOList(List<Lead> leads);
}
