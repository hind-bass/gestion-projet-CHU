package com.itchu.security;

import com.itchu.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_ROLE = "role";

    private final JwtProperties properties;

    private SecretKey accessKey;
    private SecretKey refreshKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        this.accessKey = Keys.hmacShaKeyFor(properties.getAccessSecret().getBytes(StandardCharsets.UTF_8));
        this.refreshKey = Keys.hmacShaKeyFor(properties.getRefreshSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        return buildToken(user, accessKey, properties.getAccessExpirationMs());
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshKey, properties.getRefreshExpirationMs());
    }

    private String buildToken(User user, SecretKey key, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(user.getEmail())
                .claim(CLAIM_USER_ID, user.getId())
                .claim(CLAIM_ROLE, user.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public Claims parseAccessClaims(String token) throws JwtException {
        return parseClaims(token, accessKey);
    }

    public Claims parseRefreshClaims(String token) throws JwtException {
        return parseClaims(token, refreshKey);
    }

    private Claims parseClaims(String token, SecretKey key) throws JwtException {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public String getEmail(Claims claims) {
        return claims.getSubject();
    }

    public Long getUserId(Claims claims) {
        Object raw = claims.get(CLAIM_USER_ID);
        if (raw instanceof Number number) {
            return number.longValue();
        }
        return raw == null ? null : Long.valueOf(raw.toString());
    }

    public long getAccessExpirationMs() {
        return properties.getAccessExpirationMs();
    }

    public long getRefreshExpirationMs() {
        return properties.getRefreshExpirationMs();
    }

    public static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algorithme de hachage indisponible", e);
        }
    }
}
