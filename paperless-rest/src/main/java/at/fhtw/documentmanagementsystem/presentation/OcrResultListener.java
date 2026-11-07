package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.messaging.OcrResultMessage;
import at.fhtw.documentmanagementsystem.messaging.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OcrResultListener {

    private final DocumentService documentService;

    @RabbitListener(queues = RabbitMqConfig.OCR_RESULT_QUEUE)
    public void onOcrResult(OcrResultMessage message) {
        documentService.saveOcrResult(message.documentId(), message.content());
    }
}
