package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentHistoryEntity;
import org.springframework.stereotype.Component;

@Component
public class DocumentHistoryMapper extends AbstractMapper<DocumentHistoryEntity, DocumentHistoryDto> {

    @Override
    public DocumentHistoryDto mapToDto(DocumentHistoryEntity entity) {
        return DocumentHistoryDto.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .changedAt(entity.getChangedAt())
                .comment(entity.getComment())
                .build();
    }
}
