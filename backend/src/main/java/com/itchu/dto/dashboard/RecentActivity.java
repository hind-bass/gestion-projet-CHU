package com.itchu.dto.dashboard;

import java.time.LocalDateTime;

public record RecentActivity(
        Long id,
        String typeAction,
        String entiteCible,
        Long idEntiteCible,
        String detail,
        String auteur,
        LocalDateTime dateAction) {
}
