package com.decena.task.Repository;

import java.util.Optional;

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
     * Fetch a non-deleted task by ID.
     */
    Optional<Task> findByIdAndDeletedFalse(Long id);

    /**
     * Check existence of a non-deleted task.
     */
    boolean existsByIdAndDeletedFalse(Long id);

    Page<Task> findAllByDeletedTrue(Pageable pageable);

}
