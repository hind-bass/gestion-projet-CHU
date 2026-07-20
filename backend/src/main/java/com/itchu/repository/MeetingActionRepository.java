package com.itchu.repository;

import com.itchu.domain.MeetingAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingActionRepository extends JpaRepository<MeetingAction, Long> {

    List<MeetingAction> findByMeetingId(Long meetingId);
}
