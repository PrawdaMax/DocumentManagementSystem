package at.fhtw.documentmanagementsystem.messaging;

public interface MessagePublisher {

    void sendOcrMessage(OcrMessage message);

    void sendIndexMessage(IndexMessage message);
}