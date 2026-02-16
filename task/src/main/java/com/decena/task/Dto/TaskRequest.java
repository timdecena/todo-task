package com.decena.task.Dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    private String description;

    // Optional: defaults to LOW if null
    private String priority; // HIGH, MODERATE, LOW

    // Optional: defaults to TODO if null
    private String status; // TODO, IN_PROGRESS, DONE

    // Optional board order used for Kanban column ordering.
    private Long boardOrder;

    // Optional recurrence type. Defaults to NONE.
    private String recurrenceType; // NONE, DAILY, WEEKLY, MONTHLY

    // Optional recurrence interval. Defaults to 1.
    private Integer recurrenceInterval;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime recurrenceEndAt;

    // Optional group identifier for recurring series.
    private String recurrenceGroupId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
}
