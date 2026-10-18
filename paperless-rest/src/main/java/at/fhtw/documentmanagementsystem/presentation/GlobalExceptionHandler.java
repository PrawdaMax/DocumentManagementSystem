package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.exception.InvalidDocumentException;
import at.fhtw.documentmanagementsystem.business.exception.InvalidStatusChangeException;
import at.fhtw.documentmanagementsystem.business.exception.MessagePublishException;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        log.warn("Resource not found: {}", exception.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(InvalidDocumentException.class)
    public ProblemDetail handleInvalidDocument(InvalidDocumentException exception) {
        log.warn("Invalid document: {}", exception.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(InvalidStatusChangeException.class)
    public ProblemDetail handleInvalidStatusChange(InvalidStatusChangeException exception) {
        log.warn("Invalid status change: {}", exception.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(MessagePublishException.class)
    public ProblemDetail handleMessagePublishException(MessagePublishException exception) {
        log.error("Message publishing failed: {}", exception.getMessage(), exception);
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }

    @ExceptionHandler(DataAccessException.class)
    public ProblemDetail handleDataAccessException(DataAccessException exception) {
        log.error("Data access error occurred: {}", exception.getMessage(), exception);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "A database error occurred");
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpectedException(Exception exception) {
        log.error("Unexpected error occurred: {}", exception.getMessage(), exception);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    }

    // Nennt bei ungültigen Eingaben die betroffenen Felder, z. B. "title: must not be blank"
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException exception,
                                                                  HttpHeaders headers, HttpStatusCode status,
                                                                  WebRequest request) {
        String detail = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("Validation failed: {}", detail);
        return ResponseEntity.badRequest().body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail));
    }
}