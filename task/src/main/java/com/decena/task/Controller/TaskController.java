package com.decena.task.Controller;

import java.util.List;

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

    // CREATE
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(201).body(response); // 201 Created
    }

    // READ ALL WITH PAGINATION
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<TaskResponse> tasks = taskService.getAllTasks(page, size);
        return ResponseEntity.ok(tasks);
    }

    // READ ONE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        TaskResponse response = taskService.getTaskById(id); // Throws ResourceNotFoundException if not found
        return ResponseEntity.ok(response);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse response = taskService.updateTask(id, request); // Throws ResourceNotFoundException if not found
        return ResponseEntity.ok(response);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id); // Throws ResourceNotFoundException if not found
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // MARK AS COMPLETED
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> markTaskAsCompleted(@PathVariable Long id) {
        TaskResponse response = taskService.markTaskAsCompleted(id); // Throws ResourceNotFoundException if not found
        return ResponseEntity.ok(response);
    }

    @GetMapping("/deleted")
public ResponseEntity<List<TaskResponse>> getDeletedTasks(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    List<TaskResponse> tasks = taskService.getDeletedTasks(page, size);
    return ResponseEntity.ok(tasks);
}
}
