package at.fhtw.documentmanagementsystem.messaging;

public record IndexMessage(
        Long documentId,
        String title,
        String content
) {}
