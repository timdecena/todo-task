package com.decena.task.Repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.decena.task.Entity.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Fetch all non-deleted tasks with pagination.
     */
    Page<Task> findByDeletedFalse(Pageable pageable);

    /**
     * Fetch all active tasks by status, sorted by board order.
     *
     * @param status target task status
     * @return ordered list of active tasks
     */
    List<Task> findByDeletedFalseAndStatusOrderByBoardOrderAscIdAsc(Task.Status status);

    /**
     * Fetch active tasks by IDs.
     *
     * @param ids task IDs
     * @return matching active tasks
     */
    List<Task> findByIdInAndDeletedFalse(List<Long> ids);

    /**
     * Find the largest board order in one active column.
     *
     * @param status target status
     * @return top ordered task if present
     */
    Optional<Task> findTopByDeletedFalseAndStatusOrderByBoardOrderDesc(Task.Status status);


    /**
     * Fetch a non-deleted task by ID.
     */
    Optional<Task> findByIdAndDeletedFalse(Long id);

    /**
     * Check existence of a non-deleted task.
     */
    boolean existsByIdAndDeletedFalse(Long id);

    Page<Task> findAllByDeletedTrue(Pageable pageable);

    Page<Task> findByDeletedTrue(Pageable pageable);

}
