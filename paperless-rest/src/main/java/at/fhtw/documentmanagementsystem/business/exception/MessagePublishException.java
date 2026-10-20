package at.fhtw.documentmanagementsystem.business.exception;

public class MessagePublishException extends BusinessException {

    public MessagePublishException(String message) {
        super(message);
    }

    public MessagePublishException(String message, Throwable cause) {
        super(message, cause);
    }
}