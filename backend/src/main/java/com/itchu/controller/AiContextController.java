package com.itchu.controller;

import com.itchu.dto.ai.AiContextRequest;
import com.itchu.dto.ai.AiContextResponse;
import com.itchu.service.AiContextService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint interne réservé au service FastAPI.
 * Authentifié par {@code IA_SERVICE_INTERNAL_TOKEN}, pas par le JWT utilisateur.
 * Le champ {@code role} du body n'est pas une source de vérité.
 */
@RestController
@RequestMapping("/internal/ai")
public class AiContextController {

    private static final Logger log = LoggerFactory.getLogger(AiContextController.class);

    private final AiContextService aiContextService;
    private final String internalToken;

    public AiContextController(
            AiContextService aiContextService,
            @Value("${app.ai.internal-token:}") String internalToken) {
        this.aiContextService = aiContextService;
        this.internalToken = internalToken;
    }

    @PostMapping("/context")
    public ResponseEntity<AiContextResponse> context(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody AiContextRequest request) {
        if (internalToken != null && !internalToken.isBlank()) {
            String expected = "Bearer " + internalToken;
            if (authorization == null || !expected.equals(authorization)) {
                log.warn("Appel /internal/ai/context refuse : jeton interne invalide");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AiContextResponse.error("Jeton interne invalide."));
            }
        } else {
            log.warn("IA_SERVICE_INTERNAL_TOKEN est vide : /internal/ai/context accepte l'appel sans jeton (dev seulement)");
        }

        log.info("Reception contexte IA userId={} questionLength={}", request.userId(),
                request.question() == null ? 0 : request.question().length());
        return ResponseEntity.ok(aiContextService.build(request));
    }
}
