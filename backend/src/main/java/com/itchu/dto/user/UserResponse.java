package com.itchu.dto.user;

import com.itchu.domain.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

public record UserResponse(
        Long id,
        String nom,
        String prenom,
        String email,
        Role role,
        List<String> competences,
        boolean actif,
        LocalDateTime dateCreation) {
}
