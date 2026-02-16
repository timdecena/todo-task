package com.decena.task.Mapper;

import org.springframework.stereotype.Component;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;

@Component
public class TaskMapper {

    /**
     * Converts Task entity to TaskResponse DTO.
     *
     * @param task entity to convert
     * @return TaskResponse DTO
     */
    public TaskResponse toResponse(Task task) {
        if (task == null) return null;

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                .status(normalizeStatus(task.getStatus()))
                .boardOrder(task.getBoardOrder())
                .recurrenceType(task.getRecurrenceType() != null ? task.getRecurrenceType().name() : null)
                .recurrenceInterval(task.getRecurrenceInterval())
                .recurrenceEndAt(task.getRecurrenceEndAt())
                .recurrenceGroupId(task.getRecurrenceGroupId())
                .deadline(task.getDeadline())
                .dateCreated(task.getDateCreated())
                .build();
    }

    /**
     * Converts TaskRequest DTO to Task entity.
     * Entity lifecycle handles default values.
     *
     * @param request request DTO
     * @return Task entity
     * @throws IllegalArgumentException if enum value is invalid
     */
   public Task toEntity(TaskRequest request) {
    if (request == null) return null;

    Task task = Task.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .boardOrder(request.getBoardOrder())
            .recurrenceInterval(request.getRecurrenceInterval())
            .recurrenceEndAt(request.getRecurrenceEndAt())
            .recurrenceGroupId(request.getRecurrenceGroupId())
            .deadline(request.getDeadline())
            .build();

    task.setPrioritySafe(request.getPriority());
    task.setStatusSafe(request.getStatus());
    task.setRecurrenceType(convertRecurrenceType(request.getRecurrenceType()));

    return task;
}

    /**
     * Updates existing Task entity using TaskRequest DTO.
     *
     * @param request request DTO
     * @param task existing entity
     * @throws IllegalArgumentException if enum value is invalid
     */
    public void updateEntity(TaskRequest request, Task task) {

        if (request.getTitle() != null)
            task.setTitle(request.getTitle());

        if (request.getDescription() != null)
            task.setDescription(request.getDescription());

        if (request.getPriority() != null)
            task.setPriority(convertPriority(request.getPriority()));

        if (request.getStatus() != null)
            task.setStatus(convertStatus(request.getStatus()));

        if (request.getBoardOrder() != null)
            task.setBoardOrder(request.getBoardOrder());

        if (request.getDeadline() != null)
            task.setDeadline(request.getDeadline());

        if (request.getRecurrenceType() != null)
            task.setRecurrenceType(convertRecurrenceType(request.getRecurrenceType()));

        if (request.getRecurrenceInterval() != null)
            task.setRecurrenceInterval(request.getRecurrenceInterval());

        task.setRecurrenceEndAt(request.getRecurrenceEndAt());

        if (request.getRecurrenceGroupId() != null)
            task.setRecurrenceGroupId(request.getRecurrenceGroupId());
    }

    /**
     * Converts String priority to Enum.
     *
     * @param value priority string
     * @return Priority enum or null
     * @throws IllegalArgumentException if invalid value
     */
    private Task.Priority convertPriority(String value) {
        if (value == null) return null;
        return Task.Priority.valueOf(value.toUpperCase());
    }

    /**
     * Converts String status to Enum.
     *
     * @param value status string
     * @return Status enum or null
     * @throws IllegalArgumentException if invalid value
     */
    private Task.Status convertStatus(String value) {
        if (value == null) return null;
        String normalized = value.toUpperCase();
        if ("PENDING".equals(normalized)) {
            normalized = "TODO";
        } else if ("COMPLETED".equals(normalized)) {
            normalized = "DONE";
        }
        return Task.Status.valueOf(normalized);
    }

    /**
     * Converts String recurrence type to Enum.
     *
     * @param value recurrence type string
     * @return recurrence enum or NONE when input is null/blank
     * @throws IllegalArgumentException if invalid value
     */
    private Task.RecurrenceType convertRecurrenceType(String value) {
        if (value == null || value.isBlank()) return Task.RecurrenceType.NONE;
        return Task.RecurrenceType.valueOf(value.toUpperCase());
    }

    /**
     * Converts legacy database status values to current API values.
     *
     * @param status entity status
     * @return normalized status string for API response
     */
    private String normalizeStatus(Task.Status status) {
        if (status == null) {
            return null;
        }
        if (status == Task.Status.PENDING) {
            return Task.Status.TODO.name();
        }
        if (status == Task.Status.COMPLETED) {
            return Task.Status.DONE.name();
        }
        return status.name();
    }
}
