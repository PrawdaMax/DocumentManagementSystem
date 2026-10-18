package at.fhtw.documentmanagementsystem.messaging;

import at.fhtw.documentmanagementsystem.business.exception.MessagePublishException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitOcrMessagePublisher implements OcrMessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void sendOcrMessage(OcrMessage message) {
        log.info("Sending OCR message for document id: {} to queue: {}", message.documentId(), RabbitMqConfig.OCR_QUEUE);
        try {
            rabbitTemplate.convertAndSend(RabbitMqConfig.OCR_QUEUE, message);
        } catch (AmqpException e) {
            throw new MessagePublishException("Failed to send message to RabbitMQ queue " + RabbitMqConfig.OCR_QUEUE, e);
        }
    }
}