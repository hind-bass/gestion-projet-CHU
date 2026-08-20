package com.itchu.service;

import com.itchu.domain.RefreshToken;
import com.itchu.domain.User;
import com.itchu.dto.auth.AuthResponse;
import com.itchu.dto.auth.LoginRequest;
import com.itchu.dto.user.UserResponse;
import com.itchu.exception.ResourceNotFoundException;
import com.itchu.exception.UnauthorizedException;
import com.itchu.mapper.UserMapper;
import com.itchu.repository.RefreshTokenRepository;
import com.itchu.repository.UserRepository;
import com.itchu.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final AuditLogService auditLogService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtService jwtService,
            AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.auditLogService = auditLogService;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.motDePasse()));

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        AuthResponse response = issueTokens(user);
        auditLogService.record(user.getId(), "LOGIN", "User", user.getId(), "Connexion reussie");
        return response;
    }

    public AuthResponse refresh(String rawRefreshToken) {
        Claims claims;
        try {
            claims = jwtService.parseRefreshClaims(rawRefreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Jeton de rafraichissement invalide ou expire");
        }

        String tokenHash = JwtService.hashToken(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Jeton de rafraichissement inconnu"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Jeton de rafraichissement revoque ou expire");
        }

        Long userId = jwtService.getUserId(claims);
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        if (!user.isActif()) {
            throw new UnauthorizedException("Compte utilisateur desactive");
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(user);
    }

    public void logout(String rawRefreshToken) {
        String tokenHash = JwtService.hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return UserMapper.toResponse(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setTokenHash(JwtService.hashToken(refreshToken));
        entity.setExpiresAt(LocalDateTime.now().plusNanos(jwtService.getRefreshExpirationMs() * 1_000_000));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        return AuthResponse.of(accessToken, refreshToken, jwtService.getAccessExpirationMs(), UserMapper.toResponse(user));
    }
}
