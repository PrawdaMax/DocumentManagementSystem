package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentMapperTest {

    private final DocumentMapper documentMapper = new DocumentMapper();

    @Test
    void mapToDto_copiesAllFields() {
        Instant uploadedAt = Instant.parse("2026-01-15T10:00:00Z");
        DocumentEntity entity = DocumentEntity.builder()
                .id(1L)
                .title("Invoice")
                .fileName("invoice.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadedAt(uploadedAt)
                .build();

        DocumentDto dto = documentMapper.mapToDto(entity);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getTitle()).isEqualTo("Invoice");
        assertThat(dto.getFileName()).isEqualTo("invoice.pdf");
        assertThat(dto.getContentType()).isEqualTo("application/pdf");
        assertThat(dto.getFileSize()).isEqualTo(1024L);
        assertThat(dto.getUploadedAt()).isEqualTo(uploadedAt);
    }

    @Test
    void mapToEntity_ignoresServerManagedFields() {
        DocumentDto dto = DocumentDto.builder()
                .id(99L)
                .title("Invoice")
                .fileName("invoice.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .uploadedAt(Instant.now())
                .build();

        DocumentEntity entity = documentMapper.mapToEntity(dto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getUploadedAt()).isNull();
        assertThat(entity.getTitle()).isEqualTo("Invoice");
        assertThat(entity.getFileName()).isEqualTo("invoice.pdf");
        assertThat(entity.getContentType()).isEqualTo("application/pdf");
        assertThat(entity.getFileSize()).isEqualTo(1024L);
    }
}
