package com.itchu.dto.meeting;

import com.itchu.domain.enums.MeetingProcessingStatus;
import com.itchu.dto.user.UserResponse;

import java.time.LocalDateTime;
import java.util.List;

public record MeetingResponse(
        Long id,
        Long projectId,
        String projectNom,
        String titre,
        LocalDateTime date,
        List<UserResponse> participants,
        String ordreDuJour,
        String transcriptionBrute,
        String resumeGenere,
        String notesManuelles,
        MeetingProcessingStatus statutTraitement,
        List<MeetingActionResponse> actions,
        List<MeetingDecisionResponse> decisions) {
}
