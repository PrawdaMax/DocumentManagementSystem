package at.fhtw.documentmanagementsystem.business.validation;

import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidDocumentException;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DocumentUploadValidatorTest {

    private final DocumentUploadValidator validator = new DocumentUploadValidator();

    @Test
    void validate_validPdf_doesNotThrowException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("Rechnung")
                .fileName("rechnung.pdf")
                .content("%PDF-1.4 test content".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatCode(() -> validator.validate(dto)).doesNotThrowAnyException();
    }

    @Test
    void validate_blankTitle_doesNotThrowException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("   ")
                .fileName("rechnung.pdf")
                .content("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatCode(() -> validator.validate(dto)).doesNotThrowAnyException();
    }

    @Test
    void validate_invalidExtension_throwsInvalidDocumentException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("Rechnung")
                .fileName("rechnung.txt")
                .content("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatThrownBy(() -> validator.validate(dto))
                .isInstanceOf(InvalidDocumentException.class)
                .hasMessageContaining(".pdf extension");
    }

    @Test
    void validate_missingPdfHeader_throwsInvalidDocumentException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("Rechnung")
                .fileName("rechnung.pdf")
                .content("NOT_A_PDF_CONTENT".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatThrownBy(() -> validator.validate(dto))
                .isInstanceOf(InvalidDocumentException.class)
                .hasMessageContaining("magic bytes");
    }
}