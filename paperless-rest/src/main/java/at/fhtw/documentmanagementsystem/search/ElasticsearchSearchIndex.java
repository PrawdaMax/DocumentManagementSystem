package at.fhtw.documentmanagementsystem.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ElasticsearchSearchIndex implements SearchIndex {

    private static final String INDEX = "documents";
    private static final int MAX_HITS = 100;

    private final ElasticsearchClient client;

    @Override
    public List<Long> findDocumentIds(String query) {
        try {
            SearchResponse<Void> response = client.search(s -> s
                    .index(INDEX)
                    .ignoreUnavailable(true)
                    .size(MAX_HITS)
                    .query(q -> q.multiMatch(m -> m.query(query).fields("title", "content").fuzziness("AUTO")))
                    .source(source -> source.fetch(false)), Void.class);
            return response.hits().hits().stream().map(hit -> Long.valueOf(hit.id())).toList();
        } catch (IOException | ElasticsearchException e) {
            throw new SearchException("Search in Elasticsearch failed", e);
        }
    }

    @Override
    public void delete(Long documentId) {
        try {
            client.delete(d -> d.index(INDEX).id(documentId.toString()));
        } catch (IOException | ElasticsearchException e) {
            log.warn("Could not remove document {} from the search index", documentId, e);
        }
    }
}
