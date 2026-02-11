package com.decena.task.Service;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.decena.task.Dto.TaskRequest;
import com.decena.task.Dto.TaskResponse;
import com.decena.task.Entity.Task;
import com.decena.task.Exception.ResourceNotFoundException;
import com.decena.task.Mapper.TaskMapper;
import com.decena.task.Repository.TaskRepository;
import com.decena.task.Service.ServiceImpl.TaskServiceImpl;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private TaskMapper taskMapper;

    @InjectMocks
    private TaskServiceImpl taskService;

    // ---------------- CREATE TASK ----------------
    @Test
    void createTask_shouldReturnTaskResponse() {
        // Arrange
        TaskRequest request = TaskRequest.builder()
                .title("New Task")
                .priority("HIGH")
                .deadline(LocalDateTime.now().plusDays(1))
                .build();

        Task entity = Task.builder().title("New Task").build();
        Task savedEntity = Task.builder()
                .id(1L)
                .title("New Task")
                .status(Task.Status.PENDING)
                .build();
        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .title("New Task")
                .status("PENDING")
                .build();

        when(taskMapper.toEntity(request)).thenReturn(entity);
        when(taskRepository.save(entity)).thenReturn(savedEntity);
        when(taskMapper.toResponse(savedEntity)).thenReturn(response);

        // Act
        TaskResponse result = taskService.createTask(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("New Task");
        verify(taskRepository).save(entity);
    }

    // ---------------- GET TASK BY ID ----------------
    @Test
    void getTaskById_shouldReturnTask() {
        Task entity = Task.builder()
                .id(1L)
                .title("Sample")
                .deleted(false)
                .build();
        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .title("Sample")
                .build();

        when(taskRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(entity));
        when(taskMapper.toResponse(entity)).thenReturn(response);

        TaskResponse result = taskService.getTaskById(1L);

        assertThat(result.getTitle()).isEqualTo("Sample");
    }

    @Test
    void getTaskById_shouldThrowException_whenNotFound() {
        when(taskRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(1L));
    }

    // ---------------- UPDATE TASK ----------------
    @Test
    void updateTask_shouldUpdateTask() {
        TaskRequest request = TaskRequest.builder()
                .title("Updated Task")
                .priority("LOW")
                .build();

        Task existingTask = Task.builder()
                .id(1L)
                .title("Old Task")
                .deleted(false)
                .build();

        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .title("Updated Task")
                .build();

        when(taskRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(existingTask));
        when(taskRepository.save(existingTask)).thenReturn(existingTask); // required
        when(taskMapper.toResponse(existingTask)).thenReturn(response);

        TaskResponse result = taskService.updateTask(1L, request);

        assertThat(result.getTitle()).isEqualTo("Updated Task");
        verify(taskMapper).updateEntity(request, existingTask);
        verify(taskRepository).save(existingTask);
    }

    // ---------------- DELETE TASK ----------------
    @Test
    void deleteTask_shouldMarkTaskDeleted() {
        Task task = Task.builder()
                .id(1L)
                .deleted(false)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task); // stub save

        taskService.deleteTask(1L);

        assertThat(task.isDeleted()).isTrue();
        verify(taskRepository).save(task);
    }

    @Test
    void deleteTask_shouldThrowException_whenTaskNotFound() {
        when(taskRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(1L));
    }

    // ---------------- MARK TASK AS COMPLETED ----------------
    @Test
    void markTaskAsCompleted_shouldUpdateStatus() {
        Task task = Task.builder()
                .id(1L)
                .status(Task.Status.PENDING)
                .deleted(false)
                .build();

        TaskResponse response = TaskResponse.builder()
                .id(1L)
                .status("COMPLETED")
                .build();

        when(taskRepository.findByIdAndDeletedFalse(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(response);

        TaskResponse result = taskService.markTaskAsCompleted(1L);

        assertThat(result.getStatus()).isEqualTo("COMPLETED");
        verify(taskRepository).save(task);
    }

    // ---------------- GET ALL TASKS ----------------
   
}
