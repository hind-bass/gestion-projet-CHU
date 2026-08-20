package com.itchu.security;

import com.itchu.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long getCurrentUserId() {
        AppUserPrincipal principal = getCurrentPrincipal();
        return principal.getId();
    }

    public static String getCurrentUserEmail() {
        AppUserPrincipal principal = getCurrentPrincipal();
        return principal.getUsername();
    }

    public static AppUserPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AppUserPrincipal principal)) {
            throw new UnauthorizedException("Utilisateur non authentifie");
        }
        return principal;
    }

    public static boolean isAdmin() {
        return getCurrentPrincipal().getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
