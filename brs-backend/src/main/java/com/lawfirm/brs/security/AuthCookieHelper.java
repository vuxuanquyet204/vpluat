package com.lawfirm.brs.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Helper for managing authentication cookies in a secure, HttpOnly manner.
 *
 * <p>This helper is intentionally additive — the existing JSON body responses
 * (with {@code accessToken} / {@code refreshToken}) are kept intact so that
 * clients that still rely on the old contract keep working. The cookie is
 * just an additional transport channel that lets the browser auto-attach
 * credentials to same-site requests and lets server-side middleware read
 * auth state without calling {@code /auth/me}.
 *
 * <p>Authorization / role checks are <strong>NOT</strong> affected by this
 * helper — all role enforcement still flows through Spring Security and
 * {@code @PreAuthorize} annotations.
 */
@Component
public class AuthCookieHelper {

    public static final String REFRESH_TOKEN_COOKIE = "brs_refresh_token";

    /**
     * 7 days in seconds — must stay in sync with
     * {@code app.jwt.refresh-token-expiry} (default 7d).
     */
    private static final long REFRESH_TOKEN_MAX_AGE_SECONDS = 7L * 24 * 60 * 60;

    /**
     * Production requires the {@code Secure} flag so the cookie is only sent
     * over HTTPS. Development (HTTP localhost) can opt out by setting
     * {@code app.cookie.secure=false}.
     */
    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    /**
     * Path the cookie is scoped to. {@code /} is required so the cookie is
     * sent on every API call.
     */
    private static final String COOKIE_PATH = "/";

    /**
     * Write the refresh token as an HttpOnly, SameSite=Lax cookie. The
     * access token is intentionally <strong>not</strong> put in a cookie
     * because it has a very short lifespan (15 minutes) and the existing
     * client code already attaches it via the {@code Authorization} header.
     */
    public void writeRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return;
        }

        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path(COOKIE_PATH)
            .maxAge(REFRESH_TOKEN_MAX_AGE_SECONDS)
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Clear the refresh token cookie (used on logout).
     */
    public void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite("Lax")
            .path(COOKIE_PATH)
            .maxAge(0)
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * Read the refresh token from the request cookie. Used as a <strong>
     * fallback</strong> by the auth filter when no {@code Authorization}
     * header is present (e.g. SSR bootstrap from a server component).
     */
    public String readRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (REFRESH_TOKEN_COOKIE.equals(cookie.getName())) {
                String value = cookie.getValue();
                if (value != null && !value.isEmpty()) {
                    return value;
                }
            }
        }
        return null;
    }
}