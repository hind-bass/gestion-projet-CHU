package com.itchu.service.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Default no-op implementation used while the AI micro-service (Phase 2) is not wired.
 * Activated whenever {@code app.ai.enabled} is false or absent.
 */
@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "false", matchIfMissing = true)
public class NoOpMeetingAiPipeline implements MeetingAiPipeline {

    private static final Logger log = LoggerFactory.getLogger(NoOpMeetingAiPipeline.class);

    @Override
    public void enqueueProcessing(Long meetingId) {
        log.info("AI disabled — skipping AI processing for meeting {}", meetingId);
    }
}
