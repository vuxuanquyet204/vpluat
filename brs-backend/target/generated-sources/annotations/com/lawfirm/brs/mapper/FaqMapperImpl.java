package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.FaqDTO;
import com.lawfirm.brs.entity.Faq;
import com.lawfirm.brs.entity.ServiceEntity;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:03+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class FaqMapperImpl implements FaqMapper {

    @Override
    public FaqDTO toDTO(Faq faq) {
        if ( faq == null ) {
            return null;
        }

        FaqDTO.FaqDTOBuilder faqDTO = FaqDTO.builder();

        faqDTO.serviceId( faqServiceId( faq ) );
        faqDTO.id( faq.getId() );
        faqDTO.displayOrder( faq.getDisplayOrder() );
        faqDTO.isPublished( faq.getIsPublished() );

        return faqDTO.build();
    }

    @Override
    public FaqDTO toDTOWithDetails(Faq faq) {
        if ( faq == null ) {
            return null;
        }

        FaqDTO.FaqDTOBuilder faqDTO = FaqDTO.builder();

        faqDTO.serviceId( faqServiceId( faq ) );
        faqDTO.id( faq.getId() );
        faqDTO.displayOrder( faq.getDisplayOrder() );
        faqDTO.isPublished( faq.getIsPublished() );

        faqDTO.includeContent( true );

        return faqDTO.build();
    }

    @Override
    public List<FaqDTO> toDTOList(List<Faq> faqs) {
        if ( faqs == null ) {
            return null;
        }

        List<FaqDTO> list = new ArrayList<FaqDTO>( faqs.size() );
        for ( Faq faq : faqs ) {
            list.add( faqToFaqDTO( faq ) );
        }

        return list;
    }

    private UUID faqServiceId(Faq faq) {
        if ( faq == null ) {
            return null;
        }
        ServiceEntity service = faq.getService();
        if ( service == null ) {
            return null;
        }
        UUID id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected FaqDTO faqToFaqDTO(Faq faq) {
        if ( faq == null ) {
            return null;
        }

        FaqDTO.FaqDTOBuilder faqDTO = FaqDTO.builder();

        faqDTO.id( faq.getId() );
        faqDTO.displayOrder( faq.getDisplayOrder() );
        faqDTO.isPublished( faq.getIsPublished() );

        return faqDTO.build();
    }
}
