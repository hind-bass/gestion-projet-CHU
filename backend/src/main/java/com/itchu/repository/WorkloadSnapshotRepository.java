package com.itchu.repository;

import com.itchu.domain.WorkloadSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkloadSnapshotRepository extends JpaRepository<WorkloadSnapshot, Long> {

    List<WorkloadSnapshot> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
}
