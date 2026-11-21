package at.fhtw.documentmanagementsystem.messaging;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String OCR_QUEUE = "ocr-queue";
    public static final String OCR_RESULT_QUEUE = "ocr-result-queue";
    public static final String INDEX_QUEUE = "index-queue";
    public static final String GENAI_QUEUE = "genai-queue";
    public static final String GENAI_RESULT_QUEUE = "genai-result-queue";

    @Bean
    public Queue ocrQueue() {
        return new Queue(OCR_QUEUE, true);
    }

    @Bean
    public Queue ocrResultQueue() {
        return new Queue(OCR_RESULT_QUEUE, true);
    }

    @Bean
    public Queue indexQueue() {
        return new Queue(INDEX_QUEUE, true);
    }

    @Bean
    public Queue genAiQueue() {
        return new Queue(GENAI_QUEUE, true);
    }

    @Bean
    public Queue genAiResultQueue() {
        return new Queue(GENAI_RESULT_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}