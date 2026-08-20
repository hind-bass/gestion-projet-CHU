package com.itchu.repository;

import com.itchu.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByDateActionDesc(Pageable pageable);

    List<AuditLog> findTop10ByOrderByDateActionDesc();
}
