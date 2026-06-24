package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.LeadActivity;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LeadMapper;
import com.lawfirm.brs.repository.BulkImportRepository;
import com.lawfirm.brs.repository.LeadActivityRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeadPipelineServiceTest {

    @Mock private LeadRepository leadRepository;
    @Mock private LeadActivityRepository activityRepository;
    @Mock private UserRepository userRepository;
    @Mock private BulkImportRepository bulkImportRepository;
    @Mock private LeadMapper leadMapper;

    private LeadPipelineService service;

    @BeforeEach
    void setUp() {
        service = new LeadPipelineService(leadRepository, activityRepository, userRepository, bulkImportRepository, leadMapper);
    }

    private static User buildUser(UUID id) {
        return buildUser(id, null);
    }

    private static User buildUser(UUID id, String fullName) {
        User u = new User();
        u.setId(id);
        if (fullName != null) u.setFullName(fullName);
        return u;
    }

    @Test
    @DisplayName("recordActivity persists a timeline entry")
    void recordActivity_persists() {
        UUID leadId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(activityRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.recordActivity(leadId, actorId, "NOTED", "Phải gọi lại vào thứ 6", null);

        ArgumentCaptor<LeadActivity> captor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(activityRepository).save(captor.capture());
        LeadActivity saved = captor.getValue();
        assertThat(saved.getAction()).isEqualTo("NOTED");
        assertThat(saved.getNote()).isEqualTo("Phải gọi lại vào thứ 6");
        assertThat(saved.getUser()).isNotNull();
        assertThat(saved.getUser().getId()).isEqualTo(actorId);
    }
    @Test
    @DisplayName("recordActivity throws when lead missing")
    void recordActivity_missingLead() {
        UUID leadId = UUID.randomUUID();
        when(leadRepository.existsById(leadId)).thenReturn(false);

        assertThatThrownBy(() -> service.recordActivity(leadId, null, "X", "y", null))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getTimeline returns mapped entries with actor name")
    void getTimeline() {
        UUID leadId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        LeadActivity act = LeadActivity.builder()
            .id(UUID.randomUUID())
            .lead(Lead.builder().id(leadId).build())
            .user(buildUser(actorId))
            .action("STATUS_CHANGED")
            .note("NEW -> CONTACTED")
            .createdAt(Instant.now())
            .build();
        when(activityRepository.findByLeadIdOrderByCreatedAtDesc(eq(leadId), any()))
            .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(act)));
        when(userRepository.findAllById(any())).thenReturn(List.of(
            buildUser(actorId, "Nguyễn Văn A")));

        var result = service.getTimeline(leadId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getActorName()).isEqualTo("Nguyễn Văn A");
        assertThat(result.get(0).getAction()).isEqualTo("STATUS_CHANGED");
        assertThat(result.get(0).getEntityId()).isEqualTo(leadId);
    }

    @Test
    @DisplayName("assign sets new assignee and records timeline")
    void assign() {
        UUID leadId = UUID.randomUUID();
        UUID assigneeId = UUID.randomUUID();
        Lead lead = Lead.builder().id(leadId).build();
        User assignee = buildUser(assigneeId, "Trần B");
        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(userRepository.findById(assigneeId)).thenReturn(Optional.of(assignee));
        when(leadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(leadMapper.toDTO(any())).thenReturn(new com.lawfirm.brs.dto.response.LeadDTO());
        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(activityRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var dto = service.assign(leadId, assigneeId, null);

        assertThat(lead.getAssignedTo()).isEqualTo(assignee);
        assertThat(dto).isNotNull();
        verify(activityRepository).save(any());
    }

    @Test
    @DisplayName("exportCsv renders header and rows")
    void exportCsv() {
        when(leadRepository.findAll()).thenReturn(List.of(
            Lead.builder()
                .id(UUID.randomUUID())
                .name("Nguyễn A")
                .email("a@example.com")
                .phone("0901234567")
                .source("WEBSITE")
                .status(com.lawfirm.brs.constants.LeadStatus.NEW)
                .createdAt(Instant.parse("2025-01-15T00:00:00Z"))
                .build()));

        String csv = service.exportCsv(null, null);

        assertThat(csv).contains("id,name,email,phone,source,status");
        assertThat(csv).contains("Nguyễn A");
        assertThat(csv).contains("a@example.com");
        assertThat(csv).contains("NEW");
    }
}
