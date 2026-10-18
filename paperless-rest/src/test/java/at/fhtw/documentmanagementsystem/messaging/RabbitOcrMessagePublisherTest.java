package at.fhtw.documentmanagementsystem.messaging;

import at.fhtw.documentmanagementsystem.business.exception.MessagePublishException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RabbitOcrMessagePublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private RabbitOcrMessagePublisher publisher;

    @Test
    void sendOcrMessage_Success() {
        OcrMessage message = new OcrMessage(1L, "Invoice", "invoice.pdf");

        publisher.sendOcrMessage(message);

        verify(rabbitTemplate).convertAndSend(RabbitMqConfig.OCR_QUEUE, message);
    }

    @Test
    void sendOcrMessage_ThrowsMessagePublishException_WhenAmqpFails() {
        OcrMessage message = new OcrMessage(1L, "Invoice", "invoice.pdf");
        doThrow(new AmqpException("Connection error")).when(rabbitTemplate).convertAndSend(RabbitMqConfig.OCR_QUEUE, message);

        assertThrows(MessagePublishException.class, () -> publisher.sendOcrMessage(message));
    }
}