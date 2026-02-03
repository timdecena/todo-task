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

    // Optional: defaults to PENDING if null
    private String status; // PENDING, COMPLETED

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;
}
