package com.decena.task.Service;

import java.util.List;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Dto.TaskStatusUpdateRequest;
import com.decena.task.Dto.TaskBoardReorderRequest;

public interface TaskService {
    TaskResponse createTask(TaskRequest request);
    TaskResponse getTaskById(Long id);
    List<TaskResponse> getAllTasks(int page, int size, String sortBy, String sortDir);
    TaskResponse updateTask(Long id, TaskRequest request);
    void deleteTask(Long id);
    TaskResponse markTaskAsCompleted(Long id);
    List<TaskResponse> getDeletedTasks(int page, int size);

    /**
     * Restores a soft-deleted task.
     *
     * @param id task ID
     * @return restored task response
     * @throws com.decena.task.Exception.ResourceNotFoundException when task does not exist
     * @throws IllegalArgumentException when task is not deleted
     */
    TaskResponse restoreTask(Long id);

    /**
     * Updates the Kanban status of one active task.
     *
     * @param id task ID
     * @param request status payload
     * @return updated task response
     * @throws com.decena.task.Exception.ResourceNotFoundException when task does not exist
     * @throws IllegalArgumentException when status is invalid
     */
    TaskResponse updateTaskStatus(Long id, TaskStatusUpdateRequest request);

    /**
     * Reorders tasks inside one Kanban column.
     *
     * @param request reorder payload
     * @throws IllegalArgumentException when payload is invalid
     */
    void reorderBoard(TaskBoardReorderRequest request);

}
