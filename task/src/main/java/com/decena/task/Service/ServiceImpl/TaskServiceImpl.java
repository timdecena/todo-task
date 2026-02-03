package com.decena.task.Service.ServiceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;
import com.decena.task.Exception.ResourceNotFoundException;
import com.decena.task.Mapper.TaskMapper;
import com.decena.task.Repository.TaskRepository;
import com.decena.task.Service.TaskService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    /**
     * Creates a new task.
     */
    @Override
    public TaskResponse createTask(TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    /**
     * Retrieves all non-deleted tasks with pagination.
     */
    @Override
public List<TaskResponse> getAllTasks(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return taskRepository.findByDeletedFalse(pageable)
            .stream()
            .map(taskMapper::toResponse)
            .collect(Collectors.toList());
}

@Override
public TaskResponse getTaskById(Long id) {
    Task task = taskRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    return taskMapper.toResponse(task);
}

    /**
     * Updates a non-deleted task.
     */
    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found with id: " + id));

        taskMapper.updateEntity(request, task);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    /**
     * Soft deletes a task.
     */
    @Override
public void deleteTask(Long id) {
    // Optional: short-circuit if task is already deleted
    if (!taskRepository.existsByIdAndDeletedFalse(id)) {
        throw new ResourceNotFoundException("Task not found or already deleted");
    }

    // Fetch the task to mark deleted
    Task task = taskRepository.findByIdAndDeletedFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

    task.setDeleted(true);
    taskRepository.save(task);
}

    /**
     * Marks a task as completed.
     */
    @Override
    public TaskResponse markTaskAsCompleted(Long id) {
        Task task = taskRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found with id: " + id));

        task.setStatus(Task.Status.COMPLETED);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    @Override
public List<TaskResponse> getDeletedTasks(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    return taskRepository.findAllByDeletedTrue(pageable)
            .stream()
            .map(taskMapper::toResponse)
            .collect(Collectors.toList());
}
}
