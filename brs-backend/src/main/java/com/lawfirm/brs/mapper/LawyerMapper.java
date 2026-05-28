package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LawyerMapper {

    @Named("lawyerToDTO")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    LawyerDTO toDTO(LawyerProfile lawyer);

    @Named("lawyerToDTOWithDetails")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    LawyerDTO toDTOWithDetails(LawyerProfile lawyer);

    @Named("lawyerListToDTO")
    List<LawyerDTO> toDTOList(List<LawyerProfile> lawyers);

    @Named("lawyerListToDTOWithDetails")
    List<LawyerDTO> toDTOListWithDetails(List<LawyerProfile> lawyers);
}
