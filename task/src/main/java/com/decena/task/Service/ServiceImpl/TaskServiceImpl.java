package com.decena.task.Service.ServiceImpl;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<TaskResponse> getAllTasks(int page, int size) {
        return taskRepository.findByDeletedFalse(PageRequest.of(page, size))
                .map(taskMapper::toResponse)
                .toList();
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
    Task task = findActiveTask(id);
    taskMapper.updateEntity(request, task);
    Task saved = taskRepository.save(task); // 
    return taskMapper.toResponse(saved);
}

    /**
     * Soft deletes a task.
     *
     * @param id task ID
     */
    @Override
    public void deleteTask(Long id) {
        Task task = findActiveTask(id);
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
                .toList();
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
