package at.fhtw.documentmanagementsystem.business.validation;

import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidDocumentException;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class DocumentUploadValidator {

    private static final String PDF_MAGIC_BYTES = "%PDF-";

    public void validate(DocumentUploadDto uploadDto) {
        if (uploadDto == null) {
            throw new InvalidDocumentException("Upload payload must not be null");
        }
        if (uploadDto.getTitle() == null || uploadDto.getTitle().isBlank()) {
            throw new InvalidDocumentException("Title must not be blank");
        }
        if (uploadDto.getFileName() == null || uploadDto.getFileName().isBlank()) {
            throw new InvalidDocumentException("File name must not be blank");
        }
        if (!uploadDto.getFileName().toLowerCase().endsWith(".pdf")) {
            throw new InvalidDocumentException("File must have a .pdf extension");
        }
        if (uploadDto.getContent() == null || uploadDto.getContent().length < PDF_MAGIC_BYTES.length()) {
            throw new InvalidDocumentException("File content is empty or not a valid PDF");
        }

        String magicHeader = new String(
                uploadDto.getContent(), 0, PDF_MAGIC_BYTES.length(), StandardCharsets.US_ASCII);
        if (!PDF_MAGIC_BYTES.equals(magicHeader)) {
            throw new InvalidDocumentException("File does not start with PDF magic bytes (%PDF-)");
        }
    }
}