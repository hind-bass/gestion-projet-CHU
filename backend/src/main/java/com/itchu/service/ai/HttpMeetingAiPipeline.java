package com.itchu.service.ai;

import com.itchu.domain.Meeting;
import com.itchu.domain.MeetingAction;
import com.itchu.domain.MeetingDecision;
import com.itchu.domain.enums.MeetingProcessingStatus;
import com.itchu.repository.MeetingActionRepository;
import com.itchu.repository.MeetingDecisionRepository;
import com.itchu.repository.MeetingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class HttpMeetingAiPipeline implements MeetingAiPipeline {

    private static final Logger log = LoggerFactory.getLogger(HttpMeetingAiPipeline.class);

    private final MeetingRepository meetingRepository;
    private final MeetingActionRepository meetingActionRepository;
    private final MeetingDecisionRepository meetingDecisionRepository;
    private final RestClient restClient;
    private final String internalToken;

    public HttpMeetingAiPipeline(
            MeetingRepository meetingRepository,
            MeetingActionRepository meetingActionRepository,
            MeetingDecisionRepository meetingDecisionRepository,
            @Value("${app.ai.service-url}") String serviceUrl,
            @Value("${app.ai.internal-token:}") String internalToken) {
        this.meetingRepository = meetingRepository;
        this.meetingActionRepository = meetingActionRepository;
        this.meetingDecisionRepository = meetingDecisionRepository;
        this.internalToken = internalToken;
        this.restClient = RestClient.builder().baseUrl(serviceUrl).build();
    }

    @Override
    @Transactional
    public void enqueueProcessing(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId).orElse(null);
        if (meeting == null) {
            log.warn("AI pipeline skipped — meeting {} not found", meetingId);
            return;
        }

        String transcription = meeting.getTranscriptionBrute();
        if (transcription == null || transcription.isBlank()) {
            log.info("AI pipeline skipped — meeting {} has no transcript", meetingId);
            return;
        }

        meeting.setStatutTraitement(MeetingProcessingStatus.EN_COURS);
        meetingRepository.save(meeting);

        try {
            PipelineResponse response = restClient.post()
                    .uri("/internal/meetings/process")
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> {
                        if (internalToken != null && !internalToken.isBlank()) {
                            headers.setBearerAuth(internalToken);
                        }
                    })
                    .body(Map.of(
                            "meeting_id", meetingId,
                            "titre", meeting.getTitre(),
                            "transcription", transcription
                    ))
                    .retrieve()
                    .body(PipelineResponse.class);

            applyResult(meeting, response);
            meeting.setStatutTraitement(MeetingProcessingStatus.TERMINE);
            meetingRepository.save(meeting);
        } catch (Exception ex) {
            log.error("AI pipeline failed for meeting {}", meetingId, ex);
            meeting.setStatutTraitement(MeetingProcessingStatus.ERREUR);
            meetingRepository.save(meeting);
        }
    }

    private void applyResult(Meeting meeting, PipelineResponse response) {
        if (response == null) {
            return;
        }
        meeting.setResumeGenere(response.resume());

        meetingActionRepository.findByMeetingId(meeting.getId()).forEach(meetingActionRepository::delete);
        meetingDecisionRepository.findByMeetingId(meeting.getId()).forEach(meetingDecisionRepository::delete);

        if (response.actions() != null) {
            for (ActionItem item : response.actions()) {
                if (item == null || item.texte() == null || item.texte().isBlank()) {
                    continue;
                }
                MeetingAction action = new MeetingAction();
                action.setMeeting(meeting);
                action.setTexteAction(item.texte());
                action.setIntervenantDetecte(item.intervenant());
                if (item.date() != null && !item.date().isBlank()) {
                    action.setDateDetectee(LocalDate.parse(item.date()));
                }
                meetingActionRepository.save(action);
            }
        }

        if (response.decisions() != null) {
            for (DecisionItem item : response.decisions()) {
                if (item == null || item.texte() == null || item.texte().isBlank()) {
                    continue;
                }
                MeetingDecision decision = new MeetingDecision();
                decision.setMeeting(meeting);
                decision.setTexteDecision(item.texte());
                decision.setStatutTraite(false);
                meetingDecisionRepository.save(decision);
            }
        }
    }

    public record PipelineResponse(String resume, List<ActionItem> actions, List<DecisionItem> decisions) {
    }

    public record ActionItem(String texte, String intervenant, String date) {
    }

    public record DecisionItem(String texte) {
    }
}
