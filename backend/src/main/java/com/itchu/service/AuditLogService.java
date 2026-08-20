package com.itchu.service;

import com.itchu.domain.AuditLog;
import com.itchu.domain.User;
import com.itchu.dto.audit.AuditLogResponse;
import com.itchu.mapper.AuditLogMapper;
import com.itchu.repository.AuditLogRepository;
import com.itchu.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public void record(Long userId, String typeAction, String entiteCible, Long idEntiteCible, String detail) {
        AuditLog log = new AuditLog();
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            log.setUser(user);
        }
        log.setTypeAction(typeAction);
        log.setEntiteCible(entiteCible);
        log.setIdEntiteCible(idEntiteCible);
        log.setDetail(detail);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> list(Pageable pageable) {
        return auditLogRepository.findAllByOrderByDateActionDesc(pageable).map(AuditLogMapper::toResponse);
    }
}
