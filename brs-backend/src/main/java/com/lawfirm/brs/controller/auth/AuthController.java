package com.lawfirm.brs.controller.auth;

import com.lawfirm.brs.dto.request.RegisterRequest;
import com.lawfirm.brs.dto.response.ApiResponse;
import com.lawfirm.brs.dto.response.UserDTO;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.service.auth.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and return JWT tokens")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @RequestBody Map<String, String> credentials
    ) {
        var result = authService.login(credentials.get("email"), credentials.get("password"));
        return ResponseEntity.ok(ApiResponse.success("Login successful", result));
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register a new user account")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        var result = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", result));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refresh(
            @RequestBody Map<String, String> request
    ) {
        var result = authService.refreshToken(request.get("refreshToken"));
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", result));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout and invalidate tokens")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> request
    ) {
        authService.logout(user.getEmail(), request.get("refreshToken"));
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @AuthenticationPrincipal User user
    ) {
        var userDTO = authService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.success(userDTO));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update authenticated user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> updates
    ) {
        var userDTO = authService.updateProfile(user, updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userDTO));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> passwords
    ) {
        authService.changePassword(
            user,
            passwords.get("currentPassword"),
            passwords.get("newPassword")
        );
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
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
