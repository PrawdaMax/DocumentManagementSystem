package at.fhtw.documentmanagementsystem.business.exception;

public class DocumentLockedException extends BusinessException {

    public DocumentLockedException(String message) {
        super(message);
    }
}
