package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.DocumentDTO;
import com.lawfirm.brs.entity.Document;
import com.lawfirm.brs.entity.ServiceEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:03+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class DocumentMapperImpl implements DocumentMapper {

    @Override
    public DocumentDTO toDTO(Document document) {
        if ( document == null ) {
            return null;
        }

        DocumentDTO.DocumentDTOBuilder documentDTO = DocumentDTO.builder();

        documentDTO.serviceName( documentServiceSlug( document ) );
        documentDTO.id( document.getId() );
        documentDTO.filePath( document.getFilePath() );
        documentDTO.fileName( document.getFileName() );
        documentDTO.fileType( document.getFileType() );
        documentDTO.fileSize( document.getFileSize() );
        documentDTO.downloadCount( document.getDownloadCount() );
        documentDTO.isPublic( document.getIsPublic() );
        documentDTO.leadGate( document.getLeadGate() );
        documentDTO.createdAt( document.getCreatedAt() );
        documentDTO.updatedAt( document.getUpdatedAt() );

        return documentDTO.build();
    }

    @Override
    public List<DocumentDTO> toDTOList(List<Document> documents) {
        if ( documents == null ) {
            return null;
        }

        List<DocumentDTO> list = new ArrayList<DocumentDTO>( documents.size() );
        for ( Document document : documents ) {
            list.add( toDTO( document ) );
        }

        return list;
    }

    private String documentServiceSlug(Document document) {
        if ( document == null ) {
            return null;
        }
        ServiceEntity service = document.getService();
        if ( service == null ) {
            return null;
        }
        String slug = service.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }
}
