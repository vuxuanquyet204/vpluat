package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_DEFAULT)
public interface ServiceEntityMapper {

    @Named("serviceToDTO")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "title", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "titleEn", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "excerpt", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "excerptEn", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "parentName", source = "parent.slug")
    ServiceDTO toDTO(ServiceEntity service);

    @Named("serviceToDTOWithDetails")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.slug")
    @Mapping(target = "title", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "titleEn", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "excerpt", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    @Mapping(target = "excerptEn", expression = "java(service.getName() != null ? service.getName() : service.getSlug())")
    ServiceDTO toDTOWithDetails(ServiceEntity service);

    List<ServiceDTO> toDTOList(List<ServiceEntity> services);
}
