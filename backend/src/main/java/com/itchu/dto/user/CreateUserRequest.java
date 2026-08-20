package com.itchu.dto.user;

import com.itchu.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateUserRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prenom est obligatoire") String prenom,
        @NotBlank(message = "L'email est obligatoire") @Email(message = "Format d'email invalide") String email,
        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
        String motDePasse,
        @NotNull(message = "Le role est obligatoire") Role role,
        List<String> competences) {
}
