package at.fhtw.documentmanagementsystem.messaging;

public record GenAiResultMessage(
        Long documentId,
        String summary,
        String error
) {}
