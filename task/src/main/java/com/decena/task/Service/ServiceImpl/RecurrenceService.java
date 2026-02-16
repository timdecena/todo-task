package com.decena.task.Service.ServiceImpl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.decena.task.Entity.Task;

/**
 * Provides recurrence date utilities for recurring tasks.
 */
@Service
public class RecurrenceService {

    /**
     * Computes next deadline based on recurrence settings.
     *
     * @param currentDeadline current task deadline
     * @param type recurrence type
     * @param interval recurrence interval
     * @return next deadline or null when recurrence is disabled
     */
    public LocalDateTime computeNextDeadline(
            LocalDateTime currentDeadline,
            Task.RecurrenceType type,
            int interval
    ) {
        if (currentDeadline == null || type == null || type == Task.RecurrenceType.NONE) {
            return null;
        }

        int safeInterval = Math.max(interval, 1);
        return switch (type) {
            case DAILY -> currentDeadline.plusDays(safeInterval);
            case WEEKLY -> currentDeadline.plusWeeks(safeInterval);
            case MONTHLY -> currentDeadline.plusMonths(safeInterval);
            case NONE -> null;
        };
    }

    /**
     * Checks whether next occurrence should be created.
     *
     * @param task current task
     * @param nextDeadline computed next deadline
     * @return true when next task creation is allowed
     */
    public boolean canCreateNext(Task task, LocalDateTime nextDeadline) {
        if (task == null || nextDeadline == null) {
            return false;
        }
        if (task.getRecurrenceType() == null || task.getRecurrenceType() == Task.RecurrenceType.NONE) {
            return false;
        }
        if (task.getRecurrenceEndAt() == null) {
            return true;
        }
        return !nextDeadline.isAfter(task.getRecurrenceEndAt());
    }
}
