package com.decena.task.Service;

import java.util.List;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;

public interface TaskService {
    TaskResponse createTask(TaskRequest request);
    TaskResponse getTaskById(Long id);
    List<TaskResponse> getAllTasks(int page, int size);
    TaskResponse updateTask(Long id, TaskRequest request);
    void deleteTask(Long id);
    TaskResponse markTaskAsCompleted(Long id);
    List<TaskResponse> getDeletedTasks(int page, int size);

}
