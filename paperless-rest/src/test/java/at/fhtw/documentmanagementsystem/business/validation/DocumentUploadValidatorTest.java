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
                .fileContent("%PDF-1.4 test content".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatCode(() -> validator.validate(dto)).doesNotThrowAnyException();
    }

    @Test
    void validate_blankTitle_doesNotThrowException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("   ")
                .fileName("rechnung.pdf")
                .fileContent("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatCode(() -> validator.validate(dto)).doesNotThrowAnyException();
    }

    @Test
    void validate_titleLongerThan255Characters_throwsInvalidDocumentException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("a".repeat(256))
                .fileName("rechnung.pdf")
                .fileContent("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatThrownBy(() -> validator.validate(dto))
                .isInstanceOf(InvalidDocumentException.class)
                .hasMessage("Title must not be longer than 255 characters");
    }

    @Test
    void validate_fileNameLongerThan255Characters_throwsInvalidDocumentException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .fileName("a".repeat(252) + ".pdf")
                .fileContent("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatThrownBy(() -> validator.validate(dto))
                .isInstanceOf(InvalidDocumentException.class)
                .hasMessageContaining("255 characters");
    }

    @Test
    void validate_invalidExtension_throwsInvalidDocumentException() {
        DocumentUploadDto dto = DocumentUploadDto.builder()
                .title("Rechnung")
                .fileName("rechnung.txt")
                .fileContent("%PDF-1.4 test".getBytes(StandardCharsets.UTF_8))
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
                .fileContent("NOT_A_PDF_CONTENT".getBytes(StandardCharsets.UTF_8))
                .build();

        assertThatThrownBy(() -> validator.validate(dto))
                .isInstanceOf(InvalidDocumentException.class)
                .hasMessageContaining("magic bytes");
    }
}