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
                .status(task.getStatus() != null ? task.getStatus().name() : null)
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
            .deadline(request.getDeadline())
            .build();

    task.setPrioritySafe(request.getPriority());
    task.setStatusSafe(request.getStatus());

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

        if (request.getDeadline() != null)
            task.setDeadline(request.getDeadline());
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
        return Task.Status.valueOf(value.toUpperCase());
    }
}
