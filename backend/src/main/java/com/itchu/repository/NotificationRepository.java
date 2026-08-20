package com.itchu.repository;

import com.itchu.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByDateCreationDesc(Long userId);

    List<Notification> findByUserIdAndLuFalseOrderByDateCreationDesc(Long userId);

    long countByUserIdAndLuFalse(Long userId);

    @Modifying
    @Query("update Notification n set n.lu = true where n.user.id = :userId and n.lu = false")
    void markAllAsRead(Long userId);
}
