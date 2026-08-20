package com.itchu.dto.user;

import com.itchu.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateUserRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prenom est obligatoire") String prenom,
        @NotBlank(message = "L'email est obligatoire") @Email(message = "Format d'email invalide") String email,
        @NotNull(message = "Le role est obligatoire") Role role,
        List<String> competences,
        boolean actif) {
}
