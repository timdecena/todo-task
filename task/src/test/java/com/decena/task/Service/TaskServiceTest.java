package com.decena.task.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDateTime;
import java.util.List;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;
import com.decena.task.Exception.ResourceNotFoundException;
import com.decena.task.Repository.TaskRepository;
import com.decena.task.Service.ServiceImpl.RecurrenceService;
import com.decena.task.Service.ServiceImpl.TaskServiceImpl;
import com.decena.task.Mapper.TaskMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class TaskServiceTest {

    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    private TaskMapper taskMapper = new TaskMapper();

    @BeforeEach
    void setup() {
        taskService = new TaskServiceImpl(taskRepository, taskMapper, new RecurrenceService());
    }

    @Test
    void testCreateTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Test Task");
        request.setDescription("Testing create task");
        request.setPriority("HIGH");
        request.setDeadline(LocalDateTime.now().plusDays(2));

        TaskResponse response = taskService.createTask(request);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Task");
        assertThat(response.getPriority()).isEqualTo("HIGH");
    }

    

    @Test
    void testDeleteTaskThrowsExceptionIfNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(999L));
    }
}
