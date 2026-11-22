package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.messaging.GenAiResultMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GenAiResultListenerTest {

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private GenAiResultListener listener;

    @Test
    void onGenAiResult_passesSummaryAndErrorToService() {
        listener.onGenAiResult(new GenAiResultMessage(1L, "A short summary.", null));

        verify(documentService).saveSummaryResult(1L, "A short summary.", null);
    }
}
