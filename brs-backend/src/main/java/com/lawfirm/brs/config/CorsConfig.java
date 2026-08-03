package com.lawfirm.brs.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration. Note: CORS is also configured in SecurityConfig.
 * This config provides a fallback for non-Spring Security scenarios.
 *
 * <p>When {@code allowCredentials=true} (required for HttpOnly cookies to work
 * cross-origin), the CORS spec mandates that {@code Access-Control-Allow-Origin}
 * <strong>must</strong> echo the exact value of the {@code Origin} request
 * header — wildcards or static origin lists are not allowed. Using
 * {@code setAllowedOriginPatterns} instead of {@code setAllowedOrigins} lets
 * Spring handle the per-request origin validation and echo-back automatically.
 */
@Configuration
@RequiredArgsConstructor
public class CorsConfig {

    private final AppProperties appProperties;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = appProperties.getCors().getAllowedOrigins();

        // Using setAllowedOriginPatterns (not setAllowedOrigins) so that when
        // allowCredentials=true, Spring can echo the exact Origin header value
        // back instead of failing with a wildcard conflict.
        configuration.setAllowedOriginPatterns(allowedOrigins);

        configuration.setAllowedMethods(appProperties.getCors().getAllowedMethods());
        configuration.setAllowedHeaders(appProperties.getCors().getAllowedHeaders());
        configuration.setAllowCredentials(appProperties.getCors().isAllowCredentials());
        configuration.setMaxAge((long) appProperties.getCors().getMaxAge());
        configuration.setExposedHeaders(List.of(
            "Authorization",
            "X-Rate-Limit-Remaining",
            "X-Rate-Limit-Limit",
            "X-Request-Id",
            "X-Correlation-Id"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
