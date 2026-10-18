package at.fhtw.documentmanagementsystem.messaging;

import at.fhtw.documentmanagementsystem.business.exception.MessagePublishException;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitOcrMessagePublisher implements OcrMessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void sendOcrMessage(OcrMessage message) {
        try {
            rabbitTemplate.convertAndSend(RabbitMqConfig.OCR_QUEUE, message);
        } catch (AmqpException e) {
            throw new MessagePublishException("Failed to send message to RabbitMQ queue " + RabbitMqConfig.OCR_QUEUE, e);
        }
    }
}