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
import org.hibernate.annotations.ColumnTransformer;
@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    /**
     * Unique identifier of the task.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Short title describing the task.
     */
    @Column(nullable = false, length = 150)
    private String title;

    /**
     * Detailed description of the task.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Timestamp when the task was created.
     * Automatically initialized before database insert.
     */
    @Column(name = "date_created", nullable = false, updatable = false)
    private LocalDateTime dateCreated;

    /**
     * Priority level of the task.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Priority priority;

    /**
     * Deadline of the task.
     */
    private LocalDateTime deadline;

    /**
     * Current status of the task.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 32, columnDefinition = "varchar(32)")
    private Status status;

    /**
     * Position inside a Kanban column.
     * Lower number means higher placement.
     */
    @Column(name = "board_order")
    private Long boardOrder;

    /**
     * Recurrence pattern of the task.
     */
    @Enumerated(EnumType.STRING)
    @ColumnTransformer(read = "case when recurrence_type in ('NONE','DAILY','WEEKLY','MONTHLY') then recurrence_type else 'NONE' end")
    @Column(name = "recurrence_type", length = 16, columnDefinition = "varchar(16)")
    private RecurrenceType recurrenceType;

    /**
     * Recurrence interval (every N units based on recurrence type).
     */
    @Column(name = "recurrence_interval")
    private Integer recurrenceInterval;

    /**
     * Optional upper bound for next recurring deadlines.
     */
    @Column(name = "recurrence_end_at")
    private LocalDateTime recurrenceEndAt;

    /**
     * Optional identifier linking recurring series tasks.
     */
    @Column(name = "recurrence_group_id", length = 64)
    private String recurrenceGroupId;

    /**
     * Soft delete flag.
     * TRUE  -> Task is logically deleted
     * FALSE -> Task is active
     */
    @Column(nullable = false)
    private boolean deleted;

    /* =========================================================
       ============ ENTITY LIFECYCLE MANAGEMENT =================
       ========================================================= */

    /**
     * Initializes default values before persisting to database.
     */
    @PrePersist
    public void prePersist() {

        if (this.dateCreated == null) { 
            this.dateCreated = LocalDateTime.now();
        }

        if (this.status == null) {
            this.status = Status.TODO;
        }

        if (this.priority == null) {
            this.priority = Priority.LOW;
        }

        if (this.recurrenceType == null) {
            this.recurrenceType = RecurrenceType.NONE;
        }

        if (this.recurrenceInterval == null || this.recurrenceInterval < 1) {
            this.recurrenceInterval = 1;
        }

        this.deleted = false;
    }

    /* =========================================================
       ================ DOMAIN BUSINESS METHODS =================
       ========================================================= */

    /**
     * Marks task as completed.
     *
     * @throws TaskAlreadyCompletedException if task is already completed
     */
    public void markAsCompleted() {
        if (this.status == Status.DONE || this.status == Status.COMPLETED) {
            throw new TaskAlreadyCompletedException("Task is already completed");
        }

        this.status = Status.DONE;
    }

    /**
     * Safely sets task priority from string input.
     *
     * @param priorityValue priority string (HIGH, MODERATE, LOW)
     * @throws IllegalArgumentException if invalid priority is provided
     */
    public void setPrioritySafe(String priorityValue) {

        if (priorityValue == null || priorityValue.isBlank()) {
            this.priority = null;
            return;
        }

        try {
            this.priority = Priority.valueOf(priorityValue.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid priority value: " + priorityValue);
        }
    }

    /**
     * Safely sets task status from string input.
     *
     * @param statusValue status string (PENDING, COMPLETED)
     * @throws IllegalArgumentException if invalid status is provided
     */
    public void setStatusSafe(String statusValue) {

        if (statusValue == null || statusValue.isBlank()) {
            this.status = null;
            return;
        }

        try {
            String normalized = statusValue.toUpperCase();
            if ("PENDING".equals(normalized)) {
                normalized = "TODO";
            } else if ("COMPLETED".equals(normalized)) {
                normalized = "DONE";
            }
            this.status = Status.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status value: " + statusValue);
        }
    }

    /**
     * Marks task as soft deleted.
     */
    public void softDelete() {
        this.deleted = true;
    }

    /* =========================================================
       ====================== ENUMS =============================
       ========================================================= */

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
        TODO,
        IN_PROGRESS,
        DONE,
        /**
         * Legacy value kept for backward compatibility with existing rows.
         */
        PENDING,
        /**
         * Legacy value kept for backward compatibility with existing rows.
         */
        COMPLETED
    }

    /**
     * Recurrence options for automatic next-task generation.
     */
    public enum RecurrenceType {
        NONE,
        DAILY,
        WEEKLY,
        MONTHLY
    }

     /**
     * Updates deadline with validation.
     * Deadline must NOT be in the past and must NOT be before dateCreated.
     *
     * @param newDeadline the new deadline value (nullable)
     * @throws IllegalArgumentException if deadline is in the past or before dateCreated
     */
    public void updateDeadline(LocalDateTime newDeadline) {

        if (newDeadline == null) {
            this.deadline = null;
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        if (newDeadline.isBefore(now)) {
            throw new IllegalArgumentException("Deadline must not be in the past");
        }

        // If dateCreated is already set, enforce deadline >= dateCreated
        if (this.dateCreated != null && newDeadline.isBefore(this.dateCreated)) {
            throw new IllegalArgumentException("Deadline must not be before date created");
        }

        this.deadline = newDeadline;
    }
}
