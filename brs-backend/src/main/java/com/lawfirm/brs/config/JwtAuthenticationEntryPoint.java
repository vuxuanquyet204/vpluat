package com.lawfirm.brs.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Returns HTTP 401 (not the default 403) when an anonymous/unauthenticated
 * request reaches a protected endpoint. This lets the frontend distinguish
 * "token missing/expired" (re-login needed) from "you don't have permission
 * for this resource" (genuine 403).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // Use the same ApiResponse envelope as GlobalExceptionHandler so
        // the frontend's unwrap() helper gets a consistent {success, error}
        // shape regardless of which exception handler handles the response.
        Map<String, Object> body = Map.of(
            "success", false,
            "errorCode", "UNAUTHORIZED",
            "message", authException.getMessage() != null
                ? authException.getMessage()
                : "Authentication required",
            "timestamp", Instant.now().toString()
        );

        objectMapper.writeValue(response.getWriter(), body);
    }
}