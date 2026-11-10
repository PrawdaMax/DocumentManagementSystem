package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidSearchQueryException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import at.fhtw.documentmanagementsystem.search.SearchIndex;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentSearchServiceImpl implements DocumentSearchService {

    private static final int MAX_QUERY_LENGTH = 200;

    private final SearchIndex searchIndex;
    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentDto> search(String query) {
        log.info("Searching documents for query: {}", query);
        if (query == null || query.isBlank() || query.length() > MAX_QUERY_LENGTH) {
            throw new InvalidSearchQueryException(
                    "Search query must not be blank or longer than " + MAX_QUERY_LENGTH + " characters");
        }

        List<Long> ids = searchIndex.findDocumentIds(query.trim());
        Map<Long, DocumentEntity> documents = documentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(DocumentEntity::getId, Function.identity()));
        return ids.stream()
                .map(documents::get)
                .filter(Objects::nonNull)
                .map(documentMapper::mapToDto)
                .toList();
    }
}
