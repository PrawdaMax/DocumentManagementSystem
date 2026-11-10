package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentHistoryEntity;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.Instant;
import java.util.List;

import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.IN_REVIEW;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.RECEIVED;
import static org.assertj.core.api.Assertions.assertThat;

class DocumentHistoryMapperTest {

    private final DocumentHistoryMapper documentHistoryMapper = Mappers.getMapper(DocumentHistoryMapper.class);

    @Test
    void mapToDto_copiesAllFields() {
        Instant changedAt = Instant.parse("2026-01-15T10:00:00Z");
        DocumentHistoryEntity entity = DocumentHistoryEntity.builder()
                .id(1L)
                .status(IN_REVIEW)
                .changedAt(changedAt)
                .comment("Checked")
                .build();

        DocumentHistoryDto dto = documentHistoryMapper.mapToDto(entity);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getStatus()).isEqualTo(IN_REVIEW);
        assertThat(dto.getChangedAt()).isEqualTo(changedAt);
        assertThat(dto.getComment()).isEqualTo("Checked");
    }

    @Test
    void mapToDto_list_keepsOrder() {
        List<DocumentHistoryEntity> entities = List.of(
                DocumentHistoryEntity.builder().id(2L).status(IN_REVIEW).build(),
                DocumentHistoryEntity.builder().id(1L).status(RECEIVED).build());

        List<DocumentHistoryDto> dtos = documentHistoryMapper.mapToDto(entities);

        assertThat(dtos).extracting(DocumentHistoryDto::getId).containsExactly(2L, 1L);
    }
}
