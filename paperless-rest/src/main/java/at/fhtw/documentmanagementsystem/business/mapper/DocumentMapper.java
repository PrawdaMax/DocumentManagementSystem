package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper extends AbstractMapper<DocumentEntity, DocumentDto> {

    @Override
    public DocumentDto mapToDto(DocumentEntity entity) {
        return DocumentDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .fileName(entity.getFileName())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .uploadedAt(entity.getUploadedAt())
                .status(entity.getStatus())
                .build();
    }

    public DocumentEntity mapToEntity(DocumentDto dto) {
        return DocumentEntity.builder()
                .title(dto.getTitle())
                .fileName(dto.getFileName())
                .contentType(dto.getContentType())
                .fileSize(dto.getFileSize())
                .build();
    }
}
