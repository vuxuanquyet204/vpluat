package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import org.mapstruct.IterableMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface LawyerMapper {

    @Named("lawyerToDTOSimple")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "languages", source = "languages", defaultExpression = "java(java.util.Collections.emptyList())")
    @Mapping(target = "serviceIds", source = "serviceIds")
    @Mapping(target = "isFeatured", source = "isActive")
    @Mapping(target = "createdById", source = "createdBy")
    LawyerDTO toDTO(LawyerProfile lawyer);

    @Named("lawyerToDTODetails")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "languages", source = "languages", defaultExpression = "java(java.util.Collections.emptyList())")
    @Mapping(target = "serviceIds", source = "serviceIds")
    @Mapping(target = "isFeatured", source = "isActive")
    @Mapping(target = "createdById", source = "createdBy")
    LawyerDTO toDTOWithDetails(LawyerProfile lawyer);

    @IterableMapping(qualifiedByName = "lawyerToDTOSimple")
    List<LawyerDTO> toDTOList(List<LawyerProfile> lawyers);

    @IterableMapping(qualifiedByName = "lawyerToDTODetails")
    List<LawyerDTO> toDTOListWithDetails(List<LawyerProfile> lawyers);
}
