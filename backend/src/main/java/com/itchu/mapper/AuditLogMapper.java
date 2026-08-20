package com.itchu.mapper;

import com.itchu.domain.AuditLog;
import com.itchu.dto.audit.AuditLogResponse;

import java.util.List;

public final class AuditLogMapper {

    private AuditLogMapper() {
    }

    public static AuditLogResponse toResponse(AuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }
        String nomComplet = auditLog.getUser() != null
                ? auditLog.getUser().getPrenom() + " " + auditLog.getUser().getNom()
                : "Systeme";
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getUser() != null ? auditLog.getUser().getId() : null,
                nomComplet,
                auditLog.getTypeAction(),
                auditLog.getEntiteCible(),
                auditLog.getIdEntiteCible(),
                auditLog.getDetail(),
                auditLog.getDateAction());
    }

    public static List<AuditLogResponse> toResponseList(List<AuditLog> logs) {
        return logs.stream().map(AuditLogMapper::toResponse).toList();
    }
}
