package com.itchu.service;

import com.itchu.domain.User;
import com.itchu.dto.user.ChangePasswordRequest;
import com.itchu.dto.user.CreateUserRequest;
import com.itchu.dto.user.UpdateProfileRequest;
import com.itchu.dto.user.UpdateUserRequest;
import com.itchu.dto.user.UserResponse;
import com.itchu.exception.BadRequestException;
import com.itchu.exception.ConflictException;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.mapper.UserMapper;
import com.itchu.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return UserMapper.toResponseList(userRepository.findAll());
    }

    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return UserMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public User findEntity(Long id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", id));
    }

    public UserResponse create(CreateUserRequest request, Long actorId) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Un utilisateur avec cet email existe deja");
        }
        User user = new User();
        user.setNom(request.nom());
        user.setPrenom(request.prenom());
        user.setEmail(request.email());
        user.setMotDePasse(passwordEncoder.encode(request.motDePasse()));
        user.setRole(request.role());
        user.setCompetences(request.competences() != null ? request.competences() : List.of());
        user.setActif(true);
        User saved = userRepository.save(user);
        auditLogService.record(actorId, "CREATE", "User", saved.getId(), "Creation utilisateur " + saved.getEmail());
        return UserMapper.toResponse(saved);
    }

    public UserResponse update(Long id, UpdateUserRequest request, Long actorId) {
        User user = findEntity(id);
        if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Un utilisateur avec cet email existe deja");
        }
        user.setNom(request.nom());
        user.setPrenom(request.prenom());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setCompetences(request.competences() != null ? request.competences() : List.of());
        user.setActif(request.actif());
        User saved = userRepository.save(user);
        auditLogService.record(actorId, "UPDATE", "User", saved.getId(), "Mise a jour utilisateur " + saved.getEmail());
        return UserMapper.toResponse(saved);
    }

    public UserResponse setActive(Long id, boolean actif, Long actorId) {
        User user = findEntity(id);
        user.setActif(actif);
        User saved = userRepository.save(user);
        auditLogService.record(
                actorId, actif ? "ACTIVATE" : "DEACTIVATE", "User", saved.getId(),
                (actif ? "Activation" : "Desactivation") + " du compte " + saved.getEmail());
        return UserMapper.toResponse(saved);
    }

    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findEntity(userId);
        user.setNom(request.nom());
        user.setPrenom(request.prenom());
        user.setCompetences(request.competences() != null ? request.competences() : List.of());
        return UserMapper.toResponse(userRepository.save(user));
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findEntity(userId);
        if (!passwordEncoder.matches(request.motDePasseActuel(), user.getMotDePasse())) {
            throw new BadRequestException("Le mot de passe actuel est incorrect");
        }
        user.setMotDePasse(passwordEncoder.encode(request.nouveauMotDePasse()));
        userRepository.save(user);
        auditLogService.record(userId, "CHANGE_PASSWORD", "User", userId, "Changement de mot de passe");
    }
}
