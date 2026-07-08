package com.lawfirm.brs.dto.response;

import java.time.Instant;

/**
 * Single note entry shown on the lead detail "Ghi chú" tab.
 *
 * <p>The legacy {@code leads.notes} column stores all notes as a single text
 * blob in the format {@code "[<ISO timestamp>] <content>\n[<ISO timestamp>]
 * <content>..."}. {@link com.lawfirm.brs.service.crm.LeadService#parseNotes(String)}
 * splits that blob into individual entries so the UI can render each note as a
 * separate card with its own timestamp.
 */
public record LeadNoteDTO(Instant createdAt, String content) {

    public static LeadNoteDTO of(Instant createdAt, String content) {
        return new LeadNoteDTO(createdAt, content);
    }
}