package at.fhtw.documentmanagementsystem.business.exception;

public class InvalidStatusChangeException extends BusinessException {

    public InvalidStatusChangeException(String message) {
        super(message);
    }

    public InvalidStatusChangeException(String message, Throwable cause) {
        super(message, cause);
    }
}