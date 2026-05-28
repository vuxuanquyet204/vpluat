package com.lawfirm.brs.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Cloudinary configuration for file uploads and transformations.
 */
@Configuration
@Slf4j
public class CloudinaryConfig {

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudName == null || cloudName.isBlank()) {
            log.warn("Cloudinary is not configured. File uploads will fail.");
        }

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);

        return new Cloudinary(config);
    }

    /**
     * Default transformation for thumbnails
     */
    public Transformation thumbnailTransformation(int width, int height) {
        return new Transformation()
            .width(width)
            .height(height)
            .crop("fill")
            .gravity("auto");
    }

    /**
     * Transformation for optimized images
     */
    public Transformation optimizedImageTransformation(int maxWidth) {
        return new Transformation()
            .width(maxWidth)
            .crop("limit")
            .quality("auto")
            .fetchFormat("auto");
    }
}
