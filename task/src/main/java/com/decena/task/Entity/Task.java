package com.decena.task.Entity;

import java.time.LocalDateTime;

import com.decena.task.Exception.TaskAlreadyCompletedException;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    /**
     * Primary key of the task.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Short title of the task.
     */
    @Column(nullable = false, length = 150)
    private String title;

    /**
     * Detailed description of the task.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Date and time when the task was created.
     * Automatically set on persist.
     */
    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime dateCreated;

    /**
     * Priority level of the task.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    /**
     * Deadline of the task.
     */
    private LocalDateTime deadline;

    /**
     * Current status of the task.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    /**
     * Soft delete flag.
     * TRUE  -> task is logically deleted
     * FALSE -> task is active
     */
    @Column(nullable = false)
    private boolean deleted;

    /**
     * Lifecycle callback executed before persisting the entity.
     * Initializes default values.
     */
    @PrePersist
public void prePersist() {
    if (this.dateCreated == null) this.dateCreated = LocalDateTime.now();
    if (this.status == null) this.status = Status.PENDING;
    if (this.priority == null) this.priority = Priority.LOW; // safe default
    this.deleted = false;
}


/**
     * Marks the task as completed if not already completed.
     * @return true if the status was changed, false if already completed
     */
    public void markAsCompleted() {
    if (this.status == Status.COMPLETED) {
        throw new TaskAlreadyCompletedException("Task is already completed");
    }
    this.status = Status.COMPLETED;
}

    /**
     * Task priority levels.
     */
    public enum Priority {
        HIGH,
        MODERATE,
        LOW
    }

    /**
     * Task execution status.
     */
    public enum Status {
        PENDING,
        COMPLETED
    }
}
