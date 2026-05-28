package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.DocumentDTO;
import com.lawfirm.brs.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DocumentMapper {

    @Mapping(target = "serviceName", source = "service.slug")
    DocumentDTO toDTO(Document document);

    List<DocumentDTO> toDTOList(List<Document> documents);
}
