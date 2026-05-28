package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ServiceEntityMapper {

    @Named("serviceToDTO")
    @Mapping(target = "parentId", source = "parent.id")
    ServiceDTO toDTO(ServiceEntity service);

    @Named("serviceToDTOWithDetails")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.slug")
    ServiceDTO toDTOWithDetails(ServiceEntity service);

    List<ServiceDTO> toDTOList(List<ServiceEntity> services);
}
