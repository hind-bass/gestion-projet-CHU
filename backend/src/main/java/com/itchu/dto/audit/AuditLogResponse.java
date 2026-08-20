package com.itchu.dto.audit;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long userId,
        String userNomComplet,
        String typeAction,
        String entiteCible,
        Long idEntiteCible,
        String detail,
        LocalDateTime dateAction) {
}
