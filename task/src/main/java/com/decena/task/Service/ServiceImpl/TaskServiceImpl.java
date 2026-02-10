package com.decena.task.Service.ServiceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;
import com.decena.task.Exception.ResourceNotFoundException;
import com.decena.task.Exception.TaskAlreadyDeletedException;
import com.decena.task.Mapper.TaskMapper;
import com.decena.task.Repository.TaskRepository;
import com.decena.task.Service.TaskService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    /**
     * Creates a new task.
     *
     * @param request task creation payload
     * @return created task response
     */
    @Override
    public TaskResponse createTask(TaskRequest request) {
        Task entity = taskMapper.toEntity(request);
        // Ensure dateCreated exists before validating deadline
        if (entity.getDateCreated() == null) {
            entity.setDateCreated(LocalDateTime.now());
        }
        // Validate/set deadline (not past, not before dateCreated)
        entity.updateDeadline(entity.getDeadline());
        Task saved = taskRepository.save(entity);
        return taskMapper.toResponse(saved);
    }

    /**
     * Retrieves all active tasks with pagination.
     *
     * @param page page number
     * @param size page size
     * @return list of active tasks
     */
    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(int page, int size, String sortBy, String sortDir) {
        // allowlist: prevents sorting by random fields (security + stability)
        Set<String> allowedSortFields = Set.of("deadline", "priority", "status", "dateCreated");

        String safeSortBy = allowedSortFields.contains(sortBy) ? sortBy : "dateCreated";

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, safeSortBy));

        return taskRepository.findByDeletedFalse(pageable)
                .map(taskMapper::toResponse)
                .getContent();
    }

    /**
     * Retrieves a single active task by ID.
     *
     * @param id task ID
     * @return task response
     * @throws ResourceNotFoundException if task not found
     */
    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        return taskMapper.toResponse(findActiveTask(id));
    }

    /**
     * Updates an existing task.
     *
     * @param id task ID
     * @param request update payload
     * @return updated task response
     */
    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {
        // Fetch existing non-deleted task
        Task task = findActiveTask(id);
        // Map updatable fields from request -> entity (excluding deadline logic)
        taskMapper.updateEntity(request, task);
        // Validate & update deadline explicitly (not past, not before dateCreated)
        task.updateDeadline(request.getDeadline());
        // Persist changes
        Task saved = taskRepository.save(task);
        // Convert entity -> response DTO
        return taskMapper.toResponse(saved);
    }

    /**
     * Soft deletes a task.
     *
     * @param id task ID
     */
    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

        if (task.isDeleted()) {
            throw new TaskAlreadyDeletedException("Task already successfully deleted");
        }

        task.setDeleted(true);
        taskRepository.save(task);
    }

    /**
     * Marks a task as completed.
     *
     * @param id task ID
     * @return updated task response
     */
    @Override
    public TaskResponse markTaskAsCompleted(Long id) {
        Task task = findActiveTask(id);
        task.markAsCompleted();
        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    /**
     * Retrieves deleted tasks with pagination.
     *
     * @param page page number
     * @param size page size
     * @return list of deleted tasks
     */
    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getDeletedTasks(int page, int size) {
        return taskRepository.findAllByDeletedTrue(PageRequest.of(page, size))
                .map(taskMapper::toResponse)
                .getContent();
    }

    /**
     * Finds active (non-deleted) task.
     *
     * @param id task ID
     * @return task entity
     * @throws ResourceNotFoundException if task not found
     */
    private Task findActiveTask(Long id) {
        return taskRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found with id: " + id));
    }
}
