package at.fhtw.documentmanagementsystem.business.exception;

public class InvalidDocumentException extends BusinessException {

    public InvalidDocumentException(String message) {
        super(message);
    }

    public InvalidDocumentException(String message, Throwable cause) {
        super(message, cause);
    }
}