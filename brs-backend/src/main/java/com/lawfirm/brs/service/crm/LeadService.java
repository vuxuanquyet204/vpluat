package com.lawfirm.brs.service.crm;

import com.lawfirm.brs.dto.request.LeadRequest;
import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LeadMapper;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing leads (CRM).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeadService {

    private final LeadRepository leadRepository;
    private final ServiceEntityRepository serviceRepository;
    private final LeadMapper leadMapper;

    @Transactional
    public LeadDTO createLead(LeadRequest request) {
        log.info("Creating lead from: {}", request.email());

        String duplicateHash = computeDuplicateHash(request.email(), request.phone());

        Optional<Lead> existing = leadRepository.findByDuplicateHash(duplicateHash);
        if (existing.isPresent()) {
            Lead lead = existing.get();
            lead.setLastContactAt(Instant.now());
            if (request.message() != null && !request.message().isBlank()) {
                String existingMsg = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
                lead.setNotes(existingMsg + "[" + Instant.now() + "] (dup) " + request.message());
            }
            return leadMapper.toDTO(leadRepository.save(lead));
        }

        Lead lead = Lead.builder()
            .name(request.name())
            .email(request.email())
            .phone(request.phone())
            .message(request.message())
            .source(request.source() != null ? request.source() : "WEBSITE")
            .channel(request.channel())
            .campaignId(request.campaignId())
            .adGroupId(request.adGroupId())
            .utmSource(request.utmSource())
            .utmMedium(request.utmMedium())
            .utmCampaign(request.utmCampaign())
            .duplicateHash(duplicateHash)
            .ipAddress(request.ipAddress())
            .userAgent(request.userAgent())
            .build();

        if (request.serviceId() != null) {
            ServiceEntity service = serviceRepository.findById(UUID.fromString(request.serviceId()))
                .orElse(null);
            lead.setService(service);
        }

        lead.setFirstContactAt(Instant.now());
        lead.setLastContactAt(Instant.now());

        return leadMapper.toDTO(leadRepository.save(lead));
    }

    public PageResponse<LeadDTO> getAllLeads(int page, int size, String status, String source) {
        log.debug("Fetching leads: page={}, size={}, status={}, source={}", page, size, status, source);
        Pageable pageable = PageRequest.of(page, size);
        Page<Lead> leads = leadRepository.findAll(pageable);
        return PageResponse.of(
            leadMapper.toDTOList(leads.getContent()),
            page,
            size,
            leads.getTotalElements()
        );
    }

    public LeadDTO getLeadById(UUID id) {
        log.debug("Fetching lead by id: {}", id);
        Lead lead = leadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
        return leadMapper.toDTOWithDetails(lead);
    }

    @Transactional
    public LeadDTO updateLeadStatus(UUID id, String status, UUID assignedToId, String notes) {
        log.info("Updating lead {} to status: {}", id, status);
        Lead lead = leadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));

        if (status != null) {
            lead.setStatus(com.lawfirm.brs.constants.LeadStatus.valueOf(status));
        }
        if (notes != null) {
            String existingNotes = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
            lead.setNotes(existingNotes + "[" + Instant.now() + "] " + notes);
        }

        return leadMapper.toDTO(leadRepository.save(lead));
    }

    @Transactional
    public LeadDTO addNote(UUID id, String note, UUID userId) {
        log.info("Adding note to lead: {}", id);
        Lead lead = leadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));

        String existingNotes = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
        lead.setNotes(existingNotes + "[" + Instant.now() + "] " + note);
        lead.setLastContactAt(Instant.now());

        return leadMapper.toDTO(leadRepository.save(lead));
    }

    private String computeDuplicateHash(String email, String phone) {
        String raw = ((phone != null ? phone : "") + "|" +
                      (email != null ? email : "")).toLowerCase().trim();
        return DigestUtils.sha256Hex(raw);
    }
}
