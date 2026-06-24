package com.lawfirm.brs.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.Collections;

@Converter
@Slf4j
public class JsonbConverter implements AttributeConverter<Object, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Object attribute) {
        if (attribute == null) {
            return "[]";
        }
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            log.error("Error converting to JSON", e);
            return "[]";
        }
    }

    @Override
    public Object convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(dbData, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON: {}", dbData, e);
            return Collections.emptyList();
        }
    }
}
