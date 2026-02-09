package com.decena.task.Exception;

/**
 * Exception thrown when an operation is performed
 * on a task that is already soft deleted.
 */
public class TaskAlreadyDeletedException extends RuntimeException {

    /**
     * Constructor
     *
     * @param message error message
     */
    public TaskAlreadyDeletedException(String message) {
        super(message);
    }
}
