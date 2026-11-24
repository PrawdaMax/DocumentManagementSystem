package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.messaging.GenAiResultMessage;
import at.fhtw.documentmanagementsystem.messaging.RabbitMqConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GenAiResultListener {

    private final DocumentService documentService;

    @RabbitListener(queues = RabbitMqConfig.GENAI_RESULT_QUEUE)
    public void onGenAiResult(GenAiResultMessage message) {
        documentService.saveSummaryResult(message.documentId(), message.summary(), message.error());
    }
}
