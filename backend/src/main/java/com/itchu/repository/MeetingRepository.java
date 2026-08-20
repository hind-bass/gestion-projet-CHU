package com.itchu.repository;

import com.itchu.domain.Meeting;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @EntityGraph(attributePaths = {"project", "participants"})
    @Override
    List<Meeting> findAll();

    @EntityGraph(attributePaths = {"project", "participants"})
    @Override
    Optional<Meeting> findById(Long id);

    @EntityGraph(attributePaths = {"project", "participants"})
    List<Meeting> findByProjectId(Long projectId);

    @EntityGraph(attributePaths = {"project", "participants"})
    List<Meeting> findByParticipants_IdOrderByDateAsc(Long userId);

    long countByParticipants_IdAndDateBetween(Long userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
