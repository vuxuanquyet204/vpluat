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
}
