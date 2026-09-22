package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceImplTest {

    @Mock
    private DocumentRepository documentRepository;

    private DocumentServiceImpl documentService;

    @BeforeEach
    void setUp() {
        documentService = new DocumentServiceImpl(documentRepository, new DocumentMapper());
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
    void create_savesNewDocumentAndReturnsIt() {
        DocumentDto input = DocumentDto.builder().id(99L).title("Invoice").fileName("invoice.pdf").build();
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(document(1L, "Invoice"));

        DocumentDto result = documentService.create(input);

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isNull();
        assertThat(captor.getValue().getTitle()).isEqualTo("Invoice");
        assertThat(captor.getValue().getFileName()).isEqualTo("invoice.pdf");
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void update_existingId_updatesFields() {
        DocumentEntity existing = document(1L, "Old title");
        DocumentDto input = DocumentDto.builder().title("New title").fileName("new.pdf").fileSize(2048L).build();
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(documentRepository.save(existing)).thenReturn(existing);

        DocumentDto result = documentService.update(1L, input);

        assertThat(result.getTitle()).isEqualTo("New title");
        assertThat(result.getFileName()).isEqualTo("new.pdf");
        assertThat(result.getFileSize()).isEqualTo(2048L);
    }

    @Test
    void delete_existingId_deletesDocument() {
        DocumentEntity existing = document(1L, "Invoice");
        when(documentRepository.findById(1L)).thenReturn(Optional.of(existing));

        documentService.delete(1L);

        verify(documentRepository).delete(existing);
    }

    private static DocumentEntity document(Long id, String title) {
        return DocumentEntity.builder().id(id).title(title).build();
    }
}
