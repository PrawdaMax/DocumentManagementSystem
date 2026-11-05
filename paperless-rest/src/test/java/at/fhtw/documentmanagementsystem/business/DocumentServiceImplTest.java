package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUpdateDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidDocumentException;
import at.fhtw.documentmanagementsystem.business.exception.InvalidStatusChangeException;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentHistoryMapper;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.business.validation.DocumentUploadValidator;
import at.fhtw.documentmanagementsystem.messaging.MessagePublishException;
import at.fhtw.documentmanagementsystem.messaging.OcrMessage;
import at.fhtw.documentmanagementsystem.messaging.OcrMessagePublisher;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentHistoryEntity;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import at.fhtw.documentmanagementsystem.storage.FileStorage;
import at.fhtw.documentmanagementsystem.storage.StorageException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.DONE;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.IN_REVIEW;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.RECEIVED;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    @Spy
    private DocumentMapper documentMapper = new DocumentMapper();

    @Spy
    private DocumentHistoryMapper documentHistoryMapper = new DocumentHistoryMapper();

    @Mock
    private DocumentUploadValidator documentUploadValidator;

    @Mock
    private OcrMessagePublisher ocrMessagePublisher;

    @Mock
    private FileStorage fileStorage;

    @InjectMocks
    private DocumentServiceImpl documentService;

    @Test
    void upload_Success_StoresFileAndPublishesOcrMessageWithSameKey() {
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .title("Rechnung")
                .fileName("rechnung.pdf")
                .content(new byte[]{0x25, 0x50, 0x44, 0x46})
                .build();

        DocumentEntity entity = document(10L, "Rechnung");
        entity.setFileName("rechnung.pdf");

        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(entity);

        DocumentDto result = documentService.upload(uploadDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        verify(documentUploadValidator).validate(uploadDto);
        ArgumentCaptor<String> objectKey = ArgumentCaptor.forClass(String.class);
        verify(fileStorage).store(objectKey.capture(), eq(uploadDto.getContent()));
        assertThat(objectKey.getValue()).endsWith(".pdf");
        verify(ocrMessagePublisher).sendOcrMessage(new OcrMessage(10L, "rechnung.pdf", objectKey.getValue()));
    }

    @Test
    void upload_publishFails_deletesStoredFileAndRethrows() {
        when(documentRepository.save(any(DocumentEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new MessagePublishException("RabbitMQ unreachable")).when(ocrMessagePublisher).sendOcrMessage(any());

        assertThatThrownBy(() -> documentService.upload(pdfUpload()))
                .isInstanceOf(MessagePublishException.class);

        ArgumentCaptor<String> objectKey = ArgumentCaptor.forClass(String.class);
        verify(fileStorage).store(objectKey.capture(), any());
        verify(fileStorage).delete(objectKey.getValue());
    }

    @Test
    void upload_storageNotReachable_savesNothingAndSendsNothing() {
        doThrow(new StorageException("Could not store file", new UnknownHostException("rustfs")))
                .when(fileStorage).store(any(), any());

        assertThatThrownBy(() -> documentService.upload(pdfUpload()))
                .isInstanceOf(StorageException.class);

        verifyNoInteractions(documentRepository, ocrMessagePublisher);
    }

    @Test
    void getById_existingId_returnsDocument() {
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document(1L, "Invoice")));

        DocumentDto result = documentService.getById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Invoice");
    }

    @Test
    void getById_unknownId_throwsResourceNotFoundException() {
        when(documentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void upload_validPdf_savesNewDocumentWithStatusReceived() {
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .title("Invoice")
                .fileName("invoice.pdf")
                .content("%PDF-1.4 content".getBytes(StandardCharsets.UTF_8))
                .build();

        when(documentRepository.save(any(DocumentEntity.class))).thenAnswer(invocation -> {
            DocumentEntity entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        DocumentDto result = documentService.upload(uploadDto);

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity saved = captor.getValue();

        assertThat(saved.getTitle()).isEqualTo("Invoice");
        assertThat(saved.getFileName()).isEqualTo("invoice.pdf");
        assertThat(saved.getContentType()).isEqualTo("application/pdf");
        assertThat(saved.getStatus()).isEqualTo(RECEIVED);
        assertThat(saved.getHistory()).extracting(DocumentHistoryEntity::getStatus).containsExactly(RECEIVED);
        assertThat(result.getId()).isEqualTo(1L);

        ArgumentCaptor<String> objectKey = ArgumentCaptor.forClass(String.class);
        verify(fileStorage).store(objectKey.capture(), any());
        assertThat(saved.getObjectKey()).isEqualTo(objectKey.getValue());
    }

    @Test
    void upload_invalidFile_throwsInvalidDocumentExceptionAndStoresNothing() {
        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .title("Invoice")
                .fileName("invoice.txt")
                .content("invalid".getBytes(StandardCharsets.UTF_8))
                .build();

        doThrow(new InvalidDocumentException("File must have a .pdf extension"))
                .when(documentUploadValidator).validate(uploadDto);

        assertThatThrownBy(() -> documentService.upload(uploadDto))
                .isInstanceOf(InvalidDocumentException.class);
        verifyNoInteractions(fileStorage, documentRepository, ocrMessagePublisher);
    }

    @Test
    void update_existingId_updatesTitle() {
        DocumentEntity existing = document(1L, "Old title");
        DocumentUpdateDto updateDto = DocumentUpdateDto.builder().title("New title").build();

        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(documentRepository.save(existing)).thenReturn(existing);

        DocumentDto result = documentService.update(1L, updateDto);

        assertThat(result.getTitle()).isEqualTo("New title");
    }

    @Test
    void delete_existingId_deletesDocumentAndFile() {
        DocumentEntity existing = document(1L, "Invoice");
        existing.setObjectKey("a.pdf");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));

        documentService.delete(1L);

        verify(documentRepository).delete(existing);
        verify(fileStorage).delete("a.pdf");
    }

    @Test
    void delete_documentWithoutFile_deletesOnlyDocument() {
        DocumentEntity existing = document(1L, "Uploaded in Sprint 3");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));

        documentService.delete(1L);

        verify(documentRepository).delete(existing);
        verifyNoInteractions(fileStorage);
    }

    @Test
    void changeStatus_allowedChange_updatesStatusAndAddsHistoryEntry() {
        DocumentEntity existing = document(1L, "Invoice");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(documentRepository.save(existing)).thenReturn(existing);

        DocumentDto result = documentService.changeStatus(1L,
                StatusChangeDto.builder().status(IN_REVIEW).comment("Review started").build());

        assertThat(result.getStatus()).isEqualTo(IN_REVIEW);
        assertThat(existing.getHistory()).hasSize(1);
        assertThat(existing.getHistory().getFirst().getStatus()).isEqualTo(IN_REVIEW);
        assertThat(existing.getHistory().getFirst().getComment()).isEqualTo("Review started");
    }

    @Test
    void changeStatus_notAllowedChange_throwsInvalidStatusChangeException() {
        DocumentEntity existing = document(1L, "Invoice");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> documentService.changeStatus(1L, StatusChangeDto.builder().status(DONE).build()))
                .isInstanceOf(InvalidStatusChangeException.class);
        assertThat(existing.getStatus()).isEqualTo(RECEIVED);
        assertThat(existing.getHistory()).isEmpty();
    }

    @Test
    void getHistory_returnsHistoryEntriesOfDocument() {
        DocumentEntity existing = document(1L, "Invoice");
        existing.getHistory().add(DocumentHistoryEntity.builder().status(IN_REVIEW).comment("Review started").build());
        existing.getHistory().add(DocumentHistoryEntity.builder().status(RECEIVED).comment("Document created").build());
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));

        List<DocumentHistoryDto> result = documentService.getHistory(1L);

        assertThat(result).extracting(DocumentHistoryDto::getStatus).containsExactly(IN_REVIEW, RECEIVED);
    }

    private static DocumentUploadDto pdfUpload() {
        return DocumentUploadDto.builder()
                .fileName("invoice.pdf")
                .content("%PDF-1.4 content".getBytes(StandardCharsets.UTF_8))
                .build();
    }

    private static DocumentEntity document(Long id, String title) {
        return DocumentEntity.builder()
                .id(id)
                .title(title)
                .status(RECEIVED)
                .history(new ArrayList<>())
                .build();
    }
}