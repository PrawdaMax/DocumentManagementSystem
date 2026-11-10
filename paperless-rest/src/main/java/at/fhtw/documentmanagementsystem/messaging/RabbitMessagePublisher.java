package at.fhtw.documentmanagementsystem.messaging;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RabbitMessagePublisher implements MessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void sendOcrMessage(OcrMessage message) {
        send(RabbitMqConfig.OCR_QUEUE, message.documentId(), message);
    }

    @Override
    public void sendIndexMessage(IndexMessage message) {
        send(RabbitMqConfig.INDEX_QUEUE, message.documentId(), message);
    }

    private void send(String queue, Long documentId, Object message) {
        log.info("Sending message for document id: {} to queue: {}", documentId, queue);
        try {
            rabbitTemplate.convertAndSend(queue, message);
        } catch (AmqpException e) {
            throw new MessagePublishException("Failed to send message to RabbitMQ queue " + queue, e);
        }
    }
}