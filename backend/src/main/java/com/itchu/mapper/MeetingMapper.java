package com.itchu.mapper;

import com.itchu.domain.Meeting;
import com.itchu.domain.MeetingAction;
import com.itchu.domain.MeetingDecision;
import com.itchu.dto.meeting.MeetingActionResponse;
import com.itchu.dto.meeting.MeetingDecisionResponse;
import com.itchu.dto.meeting.MeetingResponse;

import java.util.List;

public final class MeetingMapper {

    private MeetingMapper() {
    }

    public static MeetingResponse toResponse(
            Meeting meeting, List<MeetingAction> actions, List<MeetingDecision> decisions) {
        if (meeting == null) {
            return null;
        }
        return new MeetingResponse(
                meeting.getId(),
                meeting.getProject() != null ? meeting.getProject().getId() : null,
                meeting.getProject() != null ? meeting.getProject().getNom() : null,
                meeting.getTitre(),
                meeting.getDate(),
                UserMapper.toResponseList(MapperUtils.copyList(meeting.getParticipants())),
                meeting.getOrdreDuJour(),
                meeting.getTranscriptionBrute(),
                meeting.getResumeGenere(),
                meeting.getNotesManuelles(),
                meeting.getStatutTraitement(),
                actions == null ? List.of() : actions.stream().map(MeetingMapper::toActionResponse).toList(),
                decisions == null ? List.of() : decisions.stream().map(MeetingMapper::toDecisionResponse).toList());
    }

    public static MeetingActionResponse toActionResponse(MeetingAction action) {
        return new MeetingActionResponse(
                action.getId(),
                action.getTexteAction(),
                action.getIntervenantDetecte(),
                action.getDateDetectee(),
                action.getTaskGeneree() != null ? action.getTaskGeneree().getId() : null);
    }

    public static MeetingDecisionResponse toDecisionResponse(MeetingDecision decision) {
        return new MeetingDecisionResponse(decision.getId(), decision.getTexteDecision(), decision.isStatutTraite());
    }
}
