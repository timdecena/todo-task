package com.decena.task.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * Creates a new task.
     */
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(201).body(taskService.createTask(request));
    }

    /**
     * Retrieves all active tasks with pagination.
     */
   @GetMapping
public ResponseEntity<List<TaskResponse>> getAllTasks(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "dateCreated") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
) {
    return ResponseEntity.ok(taskService.getAllTasks(page, size, sortBy, sortDir));
}

    /**
     * Retrieves a single task by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(
                taskService.getTaskById(id)
        );
    }

    /**
     * Updates a task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(
                taskService.updateTask(id, request)
        );
    }

    /**
     * Soft deletes a task.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTask(@PathVariable Long id) {
    taskService.deleteTask(id);

    Map<String, Object> response = new HashMap<>();
    response.put("status", HttpStatus.OK.value());
    response.put("message", "Task successfully deleted");

    return ResponseEntity.ok(response);
}

    /**
     * Marks a task as completed.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> markTaskAsCompleted(@PathVariable Long id) {
        return ResponseEntity.ok(
                taskService.markTaskAsCompleted(id)
        );
    }

    /**
     * Retrieves deleted tasks.
     */
    @GetMapping("/deleted")
    public ResponseEntity<List<TaskResponse>> getDeletedTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                taskService.getDeletedTasks(page, size)
        );
    }
}
