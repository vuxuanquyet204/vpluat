package com.lawfirm.brs.service.crm;

import com.lawfirm.brs.constants.LeadStatus;
import com.lawfirm.brs.dto.request.LeadRequest;
import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.dto.response.LeadNoteDTO;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.LeadNote;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LeadMapper;
import com.lawfirm.brs.repository.LeadNoteRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.repository.UserRepository;
import com.lawfirm.brs.service.notification.InAppNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for managing leads (CRM).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeadService {

    private final LeadRepository leadRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final ServiceEntityRepository serviceRepository;
    private final UserRepository userRepository;
    private final LeadMapper leadMapper;
    private final InAppNotificationService notificationService;

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

        Lead saved = leadRepository.save(lead);
        try {
            notificationService.notifyLeadCreated(saved.getId(), saved.getName());
        } catch (Exception ex) {
            log.warn("Failed to create notification for new lead {}: {}", saved.getId(), ex.getMessage());
        }
        return leadMapper.toDTO(saved);
    }

    /**
     * Find an existing Lead by email+phone hash, or create a new one for a booking.
     * Used by the booking flow so every confirmed/pending booking is reflected in CRM.
     */
    @Transactional
    public Lead findOrCreateLeadForBooking(String name, String email, String phone,
                                            ServiceEntity service, String source,
                                            String utmSource, String utmMedium, String utmCampaign,
                                            LeadStatus statusIfNew, String note) {
        String duplicateHash = computeDuplicateHash(email, phone);

        Optional<Lead> existing = leadRepository.findByDuplicateHash(duplicateHash);
        if (existing.isPresent()) {
            Lead lead = existing.get();
            lead.setLastContactAt(Instant.now());
            if (note != null && !note.isBlank()) {
                String existingNote = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
                lead.setNotes(existingNote + "[" + Instant.now() + "] " + note);
            }
            Lead saved = leadRepository.save(lead);
            log.info("Reusing existing lead {} for booking ({} / {})", saved.getId(), email, phone);
            return saved;
        }

        Lead lead = Lead.builder()
            .name(name)
            .email(email)
            .phone(phone)
            .service(service)
            .source(source != null ? source : "WEBSITE")
            .utmSource(utmSource)
            .utmMedium(utmMedium)
            .utmCampaign(utmCampaign)
            .duplicateHash(duplicateHash)
            .status(statusIfNew != null ? statusIfNew : LeadStatus.NEW)
            .build();
        lead.setFirstContactAt(Instant.now());
        lead.setLastContactAt(Instant.now());
        if (note != null && !note.isBlank()) {
            lead.setNotes(note);
        }
        Lead saved = leadRepository.save(lead);
        log.info("Auto-created lead {} from booking for {} / {}", saved.getId(), email, phone);
        return saved;
    }

    public PageResponse<LeadDTO> getAllLeads(int page, int size, String status, String source,
                                             UUID assignedTo, String search) {
        log.debug("Fetching leads: page={}, size={}, status={}, source={}, assignedTo={}, search={}",
            page, size, status, source, assignedTo, search);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<Lead> spec = (root, q, cb) -> {
            var preds = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (status != null && !status.isBlank()) {
                preds.add(cb.equal(root.get("status"),
                    com.lawfirm.brs.constants.LeadStatus.valueOf(status.toUpperCase())));
            }
            if (source != null && !source.isBlank()) {
                preds.add(cb.equal(root.get("source"), source));
            }
            if (assignedTo != null) {
                preds.add(cb.equal(root.get("assignedTo").get("id"), assignedTo));
            }
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                preds.add(cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("phone")), like)
                ));
            }
            return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<Lead> leads = leadRepository.findAll(spec, pageable);
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
    public LeadDTO updateLeadStatus(UUID id, String status, UUID assignedToId, String notes,
                                    String name, String phone, String email,
                                    UUID serviceId, String source,
                                    String assignedToName, String serviceName) {
        log.info("Updating lead {}", id);
        Lead lead = leadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));

        if (name != null && !name.isBlank()) {
            lead.setName(name);
        }
        if (phone != null) {
            lead.setPhone(phone);
        }
        if (email != null) {
            lead.setEmail(email);
        }
        if (serviceId != null) {
            ServiceEntity svc = serviceRepository.findById(serviceId).orElse(null);
            lead.setService(svc);
        } else if (serviceName != null && !serviceName.isBlank()) {
            serviceRepository.findByNameIgnoreCase(serviceName)
                .ifPresent(svc -> lead.setService(svc));
        }
        if (source != null && !source.isBlank()) {
            lead.setSource(source.toUpperCase());
        }
        if (status != null && !status.isBlank()) {
            lead.setStatus(com.lawfirm.brs.constants.LeadStatus.valueOf(status.toUpperCase()));
            if (lead.getStatus() == com.lawfirm.brs.constants.LeadStatus.WON) {
                lead.setConvertedAt(Instant.now());
            }
        }
        if (assignedToId != null) {
            User user = userRepository.findById(assignedToId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assignedToId));
            lead.setAssignedTo(user);
        } else if (assignedToName != null && !assignedToName.isBlank()) {
            // Resolve user by full name
            userRepository.findByFullNameIgnoreCase(assignedToName)
                .ifPresent(user -> lead.setAssignedTo(user));
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

        // Primary storage: one row per note (V12+).
        LeadNote row = LeadNote.builder()
            .lead(lead)
            .createdBy(userId != null ? userRepository.findById(userId).orElse(null) : null)
            .content(note)
            .build();
        leadNoteRepository.save(row);

        // Legacy blob: keep appending so any code reading leads.notes directly
        // (e.g. old API consumers, CSV export) keeps working until V13 removes it.
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

    /**
     * Returns the note history of a lead, newest first, from the first-class
     * {@code lead_notes} table (V12+). Falls back to parsing the legacy
     * {@code leads.notes} blob if no rows exist yet (handles pre-V12 leads).
     */
    public List<LeadNoteDTO> getNotes(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found: " + id);
        }
        List<LeadNote> rows = leadNoteRepository.findByLead_IdOrderByCreatedAtDesc(id);
        if (!rows.isEmpty()) {
            return rows.stream()
                .map(r -> LeadNoteDTO.of(r.getCreatedAt(), r.getContent()))
                .toList();
        }
        // Pre-V12 fallback: no rows yet, fall back to legacy blob parser so
        // historical data is never invisible even before a manual backfill.
        Instant fallback = leadRepository.findById(id)
            .map(Lead::getCreatedAt)
            .orElse(Instant.now());
        return parseNotes(leadRepository.findById(id).orElseThrow().getNotes(), fallback);
    }

    /**
     * Splits a legacy {@code leads.notes} blob into timestamped entries.
     * Retained only for the pre-V12 fallback path and its unit tests.
     * No new code should call this — use {@code lead_notes} rows instead.
     */
    static List<LeadNoteDTO> parseNotes(String raw, Instant fallbackTimestamp) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        // Each note line starts with "[<timestamp>]" — group 1 captures the
        // timestamp, group 2 captures the content after "] ".
        Pattern entry = Pattern.compile("^\\s*\\[([^\\]]+)\\]\\s*(.*)$");
        List<LeadNoteDTO> parsed = new ArrayList<>();
        for (String line : raw.split("\\R")) {
            if (line.isBlank()) {
                continue;
            }
            Matcher m = entry.matcher(line);
            Instant ts;
            String content;
            if (m.matches()) {
                try {
                    ts = Instant.parse(m.group(1).trim());
                } catch (DateTimeParseException ex) {
                    ts = fallbackTimestamp;
                }
                content = m.group(2).trim();
            } else {
                ts = fallbackTimestamp;
                content = line.trim();
            }
            if (!content.isEmpty()) {
                parsed.add(LeadNoteDTO.of(ts, content));
            }
        }
        parsed.sort(Comparator.comparing(LeadNoteDTO::createdAt).reversed());
        return parsed;
    }

    @Transactional
    public void deleteLead(UUID id) {
        log.warn("Soft-deleting lead: {}", id);
        Lead lead = leadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
        lead.setNotes((lead.getNotes() != null ? lead.getNotes() + "\n" : "")
            + "[" + Instant.now() + "] deleted");
        leadRepository.save(lead);
    }

    /**
     * Returns real lead pipeline counts grouped by status.
     * Used by the staff dashboard to replace fake math calculations.
     */
    @Transactional(readOnly = true)
    public com.lawfirm.brs.controller.crm.LeadController.PipelineStatsResponse getPipelineStats() {
        long total = leadRepository.count();
        long newCount = leadRepository.countByStatus(com.lawfirm.brs.constants.LeadStatus.NEW);
        long contacted = leadRepository.countByStatus(com.lawfirm.brs.constants.LeadStatus.CONTACTED);
        long qualified = leadRepository.countByStatus(com.lawfirm.brs.constants.LeadStatus.QUALIFIED);
        long converted = leadRepository.countByStatus(com.lawfirm.brs.constants.LeadStatus.WON);
        long lost = leadRepository.countByStatus(com.lawfirm.brs.constants.LeadStatus.LOST);
        double conversionRate = total > 0 ? (double) converted / total * 100 : 0;
        return new com.lawfirm.brs.controller.crm.LeadController.PipelineStatsResponse(
            total, newCount, contacted, qualified, converted, lost, Math.round(conversionRate * 10.0) / 10.0);
    }
}
