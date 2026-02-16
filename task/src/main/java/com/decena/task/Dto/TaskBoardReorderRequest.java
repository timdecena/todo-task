package com.decena.task.Dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for reordering tasks inside one Kanban column.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskBoardReorderRequest {

    /**
     * Column status being reordered.
     */
    @NotBlank(message = "Status is required")
    private String status;

    /**
     * Ordered list of task IDs for the column.
     */
    @NotEmpty(message = "orderedTaskIds must not be empty")
    private List<Long> orderedTaskIds;
}
