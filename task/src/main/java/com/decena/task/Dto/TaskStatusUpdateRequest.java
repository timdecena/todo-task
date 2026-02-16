package com.decena.task.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for updating task Kanban status and optional order.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskStatusUpdateRequest {

    /**
     * Target status value.
     * Accepted: TODO, IN_PROGRESS, DONE.
     */
    @NotBlank(message = "Status is required")
    private String status;

    /**
     * Optional board order in target column.
     */
    private Long boardOrder;
}
