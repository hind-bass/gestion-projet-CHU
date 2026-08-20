package com.itchu.dto.meeting;

import java.time.LocalDate;

public record MeetingActionResponse(
        Long id,
        String texteAction,
        String intervenantDetecte,
        LocalDate dateDetectee,
        Long taskGenereeId) {
}
