package com.itchu.dto.meeting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record MeetingRequest(
        @NotNull(message = "Le projet est obligatoire") Long projectId,
        @NotBlank(message = "Le titre est obligatoire") String titre,
        @NotNull(message = "La date est obligatoire") LocalDateTime date,
        List<Long> participantIds,
        String ordreDuJour,
        String notesManuelles,
        String transcriptionBrute) {
}
