package com.itchu.service;

import com.itchu.domain.Meeting;
import com.itchu.domain.MeetingAction;
import com.itchu.domain.MeetingDecision;
import com.itchu.domain.Project;
import com.itchu.domain.User;
import com.itchu.domain.enums.MeetingProcessingStatus;
import com.itchu.dto.meeting.MeetingRequest;
import com.itchu.dto.meeting.MeetingResponse;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.mapper.MeetingMapper;
import com.itchu.repository.MeetingActionRepository;
import com.itchu.repository.MeetingDecisionRepository;
import com.itchu.repository.MeetingRepository;
import com.itchu.repository.ProjectRepository;
import com.itchu.repository.UserRepository;
import com.itchu.service.ai.MeetingAiPipeline;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingActionRepository meetingActionRepository;
    private final MeetingDecisionRepository meetingDecisionRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final MeetingAiPipeline meetingAiPipeline;

    public MeetingService(
            MeetingRepository meetingRepository,
            MeetingActionRepository meetingActionRepository,
            MeetingDecisionRepository meetingDecisionRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            AuditLogService auditLogService,
            MeetingAiPipeline meetingAiPipeline) {
        this.meetingRepository = meetingRepository;
        this.meetingActionRepository = meetingActionRepository;
        this.meetingDecisionRepository = meetingDecisionRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.meetingAiPipeline = meetingAiPipeline;
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> list() {
        return meetingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> listByProject(Long projectId) {
        return meetingRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MeetingResponse> listMine(Long userId) {
        return meetingRepository.findByParticipants_IdOrderByDateAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public Meeting findEntity(Long id) {
        return meetingRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Reunion", id));
    }

    public MeetingResponse create(MeetingRequest request, Long actorId) {
        Project project = projectRepository
                .findById(request.projectId())
                .orElseThrow(() -> ResourceNotFoundException.of("Projet", request.projectId()));

        Meeting meeting = new Meeting();
        meeting.setProject(project);
        applyRequest(meeting, request);
        meeting.setStatutTraitement(MeetingProcessingStatus.EN_ATTENTE);
        Meeting saved = meetingRepository.save(meeting);
        auditLogService.record(actorId, "CREATE", "Meeting", saved.getId(), "Creation de la reunion " + saved.getTitre());
        enqueueIfTranscriptPresent(saved);
        return toResponse(saved);
    }

    public MeetingResponse update(Long id, MeetingRequest request, Long actorId) {
        Meeting meeting = findEntity(id);
        if (!meeting.getProject().getId().equals(request.projectId())) {
            Project project = projectRepository
                    .findById(request.projectId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Projet", request.projectId()));
            meeting.setProject(project);
        }
        applyRequest(meeting, request);
        Meeting saved = meetingRepository.save(meeting);
        auditLogService.record(actorId, "UPDATE", "Meeting", saved.getId(), "Mise a jour de la reunion " + saved.getTitre());
        enqueueIfTranscriptPresent(saved);
        return toResponse(saved);
    }

    public MeetingResponse process(Long id, Long actorId) {
        Meeting meeting = findEntity(id);
        meetingAiPipeline.enqueueProcessing(meeting.getId());
        auditLogService.record(actorId, "AI_PROCESS", "Meeting", id, "Lancement du pipeline IA pour " + meeting.getTitre());
        return toResponse(findEntity(id));
    }

    public void delete(Long id, Long actorId) {
        Meeting meeting = findEntity(id);
        meetingRepository.delete(meeting);
        auditLogService.record(actorId, "DELETE", "Meeting", id, "Suppression de la reunion " + meeting.getTitre());
    }

    private void applyRequest(Meeting meeting, MeetingRequest request) {
        meeting.setTitre(request.titre());
        meeting.setDate(request.date());
        meeting.setOrdreDuJour(request.ordreDuJour());
        meeting.setNotesManuelles(request.notesManuelles());
        meeting.setTranscriptionBrute(request.transcriptionBrute());

        if (request.participantIds() != null) {
            Set<User> participants = new LinkedHashSet<>(userRepository.findAllById(request.participantIds()));
            meeting.setParticipants(participants);
        }
    }

    private void enqueueIfTranscriptPresent(Meeting meeting) {
        if (meeting.getTranscriptionBrute() != null && !meeting.getTranscriptionBrute().isBlank()) {
            meetingAiPipeline.enqueueProcessing(meeting.getId());
        }
    }

    private MeetingResponse toResponse(Meeting meeting) {
        List<MeetingAction> actions = meetingActionRepository.findByMeetingId(meeting.getId());
        List<MeetingDecision> decisions = meetingDecisionRepository.findByMeetingId(meeting.getId());
        return MeetingMapper.toResponse(meeting, actions, decisions);
    }
}
