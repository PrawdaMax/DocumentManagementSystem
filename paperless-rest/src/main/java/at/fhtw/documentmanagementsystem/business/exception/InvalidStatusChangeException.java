package at.fhtw.documentmanagementsystem.business.exception;

public class InvalidStatusChangeException extends RuntimeException {

    public InvalidStatusChangeException(String message) {
        super(message);
    }
}
