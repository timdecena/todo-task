package com.decena.task.Service.ServiceImpl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.decena.task.Dto.TaskBoardReorderRequest;
import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Dto.TaskStatusUpdateRequest;
import com.decena.task.Entity.Task;
import com.decena.task.Exception.ResourceNotFoundException;
import com.decena.task.Exception.TaskAlreadyDeletedException;
import com.decena.task.Mapper.TaskMapper;
import com.decena.task.Repository.TaskRepository;
import com.decena.task.Service.TaskService;

import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final RecurrenceService recurrenceService;
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("deadline", "priority", "status", "dateCreated");

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
        if (entity.getStatus() == null) {
            entity.setStatus(Task.Status.TODO);
        }
        normalizeRecurrenceDefaults(entity);
        validateRecurrence(entity);
        if (entity.getBoardOrder() == null) {
            entity.setBoardOrder(nextBoardOrder(entity.getStatus()));
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
    String safeSortBy = (sortBy != null && ALLOWED_SORT_FIELDS.contains(sortBy)) ? sortBy : "dateCreated";
    Sort.Direction dir = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

    return taskRepository.findByDeletedFalse(PageRequest.of(page, size, Sort.by(dir, safeSortBy)))
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
        normalizeLegacyStatus(task);
        Task.Status previousStatus = task.getStatus();
        Task.Status requestedStatus = request.getStatus() != null ? parseStatus(request.getStatus()) : null;
        // Map updatable fields from request -> entity (excluding deadline logic)
        taskMapper.updateEntity(request, task);
        normalizeLegacyStatus(task);
        enforceDoneStatusLock(previousStatus, requestedStatus);
        normalizeRecurrenceDefaults(task);
        validateRecurrence(task);
        if (request.getStatus() != null && previousStatus != task.getStatus() && request.getBoardOrder() == null) {
            task.setBoardOrder(nextBoardOrder(task.getStatus()));
        }
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
     * Restores a soft-deleted task.
     *
     * @param id task ID
     * @return restored task response
     * @throws ResourceNotFoundException if task does not exist
     * @throws IllegalArgumentException if task is already active
     */
    @Override
    public TaskResponse restoreTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id " + id));

        if (!task.isDeleted()) {
            throw new IllegalArgumentException("Task is not deleted");
        }

        normalizeLegacyStatus(task);
        task.setDeleted(false);
        if (task.getBoardOrder() == null) {
            task.setBoardOrder(nextBoardOrder(task.getStatus() == null ? Task.Status.TODO : task.getStatus()));
        }

        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
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
        maybeCreateNextRecurringTask(saved);
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
        Task task = taskRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found with id: " + id));
        normalizeLegacyStatus(task);
        return task;
    }

    /**
     * Updates status/position of one active task in the Kanban board.
     *
     * @param id task ID
     * @param request status update payload
     * @return updated task response
     * @throws ResourceNotFoundException if task is missing
     * @throws IllegalArgumentException if status value is invalid
     */
    @Override
    public TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request) {
        Task task = findActiveTask(id);
        normalizeLegacyStatus(task);
        Task.Status previousStatus = task.getStatus();
        Task.Status targetStatus = parseStatus(request.getStatus());
        enforceDoneStatusLock(previousStatus, targetStatus);

        task.setStatus(targetStatus);
        if (request.getBoardOrder() != null && request.getBoardOrder() > 0) {
            task.setBoardOrder(request.getBoardOrder());
        } else {
            task.setBoardOrder(nextBoardOrder(targetStatus));
        }

        Task saved = taskRepository.save(task);
        return taskMapper.toResponse(saved);
    }

    /**
     * Reorders a full Kanban column using incoming task IDs.
     *
     * @param request reorder payload
     * @throws IllegalArgumentException if request contains invalid IDs or status mismatch
     */
    @Override
    public void reorderBoard(TaskBoardReorderRequest request) {
        if (request.getOrderedTaskIds() == null || request.getOrderedTaskIds().isEmpty()) {
            throw new IllegalArgumentException("orderedTaskIds must not be empty");
        }

        Set<Long> uniqueIds = new HashSet<>(request.getOrderedTaskIds());
        if (uniqueIds.size() != request.getOrderedTaskIds().size()) {
            throw new IllegalArgumentException("orderedTaskIds must not contain duplicates");
        }

        Task.Status status = parseStatus(request.getStatus());
        List<Task> tasks = taskRepository.findByIdInAndDeletedFalse(request.getOrderedTaskIds());
        if (tasks.size() != request.getOrderedTaskIds().size()) {
            throw new IllegalArgumentException("orderedTaskIds contains unknown task IDs");
        }

        for (Task task : tasks) {
            normalizeLegacyStatus(task);
            if (task.getStatus() != status) {
                throw new IllegalArgumentException("All tasks must belong to status " + status.name());
            }
        }

        Map<Long, Task> byId = tasks.stream().collect(Collectors.toMap(Task::getId, t -> t));
        long order = 1L;
        for (Long id : request.getOrderedTaskIds()) {
            Task task = byId.get(id);
            task.setBoardOrder(order++);
        }
        taskRepository.saveAll(tasks);
    }

    /**
     * Parses status values while supporting old API values.
     *
     * @param value status string
     * @return normalized status enum
     * @throws IllegalArgumentException if status is invalid
     */
    private Task.Status parseStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        String normalized = value.toUpperCase();
        if ("PENDING".equals(normalized)) {
            normalized = "TODO";
        } else if ("COMPLETED".equals(normalized)) {
            normalized = "DONE";
        }
        return Task.Status.valueOf(normalized);
    }

    /**
     * Returns next board order for a column.
     *
     * @param status target status column
     * @return next order number
     */
    private Long nextBoardOrder(Task.Status status) {
        return taskRepository.findTopByDeletedFalseAndStatusOrderByBoardOrderDesc(status)
                .map(task -> (task.getBoardOrder() == null ? 0L : task.getBoardOrder()) + 1L)
                .orElse(1L);
    }

    /**
     * Converts legacy task statuses to current Kanban statuses in-memory.
     *
     * @param task task to normalize
     */
    private void normalizeLegacyStatus(Task task) {
        if (task.getStatus() == Task.Status.PENDING) {
            task.setStatus(Task.Status.TODO);
        } else if (task.getStatus() == Task.Status.COMPLETED) {
            task.setStatus(Task.Status.DONE);
        }
    }

    /**
     * Ensures recurrence defaults are valid.
     *
     * @param task target task
     */
    private void normalizeRecurrenceDefaults(Task task) {
        if (task.getRecurrenceType() == null) {
            task.setRecurrenceType(Task.RecurrenceType.NONE);
        }
        if (task.getRecurrenceInterval() == null || task.getRecurrenceInterval() < 1) {
            task.setRecurrenceInterval(1);
        }
    }

    /**
     * Validates recurrence values for a task.
     *
     * @param task target task
     * @throws IllegalArgumentException when recurrence values are invalid
     */
    private void validateRecurrence(Task task) {
        if (task.getRecurrenceInterval() != null && task.getRecurrenceInterval() < 1) {
            throw new IllegalArgumentException("Recurrence interval must be at least 1");
        }

        if (task.getRecurrenceType() != null && task.getRecurrenceType() != Task.RecurrenceType.NONE) {
            if (task.getDeadline() == null) {
                throw new IllegalArgumentException("Recurring tasks must have a deadline");
            }
            if (task.getRecurrenceEndAt() != null && task.getRecurrenceEndAt().isBefore(task.getDeadline())) {
                throw new IllegalArgumentException("Recurrence end date must not be before deadline");
            }
        }
    }

    /**
     * Creates the next recurring task when recurrence settings allow it.
     *
     * @param current completed task
     */
    private void maybeCreateNextRecurringTask(Task current) {
        if (current == null || current.getRecurrenceType() == null || current.getRecurrenceType() == Task.RecurrenceType.NONE) {
            return;
        }

        LocalDateTime nextDeadline = recurrenceService.computeNextDeadline(
                current.getDeadline(),
                current.getRecurrenceType(),
                current.getRecurrenceInterval() == null ? 1 : current.getRecurrenceInterval()
        );

        if (!recurrenceService.canCreateNext(current, nextDeadline)) {
            return;
        }

        String groupId = current.getRecurrenceGroupId();
        if (groupId == null || groupId.isBlank()) {
            groupId = "rec-" + UUID.randomUUID();
            current.setRecurrenceGroupId(groupId);
            taskRepository.save(current);
        }

        Task next = Task.builder()
                .title(current.getTitle())
                .description(current.getDescription())
                .priority(current.getPriority())
                .status(Task.Status.TODO)
                .boardOrder(nextBoardOrder(Task.Status.TODO))
                .deadline(nextDeadline)
                .recurrenceType(current.getRecurrenceType())
                .recurrenceInterval(current.getRecurrenceInterval())
                .recurrenceEndAt(current.getRecurrenceEndAt())
                .recurrenceGroupId(groupId)
                .deleted(false)
                .build();

        // Ensure created timestamp exists for deadline validation.
        next.setDateCreated(LocalDateTime.now());
        next.updateDeadline(next.getDeadline());
        taskRepository.save(next);
    }

    /**
     * Prevents changing status away from DONE once task is completed.
     *
     * @param previousStatus current status before update
     * @param requestedStatus requested next status
     * @throws IllegalArgumentException when changing status from DONE to another value
     */
    private void enforceDoneStatusLock(Task.Status previousStatus, Task.Status requestedStatus) {
        if (requestedStatus == null) {
            return;
        }
        if (previousStatus == Task.Status.DONE && requestedStatus != Task.Status.DONE) {
            throw new IllegalArgumentException("Status cannot be changed once task is DONE");
        }
    }
}
