package com.decena.task.Mapper;

import org.springframework.stereotype.Component;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;

@Component
public class TaskMapper {

    // Entity -> Response DTO
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

    // Request DTO -> Entity
    public Task toEntity(TaskRequest request) {
        if (request == null) return null;

        Task.Priority priority = request.getPriority() != null
                ? Task.Priority.valueOf(request.getPriority())
                : Task.Priority.LOW;

        Task.Status status = request.getStatus() != null
                ? Task.Status.valueOf(request.getStatus())
                : Task.Status.PENDING;

        return Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(priority)
                .status(status)
                .deadline(request.getDeadline())
                // dateCreated handled by entity lifecycle
                .build();
    }

    // Optionally: Update existing entity with request DTO
    public void updateEntity(TaskRequest request, Task task) {
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(Task.Priority.valueOf(request.getPriority()));
        if (request.getStatus() != null) task.setStatus(Task.Status.valueOf(request.getStatus()));
        if (request.getDeadline() != null) task.setDeadline(request.getDeadline());
    }
}
