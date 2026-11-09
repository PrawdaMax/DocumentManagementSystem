package at.fhtw.documentmanagementsystem.messaging;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RabbitMessagePublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private RabbitMessagePublisher publisher;

    @Test
    void sendOcrMessage_sendsToOcrQueue() {
        OcrMessage message = new OcrMessage(1L, "invoice.pdf", "a.pdf");

        publisher.sendOcrMessage(message);

        verify(rabbitTemplate).convertAndSend(RabbitMqConfig.OCR_QUEUE, message);
    }

    @Test
    void sendIndexMessage_sendsToIndexQueue() {
        IndexMessage message = new IndexMessage(1L, "Invoice", "Hello World");

        publisher.sendIndexMessage(message);

        verify(rabbitTemplate).convertAndSend(RabbitMqConfig.INDEX_QUEUE, message);
    }

    @Test
    void sendOcrMessage_rabbitMqNotReachable_throwsMessagePublishException() {
        OcrMessage message = new OcrMessage(1L, "invoice.pdf", "a.pdf");
        doThrow(new AmqpException("Connection error")).when(rabbitTemplate).convertAndSend(RabbitMqConfig.OCR_QUEUE, message);

        assertThatThrownBy(() -> publisher.sendOcrMessage(message))
                .isInstanceOf(MessagePublishException.class)
                .hasMessageContaining(RabbitMqConfig.OCR_QUEUE);
    }
}