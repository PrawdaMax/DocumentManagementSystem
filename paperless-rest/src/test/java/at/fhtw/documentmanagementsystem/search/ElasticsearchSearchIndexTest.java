package at.fhtw.documentmanagementsystem.search;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.net.ConnectException;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ElasticsearchSearchIndexTest {

    @Mock
    private ElasticsearchClient client;

    @InjectMocks
    private ElasticsearchSearchIndex searchIndex;

    @Test
    void findDocumentIds_elasticsearchNotReachable_throwsSearchException() throws IOException {
        when(client.search(any(Function.class), eq(Void.class))).thenThrow(new ConnectException("Connection refused"));

        assertThatThrownBy(() -> searchIndex.findDocumentIds("Hello"))
                .isInstanceOf(SearchException.class)
                .hasRootCauseInstanceOf(ConnectException.class);
    }

    @Test
    void delete_elasticsearchNotReachable_doesNotThrow() throws IOException {
        when(client.delete(any(Function.class))).thenThrow(new ConnectException("Connection refused"));

        assertThatCode(() -> searchIndex.delete(1L)).doesNotThrowAnyException();
    }
}
