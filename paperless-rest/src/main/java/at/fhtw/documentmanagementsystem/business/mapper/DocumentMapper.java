package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentMapper extends AbstractMapper<DocumentEntity, DocumentDto> {

    @Override
    public DocumentDto mapToDto(DocumentEntity entity) {
        if (entity == null) {
            return null;
        }
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

    public DocumentEntity mapToEntity(DocumentUploadDto uploadDto) {
        if (uploadDto == null) {
            return null;
        }
        return DocumentEntity.builder()
                .title(uploadDto.getTitle())
                .fileName(uploadDto.getFileName())
                .contentType("application/pdf")
                .fileSize(uploadDto.getContent() != null ? (long) uploadDto.getContent().length : 0L)
                .build();
    }
}