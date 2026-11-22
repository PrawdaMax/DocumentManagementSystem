package at.fhtw.documentmanagementsystem.messaging;

public record GenAiMessage(
        Long documentId,
        String content
) {}
