package com.lawfirm.brs.service.crm;

import com.lawfirm.brs.dto.request.LeadRequest;
import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.mapper.LeadMapper;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private ServiceEntityRepository serviceRepository;

    @Mock
    private LeadMapper leadMapper;

    @InjectMocks
    private LeadService leadService;

    private LeadRequest leadRequest;
    private Lead lead;

    @BeforeEach
    void setUp() {
        leadRequest = new LeadRequest(
            "John Doe",
            "john@example.com",
            "0912345678",
            null,
            "I need legal advice",
            "WEBSITE",
            "GOOGLE",
            null, null, null, null, null, null, null
        );

        lead = Lead.builder()
            .id(UUID.randomUUID())
            .name("John Doe")
            .email("john@example.com")
            .phone("0912345678")
            .message("I need legal advice")
            .source("WEBSITE")
            .channel("GOOGLE")
            .status(com.lawfirm.brs.constants.LeadStatus.NEW)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
    }

    @Test
    @DisplayName("Should create new lead successfully")
    void shouldCreateLeadSuccessfully() {
        // Given
        when(leadRepository.findByDuplicateHash(any())).thenReturn(Optional.empty());
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);
        when(leadMapper.toDTO(any(Lead.class))).thenReturn(LeadDTO.builder()
            .id(lead.getId())
            .name(lead.getName())
            .email(lead.getEmail())
            .status("NEW")
            .build());

        // When
        LeadDTO result = leadService.createLead(leadRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John Doe");
        verify(leadRepository).save(any(Lead.class));
    }

    @Test
    @DisplayName("Should update existing lead instead of creating duplicate")
    void shouldUpdateExistingLeadOnDuplicate() {
        // Given
        when(leadRepository.findByDuplicateHash(any())).thenReturn(Optional.of(lead));
        when(leadRepository.save(any(Lead.class))).thenReturn(lead);
        when(leadMapper.toDTO(any(Lead.class))).thenReturn(LeadDTO.builder()
            .id(lead.getId())
            .name(lead.getName())
            .build());

        // When
        LeadDTO result = leadService.createLead(leadRequest);

        // Then
        assertThat(result).isNotNull();
        verify(leadRepository).save(any(Lead.class));
    }

    @Test
    @DisplayName("parseNotes splits legacy notes blob into timestamped entries, newest first")
    void parseNotesSplitsBlobNewestFirst() {
        Instant fallback = Instant.parse("2025-01-01T00:00:00Z");
        String blob = "[2026-07-08T03:00:00Z] first note\n"
            + "[2026-07-08T04:30:00Z] second note\n"
            + "[2026-07-08T05:15:00Z] latest note";

        var parsed = LeadService.parseNotes(blob, fallback);

        assertThat(parsed).hasSize(3);
        assertThat(parsed.get(0).content()).isEqualTo("latest note");
        assertThat(parsed.get(1).content()).isEqualTo("second note");
        assertThat(parsed.get(2).content()).isEqualTo("first note");
        assertThat(parsed.get(0).createdAt()).isEqualTo(Instant.parse("2026-07-08T05:15:00Z"));
    }

    @Test
    @DisplayName("parseNotes falls back when timestamp missing or invalid")
    void parseNotesFallsBackOnBadTimestamp() {
        Instant fallback = Instant.parse("2025-01-01T00:00:00Z");
        String blob = "no-timestamp line\n[not-a-date] bad\n[2026-07-08T03:00:00Z] good";

        var parsed = LeadService.parseNotes(blob, fallback);

        assertThat(parsed).hasSize(3);
        assertThat(parsed.get(0).content()).isEqualTo("good");
        assertThat(parsed.get(0).createdAt()).isEqualTo(Instant.parse("2026-07-08T03:00:00Z"));
        // Two fallback entries share the timestamp — sort is stable; just assert count + content
        long fallbackCount = parsed.stream().filter(n -> n.createdAt().equals(fallback)).count();
        assertThat(fallbackCount).isEqualTo(2);
    }

    @Test
    @DisplayName("parseNotes returns empty list for null/blank input")
    void parseNotesHandlesNull() {
        assertThat(LeadService.parseNotes(null, Instant.now())).isEmpty();
        assertThat(LeadService.parseNotes("   \n  ", Instant.now())).isEmpty();
    }
}
