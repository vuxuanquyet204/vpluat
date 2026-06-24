package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.dto.response.ActivityLogResponse;
import com.lawfirm.brs.dto.response.BulkImportResponse;
import com.lawfirm.brs.dto.response.LeadDTO;
import com.lawfirm.brs.entity.BulkImport;
import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.entity.LeadActivity;
import com.lawfirm.brs.entity.User;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LeadMapper;
import com.lawfirm.brs.repository.BulkImportRepository;
import com.lawfirm.brs.repository.LeadActivityRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Extended lead pipeline operations: timeline, assignment, bulk import, CSV export.
 * Sits alongside {@link com.lawfirm.brs.service.crm.LeadService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LeadPipelineService {

    private final LeadRepository leadRepository;
    private final LeadActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final BulkImportRepository bulkImportRepository;
    private final LeadMapper leadMapper;

    /**
     * Append an entry to the lead timeline.
     */
    public void recordActivity(UUID leadId, UUID actorId, String action, String note, Map<String, Object> meta) {
        if (!leadRepository.existsById(leadId)) {
            throw new ResourceNotFoundException("Lead not found: " + leadId);
        }
        LeadActivity activity = LeadActivity.builder()
            .lead(Lead.builder().id(leadId).build())
            .user(buildUserRef(actorId))
            .action(action)
            .note(note)
            .metadata(meta == null ? "{}" : toJson(meta))
            .build();
        activityRepository.save(activity);
    }

    /**
     * List the timeline entries for a lead (most recent first).
     */
    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getTimeline(UUID leadId) {
        var entries = activityRepository.findByLeadIdOrderByCreatedAtDesc(leadId, PageRequest.of(0, 200));
        if (entries.isEmpty()) {
            return List.of();
        }
        // Resolve actor names in a single pass
        Set<UUID> actorIds = entries.stream()
            .map(e -> e.getUser() == null ? null : e.getUser().getId())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        Map<UUID, String> nameById = userRepository.findAllById(actorIds).stream()
            .collect(Collectors.toMap(u -> u.getId(), u -> u.getFullName() == null ? "user" : u.getFullName()));

        return entries.stream()
            .map(e -> ActivityLogResponse.builder()
                .id(e.getId())
                .actorName(e.getUser() == null ? "system" : nameById.getOrDefault(e.getUser().getId(), "user"))
                .action(e.getAction())
                .entityType("LEAD")
                .entityId(leadId)
                .summary(e.getNote() == null ? e.getAction() : e.getAction() + " — " + truncate(e.getNote(), 80))
                .createdAt(e.getCreatedAt())
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Assign a lead to a user. Records timeline + audit entry.
     */
    public LeadDTO assign(UUID leadId, UUID assigneeId, UUID actorId) {
        Lead lead = leadRepository.findById(leadId)
            .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));
        User user = userRepository.findById(assigneeId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeId));
        lead.setAssignedTo(user);
        leadRepository.save(lead);
        recordActivity(leadId, actorId, "ASSIGNED",
            "Assigned to " + user.getFullName(), Map.of("assigneeId", assigneeId.toString()));
        return leadMapper.toDTO(lead);
    }

    /**
     * Bulk import leads from a CSV file.
     * Expected columns (with header): name,email,phone,source,message
     */
    public BulkImportResponse bulkImport(MultipartFile file, UUID actorId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Empty upload");
        }
        BulkImport job = BulkImport.builder()
            .entityType("LEAD")
            .fileName(file.getOriginalFilename())
            .totalRows(0)
            .importedCount(0)
            .failedCount(0)
            .importedBy(buildUserRef(actorId))
            .build();
        job = bulkImportRepository.save(job);

        List<String> errors = new ArrayList<>();
        int imported = 0;
        int total = 0;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                throw new IllegalArgumentException("Empty CSV");
            }
            String[] cols = splitCsv(header);
            Map<String, Integer> idx = new HashMap<>();
            for (int i = 0; i < cols.length; i++) idx.put(cols[i].trim().toLowerCase(), i);

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                total++;
                try {
                    String[] cells = splitCsv(line);
                    Lead lead = Lead.builder()
                        .name(get(cells, idx, "name", ""))
                        .email(get(cells, idx, "email", null))
                        .phone(get(cells, idx, "phone", null))
                        .source(get(cells, idx, "source", "IMPORT"))
                        .message(get(cells, idx, "message", null))
                        .build();
                    if (lead.getName().isBlank()) {
                        throw new IllegalArgumentException("name is required");
                    }
                    leadRepository.save(lead);
                    imported++;
                } catch (Exception ex) {
                    errors.add("row " + (total + 1) + ": " + ex.getMessage());
                }
            }
        } catch (IOException io) {
            log.error("CSV read failed", io);
            throw new RuntimeException("Failed to read CSV", io);
        }

        job.setTotalRows(total);
        job.setImportedCount(imported);
        job.setFailedCount(total - imported);
        job.setErrorLog(toJson(Map.of("errors", errors.stream().limit(50).toList())));
        job.setFinishedAt(Instant.now());
        bulkImportRepository.save(job);

        return BulkImportResponse.builder()
            .importId(job.getId())
            .totalRows(total)
            .importedCount(imported)
            .failedCount(total - imported)
            .errors(errors.stream().limit(20).toList())
            .build();
    }

    /**
     * Export leads (optionally filtered) as CSV.
     */
    @Transactional(readOnly = true)
    public String exportCsv(String status, String source) {
        List<Lead> leads = leadRepository.findAll().stream()
            .filter(l -> status == null || status.isBlank()
                || l.getStatus().name().equalsIgnoreCase(status))
            .filter(l -> source == null || source.isBlank()
                || (l.getSource() != null && l.getSource().equalsIgnoreCase(source)))
            .toList();

        StringWriter sw = new StringWriter();
        try (PrintWriter pw = new PrintWriter(sw)) {
            pw.println("id,name,email,phone,source,status,assignedTo,createdAt");
            for (Lead l : leads) {
                pw.printf("%s,%s,%s,%s,%s,%s,%s,%s%n",
                    l.getId(),
                    csv(l.getName()),
                    csv(l.getEmail()),
                    csv(l.getPhone()),
                    csv(l.getSource()),
                    l.getStatus(),
                    l.getAssignedTo() == null ? "" : l.getAssignedTo().getId(),
                    l.getCreatedAt());
            }
        }
        return sw.toString();
    }

    private static String get(String[] cells, Map<String, Integer> idx, String col, String def) {
        Integer i = idx.get(col);
        if (i == null || i >= cells.length) return def;
        String v = cells[i].trim();
        return v.isEmpty() ? def : v;
    }

    private static User buildUserRef(UUID id) {
        if (id == null) return null;
        User u = new User();
        u.setId(id);
        return u;
    }

    private static String[] splitCsv(String line) {
        // Minimal CSV splitter — does not handle quoted commas. Good enough for bulk import.
        return line.split(",", -1);
    }

    private static String csv(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    private static String toJson(Object o) {
        // Tiny inline JSON serialiser (no Jackson dependency in this method).
        // Avoid pulling ObjectMapper here to keep service dependency-light.
        if (o == null) return "{}";
        if (o instanceof Map<?, ?> map) {
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> e : map.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append('"').append(e.getKey()).append("\":\"").append(e.getValue()).append('"');
            }
            return sb.append('}').toString();
        }
        return "\"" + o + "\"";
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
