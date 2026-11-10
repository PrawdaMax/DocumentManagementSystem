package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidSearchQueryException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import at.fhtw.documentmanagementsystem.search.SearchIndex;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentSearchServiceImplTest {

    @Mock
    private SearchIndex searchIndex;

    @Mock
    private DocumentRepository documentRepository;

    @Spy
    private DocumentMapper documentMapper = Mappers.getMapper(DocumentMapper.class);

    @InjectMocks
    private DocumentSearchServiceImpl documentSearchService;

    @Test
    void search_returnsDocumentsInOrderOfRelevance() {
        when(searchIndex.findDocumentIds("Hello")).thenReturn(List.of(2L, 1L));
        when(documentRepository.findAllById(List.of(2L, 1L))).thenReturn(List.of(document(1L), document(2L)));

        List<DocumentDto> result = documentSearchService.search("Hello");

        assertThat(result).extracting(DocumentDto::getId).containsExactly(2L, 1L);
    }

    @Test
    void search_hitWithoutDocumentInDatabase_isSkipped() {
        when(searchIndex.findDocumentIds("Hello")).thenReturn(List.of(1L, 99L));
        when(documentRepository.findAllById(List.of(1L, 99L))).thenReturn(List.of(document(1L)));

        List<DocumentDto> result = documentSearchService.search("Hello");

        assertThat(result).extracting(DocumentDto::getId).containsExactly(1L);
    }

    @Test
    void search_noHits_returnsEmptyList() {
        when(searchIndex.findDocumentIds("Unknown")).thenReturn(List.of());

        assertThat(documentSearchService.search("Unknown")).isEmpty();
    }

    @Test
    void search_trimsQuery() {
        documentSearchService.search("  Hello  ");

        verify(searchIndex).findDocumentIds("Hello");
    }

    @Test
    void search_blankQuery_throwsInvalidSearchQueryException() {
        assertThatThrownBy(() -> documentSearchService.search("   "))
                .isInstanceOf(InvalidSearchQueryException.class);
        verifyNoInteractions(searchIndex);
    }

    @Test
    void search_queryLongerThan200Characters_throwsInvalidSearchQueryException() {
        assertThatThrownBy(() -> documentSearchService.search("a".repeat(201)))
                .isInstanceOf(InvalidSearchQueryException.class);
        verifyNoInteractions(searchIndex);
    }

    private static DocumentEntity document(Long id) {
        return DocumentEntity.builder().id(id).title("Document " + id).build();
    }
}
