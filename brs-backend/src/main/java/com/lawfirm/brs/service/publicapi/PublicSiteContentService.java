package com.lawfirm.brs.service.publicapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lawfirm.brs.entity.SettingsNamespace;
import com.lawfirm.brs.service.admin.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicSiteContentService {
    private final SystemSettingsService settingsService;
    private final ObjectMapper objectMapper;

    public JsonNode get(String locale) {
        JsonNode site = settingsService.get(SettingsNamespace.PUBLIC_SITE);
        if (!site.isObject()) {
            return emptyContent();
        }
        JsonNode localized = site.get(locale == null ? "vi" : locale.toLowerCase());
        if (localized != null && localized.isObject()) {
            return localized;
        }
        JsonNode vietnamese = site.get("vi");
        return vietnamese != null && vietnamese.isObject() ? vietnamese : emptyContent();
    }

    private JsonNode emptyContent() {
        ObjectNode empty = objectMapper.createObjectNode();
        empty.putObject("contact");
        empty.putArray("offices");
        empty.putObject("heroStats");
        empty.putArray("processSteps");
        empty.putArray("faqs");
        return empty;
    }
}
