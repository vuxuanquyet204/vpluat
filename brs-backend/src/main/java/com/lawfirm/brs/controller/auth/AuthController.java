package com.lawfirm.brs.controller.auth;

import com.lawfirm.brs.dto.request.RegisterRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.security.AuthCookieHelper;
import com.lawfirm.brs.security.UserPrincipal;
import com.lawfirm.brs.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication controller for login, logout, and token management.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieHelper authCookieHelper;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody Map<String, String> credentials,
            HttpServletResponse response
    ) {
        var result = authService.login(credentials.get("email"), credentials.get("password"));
        // Also write refresh token as an HttpOnly cookie so the browser
        // auto-attaches it on subsequent same-site requests (especially for
        // SSR / middleware flows). The JSON body is left untouched so any
        // existing client code keeps working.
        Object refreshToken = result.get("refreshToken");
        if (refreshToken instanceof String token) {
            authCookieHelper.writeRefreshTokenCookie(response, token);
        }
        return ResponseEntity.ok(ApiResponse.success("Login successful", result));
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new user account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        var result = authService.register(request);
        Object refreshToken = result.get("refreshToken");
        if (refreshToken instanceof String token) {
            authCookieHelper.writeRefreshTokenCookie(response, token);
        }
        return ResponseEntity.ok(ApiResponse.success("Registration successful", result));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(
            @RequestBody(required = false) Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        // Prefer the refresh token from the HttpOnly cookie (set during login
        // by /auth/login).  Fall back to the request body for clients that
        // haven't migrated to the cookie-based flow yet (backwards compatible).
        String refreshToken = authCookieHelper.readRefreshTokenFromCookie(httpRequest);
        if (refreshToken == null && request != null) {
            refreshToken = request.get("refreshToken");
        }
        var result = authService.refreshToken(refreshToken);
        Object newRefresh = result.get("refreshToken");
        if (newRefresh instanceof String token) {
            authCookieHelper.writeRefreshTokenCookie(response, token);
        }
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", result));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout and invalidate tokens")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        String refreshToken = request != null ? request.get("refreshToken") : null;
        // Fallback: read from cookie if body is empty
        if (refreshToken == null) {
            refreshToken = authCookieHelper.readRefreshTokenFromCookie(httpRequest);
        }
        // principal can be null when the access token has expired (cookie is
        // the only auth then).  Always try to revoke whatever refresh token
        // we have, even if the principal is missing.
        String email = resolveCurrentEmail();
        authService.logout(email, refreshToken);
        // Always clear the cookie on logout, even if the client didn't pass
        // the refresh token in the body.
        authCookieHelper.clearRefreshTokenCookie(response);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserPrincipal principal = requirePrincipal();
        var userDTO = authService.getCurrentUser(principal.getUser());
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @RequestBody Map<String, String> updates
    ) {
        UserPrincipal principal = requirePrincipal();
        var userDTO = authService.updateProfile(principal.getUser(), updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userDTO));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody Map<String, String> passwords
    ) {
        UserPrincipal principal = requirePrincipal();
        authService.changePassword(
            principal.getUser(),
            passwords.get("currentPassword"),
            passwords.get("newPassword")
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    /**
     * Resolve the current user's email without forcing authentication.
     * Returns null if there is no authenticated principal — used by logout
     * which must still run even when the access token has expired.
     */
    private String resolveCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up.getEmail();
        }
        return auth.getName();
    }

    /**
     * Throws UnauthorizedException when no principal is present. Used for
     * endpoints that must remain authenticated regardless of token state.
     */
    private UserPrincipal requirePrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserPrincipal up) {
            return up;
        }
        throw new com.lawfirm.brs.exception.UnauthorizedException(
            "AUTH_REQUIRED", "Authentication required");
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody Map<String, String> request
    ) {
        authService.requestPasswordReset(request.get("email"));
        return ResponseEntity.ok(
            ApiResponse.success("If email exists, password reset instructions will be sent", null)
        );
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody Map<String, String> request
    ) {
        authService.resetPassword(
            request.get("token"),
            request.get("newPassword")
        );
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/hash-password")
    @Operation(summary = "Hash password", description = "Generate BCrypt hash for a password (dev only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> hashPassword(
            @RequestBody Map<String, String> request
    ) {
        String password = request.get("password");
        String hash = authService.generatePasswordHash(password);
        return ResponseEntity.ok(ApiResponse.success("Password hashed", Map.of(
            "password", password,
            "hash", hash
        )));
    }
}
