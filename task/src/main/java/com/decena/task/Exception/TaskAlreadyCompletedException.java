package com.decena.task.Exception;

public class TaskAlreadyCompletedException extends RuntimeException {
    public TaskAlreadyCompletedException(String message) {
        super(message);
    }
}
