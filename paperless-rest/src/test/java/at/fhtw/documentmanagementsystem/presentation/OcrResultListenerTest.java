package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.messaging.OcrResultMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OcrResultListenerTest {

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private OcrResultListener listener;

    @Test
    void onOcrResult_savesTextAtDocument() {
        listener.onOcrResult(new OcrResultMessage(1L, "Hello World"));

        verify(documentService).saveOcrResult(1L, "Hello World");
    }
}
