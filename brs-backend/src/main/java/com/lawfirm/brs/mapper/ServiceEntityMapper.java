package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Auto-maps ServiceEntity ↔ ServiceDTO using field-name convention.
 *
 * <p>{@code parentId} and {@code parentName} are populated from the
 * {@code parent} association. Everything else (id, slug, name, icon,
 * isFeatured, isActive, displayOrder, createdAt) flows through MapStruct
 * auto-mapping — no synthetic {@code java(...)} expressions, no
 * multi-language fallbacks. The DTO contract matches the schema exactly.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_DEFAULT)
public interface ServiceEntityMapper {

    @Named("serviceToDTO")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.slug")
    ServiceDTO toDTO(ServiceEntity service);

    @Named("serviceToDTOWithDetails")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.slug")
    ServiceDTO toDTOWithDetails(ServiceEntity service);

    List<ServiceDTO> toDTOList(List<ServiceEntity> services);
}