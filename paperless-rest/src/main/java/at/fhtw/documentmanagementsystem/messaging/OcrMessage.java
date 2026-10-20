package at.fhtw.documentmanagementsystem.messaging;

public record OcrMessage(
        Long documentId,
        String title,
        String fileName
) {}