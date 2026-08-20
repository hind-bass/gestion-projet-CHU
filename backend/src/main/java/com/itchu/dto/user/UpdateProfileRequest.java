package com.itchu.dto.user;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record UpdateProfileRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prenom est obligatoire") String prenom,
        List<String> competences) {
}
