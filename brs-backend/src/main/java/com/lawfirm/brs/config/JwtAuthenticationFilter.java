package com.lawfirm.brs.config;

import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.security.AuthCookieHelper;
import com.lawfirm.brs.security.UserPrincipal;
import com.lawfirm.brs.service.auth.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter - validates JWT tokens and sets authentication context.
 *
 * <p>This filter is intentionally <strong>additive</strong> — the existing
 * {@code Authorization: Bearer <accessToken>} header flow is preserved exactly
 * as before. A cookie fallback is added so that:
 * <ul>
 *   <li>SSR / server components can bootstrap auth state without calling
 *       {@code /auth/me}</li>
 *   <li>Requests where the FE forgot to attach the access token header can still
 *       be authenticated when a valid refresh-token cookie is present.</li>
 * </ul>
 *
 * <p>Role checks, {@code @PreAuthorize} annotations, and all other
 * authorisation logic remain <strong>completely untouched</strong>.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    @Qualifier("customUserDetailsService")
    private final UserDetailsService userDetailsService;
    private final AuthCookieHelper authCookieHelper;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String source = "none";
        try {
            String jwt = extractJwtFromRequest(request);
            source = "header";

            // If no access token in header, fall back to refresh-token cookie.
            // This is a convenience fallback — the primary auth path is still
            // the Authorization header.  No role or permission logic is touched.
            if (!StringUtils.hasText(jwt)) {
                jwt = extractJwtFromCookie(request);
                source = "cookie";
            }

            if (StringUtils.hasText(jwt) && jwtTokenProvider.isTokenValid(jwt)) {
                String username = jwtTokenProvider.getUsernameFromToken(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                Object principal = (userDetails instanceof User u)
                    ? new UserPrincipal(u)
                    : userDetails;

                if (userDetails instanceof User u) {
                    request.setAttribute("userId", u.getId());
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        userDetails.getAuthorities()
                    );

                authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user: {} (via {})", username, source);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication (source={}): {}", source, e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Primary extraction: read the access token from the {@code Authorization}
     * header. This path is unchanged from the original implementation.
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }

    /**
     * Fallback extraction: read the refresh token from the HttpOnly cookie and
     * validate it. If valid, the filter treats it as an authenticated request.
     * This path is <strong>only</strong> used when no {@code Authorization}
     * header is present (e.g. initial SSR page load).
     *
     * <p>Note: the refresh token is a full JWT and can be validated directly
     * via {@code isTokenValid}. The result is equivalent to authenticating
     * with an access token — the same {@code SecurityContext} is set and
     * the same role/permission checks apply.
     */
    private String extractJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AuthCookieHelper.REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                String token = cookie.getValue();
                if (StringUtils.hasText(token)) {
                    // Validate that this is a well-formed, non-expired refresh token.
                    // isTokenValid checks both signature and expiry (and Redis revocation
                    // status for JTIs).
                    if (jwtTokenProvider.isTokenValid(token)) {
                        log.debug("Authenticating via refresh-token cookie");
                        return token;
                    }
                }
            }
        }
        return null;
    }
}
