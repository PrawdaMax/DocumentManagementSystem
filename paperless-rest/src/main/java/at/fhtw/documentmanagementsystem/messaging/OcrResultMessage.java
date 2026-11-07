package at.fhtw.documentmanagementsystem.messaging;

public record OcrResultMessage(
        Long documentId,
        String content
) {}
