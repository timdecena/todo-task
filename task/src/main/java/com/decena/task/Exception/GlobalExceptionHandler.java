package com.decena.task.Exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;


/**
 * Global exception handler for all REST controllers.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

   

    @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
public ResponseEntity<Map<String, Object>> handleNoHandlerFound(org.springframework.web.servlet.NoHandlerFoundException ex) {
    String message = "No endpoint found for " + ex.getHttpMethod() + " " + ex.getRequestURL();
    return buildResponse(HttpStatus.NOT_FOUND, "Not Found", message);
}

    /** Handles soft-deleted tasks (200 success) */
    @ExceptionHandler(TaskAlreadyDeletedException.class)
    public ResponseEntity<Map<String, Object>> handleTaskAlreadyDeleted(TaskAlreadyDeletedException ex) {
        return buildResponse(HttpStatus.OK, "Success", ex.getMessage());
    }

  

    /** Handles malformed JSON body */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJson(HttpMessageNotReadableException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Malformed JSON", "Request body is invalid or unreadable");
    }

    /** Handles DTO validation errors */
   @ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors()
        .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

    Map<String, Object> body = new HashMap<>();
    body.put("timestamp", LocalDateTime.now());
    body.put("status", HttpStatus.BAD_REQUEST.value());
    body.put("error", "Validation Failed");
    body.put("errors", errors);

    return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
}

    

    /** Catch-all fallback for unexpected exceptions */
  

    /* ================= Helper Methods ================= */

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = baseBody(status, error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }

    private Map<String, Object> baseBody(HttpStatus status, String error) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        return body;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("priority")) {
            message = "Invalid priority value. Allowed values: HIGH, MODERATE, LOW";
        } else if (message != null && message.contains("status")) {
            message = "Invalid status value. Allowed values: TODO, IN_PROGRESS, DONE";
        } else if (message != null && message.contains("RecurrenceType")) {
            message = "Invalid recurrence type. Allowed values: NONE, DAILY, WEEKLY, MONTHLY";
        }
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid Request", message);
    }

 /** ================= Invalid Path Variable (e.g., /tasks/4asdsad) ================= */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String name = ex.getName();
        String type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String message = "Invalid value for parameter '" + name + "'. Expected type: " + type;
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid Parameter", message);
    }

  /** Handles unsupported HTTP methods (405) */
@ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        String supportedMethods = "";
        if (ex.getSupportedHttpMethods() != null) {
            supportedMethods = ex.getSupportedHttpMethods()
                                  .stream()
                                  .map(HttpMethod::name)
                                  .collect(Collectors.joining(", "));
        }
        String message = "Method '" + ex.getMethod() + "' is not supported. Supported methods: " + supportedMethods;
        return buildResponse(HttpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed", message);
    }

    @ExceptionHandler(TaskAlreadyCompletedException.class)
public ResponseEntity<Map<String, Object>> handleTaskAlreadyCompleted(TaskAlreadyCompletedException ex) {
    return buildResponse(HttpStatus.BAD_REQUEST, "Business Rule Violation", ex.getMessage());
}


/**
 * Handles resource not found errors (404).
 *
 * @param ex thrown exception
 * @return 404 response body
 */
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
    return buildResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage());
}

    
}
