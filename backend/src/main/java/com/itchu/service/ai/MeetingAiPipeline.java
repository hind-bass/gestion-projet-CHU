package com.itchu.service.ai;

/**
 * Extension point for the future AI processing pipeline (transcription analysis,
 * summary generation, action/decision extraction). Phase 1 ships NO implementation —
 * only the {@link NoOpMeetingAiPipeline} stub is wired by default.
 */
public interface MeetingAiPipeline {

    void enqueueProcessing(Long meetingId);
}
