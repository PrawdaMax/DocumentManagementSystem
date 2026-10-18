package at.fhtw.documentmanagementsystem.messaging;

public interface OcrMessagePublisher {
    void sendOcrMessage(OcrMessage message);
}