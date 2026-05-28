package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.entity.User;
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
public class LeadMapperImpl implements LeadMapper {

    @Override
    public LeadDTO toDTO(Lead lead) {
        if ( lead == null ) {
            return null;
        }

        LeadDTO.LeadDTOBuilder leadDTO = LeadDTO.builder();

        leadDTO.serviceId( leadServiceId( lead ) );
        leadDTO.assignedToId( leadAssignedToId( lead ) );
        leadDTO.assignedToName( leadAssignedToFullName( lead ) );
        leadDTO.id( lead.getId() );
        leadDTO.name( lead.getName() );
        leadDTO.email( lead.getEmail() );
        leadDTO.phone( lead.getPhone() );
        leadDTO.message( lead.getMessage() );
        leadDTO.source( lead.getSource() );
        leadDTO.channel( lead.getChannel() );
        leadDTO.campaignId( lead.getCampaignId() );
        leadDTO.adGroupId( lead.getAdGroupId() );
        leadDTO.utmSource( lead.getUtmSource() );
        leadDTO.utmMedium( lead.getUtmMedium() );
        leadDTO.utmCampaign( lead.getUtmCampaign() );
        leadDTO.firstContactAt( lead.getFirstContactAt() );
        leadDTO.lastContactAt( lead.getLastContactAt() );
        leadDTO.notes( lead.getNotes() );
        leadDTO.createdAt( lead.getCreatedAt() );
        leadDTO.updatedAt( lead.getUpdatedAt() );

        leadDTO.status( lead.getStatus().name() );

        return leadDTO.build();
    }

    @Override
    public LeadDTO toDTOWithDetails(Lead lead) {
        if ( lead == null ) {
            return null;
        }

        LeadDTO.LeadDTOBuilder leadDTO = LeadDTO.builder();

        leadDTO.serviceId( leadServiceId( lead ) );
        leadDTO.assignedToId( leadAssignedToId( lead ) );
        leadDTO.assignedToName( leadAssignedToFullName( lead ) );
        leadDTO.id( lead.getId() );
        leadDTO.name( lead.getName() );
        leadDTO.email( lead.getEmail() );
        leadDTO.phone( lead.getPhone() );
        leadDTO.message( lead.getMessage() );
        leadDTO.source( lead.getSource() );
        leadDTO.channel( lead.getChannel() );
        leadDTO.campaignId( lead.getCampaignId() );
        leadDTO.adGroupId( lead.getAdGroupId() );
        leadDTO.utmSource( lead.getUtmSource() );
        leadDTO.utmMedium( lead.getUtmMedium() );
        leadDTO.utmCampaign( lead.getUtmCampaign() );
        leadDTO.firstContactAt( lead.getFirstContactAt() );
        leadDTO.lastContactAt( lead.getLastContactAt() );
        leadDTO.notes( lead.getNotes() );
        leadDTO.createdAt( lead.getCreatedAt() );
        leadDTO.updatedAt( lead.getUpdatedAt() );

        leadDTO.status( lead.getStatus().name() );

        return leadDTO.build();
    }

    @Override
    public List<LeadDTO> toDTOList(List<Lead> leads) {
        if ( leads == null ) {
            return null;
        }

        List<LeadDTO> list = new ArrayList<LeadDTO>( leads.size() );
        for ( Lead lead : leads ) {
            list.add( leadToLeadDTO( lead ) );
        }

        return list;
    }

    private UUID leadServiceId(Lead lead) {
        if ( lead == null ) {
            return null;
        }
        ServiceEntity service = lead.getService();
        if ( service == null ) {
            return null;
        }
        UUID id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID leadAssignedToId(Lead lead) {
        if ( lead == null ) {
            return null;
        }
        User assignedTo = lead.getAssignedTo();
        if ( assignedTo == null ) {
            return null;
        }
        UUID id = assignedTo.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String leadAssignedToFullName(Lead lead) {
        if ( lead == null ) {
            return null;
        }
        User assignedTo = lead.getAssignedTo();
        if ( assignedTo == null ) {
            return null;
        }
        String fullName = assignedTo.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    protected LeadDTO leadToLeadDTO(Lead lead) {
        if ( lead == null ) {
            return null;
        }

        LeadDTO.LeadDTOBuilder leadDTO = LeadDTO.builder();

        leadDTO.id( lead.getId() );
        leadDTO.name( lead.getName() );
        leadDTO.email( lead.getEmail() );
        leadDTO.phone( lead.getPhone() );
        leadDTO.message( lead.getMessage() );
        leadDTO.source( lead.getSource() );
        leadDTO.channel( lead.getChannel() );
        leadDTO.campaignId( lead.getCampaignId() );
        leadDTO.adGroupId( lead.getAdGroupId() );
        leadDTO.utmSource( lead.getUtmSource() );
        leadDTO.utmMedium( lead.getUtmMedium() );
        leadDTO.utmCampaign( lead.getUtmCampaign() );
        if ( lead.getStatus() != null ) {
            leadDTO.status( lead.getStatus().name() );
        }
        leadDTO.firstContactAt( lead.getFirstContactAt() );
        leadDTO.lastContactAt( lead.getLastContactAt() );
        leadDTO.notes( lead.getNotes() );
        leadDTO.createdAt( lead.getCreatedAt() );
        leadDTO.updatedAt( lead.getUpdatedAt() );

        return leadDTO.build();
    }
}
