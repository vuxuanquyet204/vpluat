package com.lawfirm.brs.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Custom Jackson serializers/deserializers for Instant types.
 * Ensures consistent ISO-8601 formatting with timezone.
 */
@Configuration
public class InstantJacksonConfig {

    private static final DateTimeFormatter FORMATTER =
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
                         .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    @Bean
    public SimpleModule instantModule() {
        SimpleModule module = new SimpleModule("InstantModule");

        module.addSerializer(Instant.class, new JsonSerializer<>() {
            @Override
            public void serialize(Instant value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                gen.writeString(FORMATTER.format(value));
            }
        });

        module.addDeserializer(Instant.class, new JsonDeserializer<>() {
            @Override
            public Instant deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                JsonToken t = p.currentToken();
                if (t == JsonToken.VALUE_STRING) {
                    String text = p.getText().trim();
                    if (text.isEmpty()) return null;
                    // Try ISO format first
                    try {
                        return Instant.parse(text);
                    } catch (Exception e) {
                        // Try epoch millis
                        try {
                            return Instant.ofEpochMilli(Long.parseLong(text));
                        } catch (Exception e2) {
                            throw new RuntimeException("Cannot parse Instant: " + text);
                        }
                    }
                } else if (t == JsonToken.VALUE_NUMBER_INT) {
                    return Instant.ofEpochMilli(p.getLongValue());
                }
                return null;
            }
        });

        return module;
    }
}
