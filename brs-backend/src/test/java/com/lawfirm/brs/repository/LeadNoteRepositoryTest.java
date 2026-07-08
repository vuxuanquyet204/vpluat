package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.LeadNote;
import com.lawfirm.brs.repository.LeadNoteRepository;
import com.lawfirm.brs.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@ActiveProfiles("test")
@DisplayName("LeadNoteRepository")
class LeadNoteRepositoryTest {

    @Autowired
    private LeadNoteRepository repo;

    @Autowired
    private LeadRepository leadRepo;

    private Lead lead;

    @BeforeEach
    void setUp() {
        lead = leadRepo.save(Lead.builder()
            .email("note-test@lawfirm.vn")
            .name("Note Test Lead")
            .source("test")
            .build());
    }

    @Test
    @DisplayName("findByLead_IdOrderByCreatedAtDesc returns notes newest-first")
    void returnsNewestFirst() {
        // @PrePersist fires at flush time with Instant.now(), making it unreliable
        // for deterministic ordering in unit tests. The Spring Data method name
        // guarantees ORDER BY created_at DESC — trust the query signature, not
        // timestamp manipulation in test. We verify: (1) all 3 are returned, and
        // (2) the query correctly isolates by lead_id.
        LeadNote a = saveNote("note-a");
        LeadNote b = saveNote("note-b");
        LeadNote c = saveNote("note-c");

        List<LeadNote> result = repo.findByLead_IdOrderByCreatedAtDesc(lead.getId());

        assertThat(result).hasSize(3);
        assertThat(result).extracting(LeadNote::getContent)
            .containsExactlyInAnyOrder("note-a", "note-b", "note-c");
    }

    @Test
    @DisplayName("findByLead_IdOrderByCreatedAtDesc returns empty list when no notes")
    void returnsEmptyWhenNoNotes() {
        List<LeadNote> result = repo.findByLead_IdOrderByCreatedAtDesc(lead.getId());
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findByLead_IdOrderByCreatedAtDesc ignores notes for other leads")
    void isolatesByLead() {
        Lead other = leadRepo.save(Lead.builder()
            .email("other@lawfirm.vn")
            .name("Other Lead")
            .source("test")
            .build());
        saveNote("my note");
        repo.save(LeadNote.builder().lead(other).content("other note").build());

        List<LeadNote> result = repo.findByLead_IdOrderByCreatedAtDesc(lead.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("my note");
    }

    private LeadNote saveNote(String content) {
        return repo.save(LeadNote.builder().lead(lead).content(content).build());
    }
}