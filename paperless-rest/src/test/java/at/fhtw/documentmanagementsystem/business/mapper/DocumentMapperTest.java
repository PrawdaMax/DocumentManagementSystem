package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DocumentMapperTest {

    private final DocumentMapper documentMapper = Mappers.getMapper(DocumentMapper.class);

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
    void mapToEntity_fromUploadDto_setsCorrectFields() {
        byte[] content = "%PDF-1.4 test content".getBytes(StandardCharsets.UTF_8);
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .title("Invoice")
                .fileName("invoice.pdf")
                .content(content)
                .build();

        DocumentEntity entity = documentMapper.mapToEntity(uploadDto);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getUploadedAt()).isNull();
        assertThat(entity.getTitle()).isEqualTo("Invoice");
        assertThat(entity.getFileName()).isEqualTo("invoice.pdf");
        assertThat(entity.getContentType()).isEqualTo("application/pdf");
        assertThat(entity.getFileSize()).isEqualTo((long) content.length);
    }

    @Test
    void mapToEntity_withoutTitle_usesFileNameAsTitle() {
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .fileName("invoice.pdf")
                .content("%PDF-1.4".getBytes(StandardCharsets.UTF_8))
                .build();

        DocumentEntity entity = documentMapper.mapToEntity(uploadDto);

        assertThat(entity.getTitle()).isEqualTo("invoice.pdf");
    }

    @Test
    void mapToDto_null_returnsNull() {
        assertThat(documentMapper.mapToDto((DocumentEntity) null)).isNull();
    }

    @Test
    void mapToDto_list_mapsEveryEntity() {
        List<DocumentEntity> entities = List.of(
                DocumentEntity.builder().id(1L).title("A").build(),
                DocumentEntity.builder().id(2L).title("B").build());

        List<DocumentDto> dtos = documentMapper.mapToDto(entities);

        assertThat(dtos).extracting(DocumentDto::getTitle).containsExactly("A", "B");
    }

    @Test
    void mapToEntity_startsWithEmptyHistory() {
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .fileName("invoice.pdf")
                .content("%PDF-1.4".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThat(documentMapper.mapToEntity(uploadDto).getHistory()).isEmpty();
    }
}
