package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
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
public class ServiceEntityMapperImpl implements ServiceEntityMapper {

    @Override
    public ServiceDTO toDTO(ServiceEntity service) {
        if ( service == null ) {
            return null;
        }

        ServiceDTO.ServiceDTOBuilder serviceDTO = ServiceDTO.builder();

        serviceDTO.parentId( serviceParentId( service ) );
        serviceDTO.id( service.getId() );
        serviceDTO.slug( service.getSlug() );
        serviceDTO.icon( service.getIcon() );
        serviceDTO.isFeatured( service.getIsFeatured() );
        serviceDTO.isActive( service.getIsActive() );
        serviceDTO.displayOrder( service.getDisplayOrder() );
        serviceDTO.createdAt( service.getCreatedAt() );

        return serviceDTO.build();
    }

    @Override
    public ServiceDTO toDTOWithDetails(ServiceEntity service) {
        if ( service == null ) {
            return null;
        }

        ServiceDTO.ServiceDTOBuilder serviceDTO = ServiceDTO.builder();

        serviceDTO.parentId( serviceParentId( service ) );
        serviceDTO.parentName( serviceParentSlug( service ) );
        serviceDTO.id( service.getId() );
        serviceDTO.slug( service.getSlug() );
        serviceDTO.icon( service.getIcon() );
        serviceDTO.isFeatured( service.getIsFeatured() );
        serviceDTO.isActive( service.getIsActive() );
        serviceDTO.displayOrder( service.getDisplayOrder() );
        serviceDTO.createdAt( service.getCreatedAt() );

        return serviceDTO.build();
    }

    @Override
    public List<ServiceDTO> toDTOList(List<ServiceEntity> services) {
        if ( services == null ) {
            return null;
        }

        List<ServiceDTO> list = new ArrayList<ServiceDTO>( services.size() );
        for ( ServiceEntity serviceEntity : services ) {
            list.add( serviceEntityToServiceDTO( serviceEntity ) );
        }

        return list;
    }

    private UUID serviceParentId(ServiceEntity serviceEntity) {
        if ( serviceEntity == null ) {
            return null;
        }
        ServiceEntity parent = serviceEntity.getParent();
        if ( parent == null ) {
            return null;
        }
        UUID id = parent.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String serviceParentSlug(ServiceEntity serviceEntity) {
        if ( serviceEntity == null ) {
            return null;
        }
        ServiceEntity parent = serviceEntity.getParent();
        if ( parent == null ) {
            return null;
        }
        String slug = parent.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }

    protected ServiceDTO serviceEntityToServiceDTO(ServiceEntity serviceEntity) {
        if ( serviceEntity == null ) {
            return null;
        }

        ServiceDTO.ServiceDTOBuilder serviceDTO = ServiceDTO.builder();

        serviceDTO.id( serviceEntity.getId() );
        serviceDTO.slug( serviceEntity.getSlug() );
        serviceDTO.icon( serviceEntity.getIcon() );
        serviceDTO.isFeatured( serviceEntity.getIsFeatured() );
        serviceDTO.isActive( serviceEntity.getIsActive() );
        serviceDTO.displayOrder( serviceEntity.getDisplayOrder() );
        serviceDTO.createdAt( serviceEntity.getCreatedAt() );

        return serviceDTO.build();
    }
}
