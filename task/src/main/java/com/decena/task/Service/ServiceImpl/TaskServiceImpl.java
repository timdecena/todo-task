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
        return taskMapper.toResponse(
                taskRepository.save(taskMapper.toEntity(request))
        );
    }

    /**
     * Retrieves all active (not deleted) tasks.
     */
    @Override
    public List<TaskResponse> getAllTasks(int page, int size) {
        return taskRepository.findByDeletedFalse(PageRequest.of(page, size))
                .map(taskMapper::toResponse)
                .toList();
    }

    /**
     * Retrieves one active task by ID.
     */
    @Override
    public TaskResponse getTaskById(Long id) {
        return taskMapper.toResponse(findActiveTask(id));
    }

    /**
     * Updates an active task.
     */
    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findActiveTask(id);
        taskMapper.updateEntity(request, task);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    /**
     * Soft deletes a task.
     */
    @Override
    public void deleteTask(Long id) {
        Task task = findActiveTask(id);
        task.setDeleted(true);
        taskRepository.save(task);
    }

    /**
     * Marks task as completed.
     */
    @Override
    public TaskResponse markTaskAsCompleted(Long id) {
        Task task = findActiveTask(id);
        task.setStatus(Task.Status.COMPLETED);
        return taskMapper.toResponse(taskRepository.save(task));
    }

    /**
     * Retrieves deleted tasks.
     */
    @Override
    public List<TaskResponse> getDeletedTasks(int page, int size) {
        return taskRepository.findAllByDeletedTrue(PageRequest.of(page, size))
                .map(taskMapper::toResponse)
                .toList();
    }

    // ================= HELPER METHOD =================

    /**
     * Finds active (non-deleted) task or throws exception.
     */
    private Task findActiveTask(Long id) {
        return taskRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found with id: " + id));
    }
}
