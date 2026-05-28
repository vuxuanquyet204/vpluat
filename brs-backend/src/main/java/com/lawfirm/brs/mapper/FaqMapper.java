package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.FaqDTO;
import com.lawfirm.brs.entity.Faq;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {ServiceEntityMapper.class})
public interface FaqMapper {

    @Named("faqToDTO")
    @Mapping(target = "serviceId", source = "service.id")
    FaqDTO toDTO(Faq faq);

    @Named("faqToDTOWithDetails")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "includeContent", constant = "true")
    FaqDTO toDTOWithDetails(Faq faq);

    List<FaqDTO> toDTOList(List<Faq> faqs);
}
