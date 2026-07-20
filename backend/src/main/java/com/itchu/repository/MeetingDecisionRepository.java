package com.itchu.repository;

import com.itchu.domain.MeetingDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingDecisionRepository extends JpaRepository<MeetingDecision, Long> {

    List<MeetingDecision> findByMeetingId(Long meetingId);

    long countByMeeting_Project_IdAndStatutTraiteFalse(Long projectId);
}
