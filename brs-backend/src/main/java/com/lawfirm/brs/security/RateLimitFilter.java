package com.lawfirm.brs.security;

import com.lawfirm.brs.exception.RateLimitExceededException;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter for rate limiting requests.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitConfig rateLimitConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientId = getClientIdentifier(request);

        Bucket bucket = selectBucket(path, clientId);

        if (bucket != null) {
            if (!bucket.tryConsume(1)) {
                log.warn("Rate limit exceeded for {} on {}", clientId, path);
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"RATE_LIMIT_EXCEEDED\",\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }

            long availableTokens = bucket.getAvailableTokens();
            response.addHeader("X-Rate-Limit-Remaining", String.valueOf(availableTokens));
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIdentifier(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();

        String sessionId = request.getHeader("X-Session-Id");
        return sessionId != null ? sessionId : "ip:" + ip;
    }

    private Bucket selectBucket(String path, String clientId) {
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/refresh")) {
            return rateLimitConfig.authBucket(clientId);
        }
        if (path.startsWith("/api/bookings")) {
            return rateLimitConfig.bookingBucket(clientId);
        }
        if (path.startsWith("/api/crm/leads")) {
            return rateLimitConfig.leadBucket(clientId);
        }
        if (path.startsWith("/api/public/search")) {
            return rateLimitConfig.searchBucket(clientId);
        }
        if (path.startsWith("/api/chatbot")) {
            String sessionId = clientId.startsWith("session:") ? clientId.substring(8) : clientId;
            return rateLimitConfig.chatbotBucket(sessionId);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/swagger-ui") || 
               path.startsWith("/v3/api-docs") || 
               path.startsWith("/actuator");
    }
}
