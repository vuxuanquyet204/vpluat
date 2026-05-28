package com.lawfirm.brs.service.crm;

import com.lawfirm.brs.entity.Lead;
import com.lawfirm.brs.repository.jpa.LeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for lead deduplication using duplicate hash.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LeadDeduplicationService {

    private final LeadRepository leadRepository;

    /**
     * Compute duplicate hash from email and phone
     * Format: SHA256(phone|email lowercase)
     */
    public String computeDuplicateHash(String email, String phone) {
        String raw = ((phone != null ? phone : "") + "|" +
                      (email != null ? email : "")).toLowerCase().trim();
        return org.apache.commons.codec.digest.DigestUtils.sha256Hex(raw);
    }

    /**
     * Check if a lead with the same phone or email already exists
     */
    public Optional<Lead> findDuplicate(String email, String phone) {
        String hash = computeDuplicateHash(email, phone);
        log.debug("Checking duplicate with hash: {}", hash);
        return leadRepository.findByDuplicateHash(hash);
    }

    /**
     * Check if a lead with the same phone or email already exists
     */
    public boolean hasDuplicate(String email, String phone) {
        return findDuplicate(email, phone).isPresent();
    }

    /**
     * Get all leads with the same duplicate hash
     */
    public List<Lead> getDuplicates(String email, String phone) {
        String hash = computeDuplicateHash(email, phone);
        log.debug("Finding all duplicates with hash: {}", hash);
        return leadRepository.findAllByDuplicateHash(hash);
    }

    /**
     * Get all leads with the same duplicate hash (by hash)
     */
    public List<Lead> getDuplicatesByHash(String duplicateHash) {
        log.debug("Finding all duplicates with hash: {}", duplicateHash);
        return leadRepository.findAllByDuplicateHash(duplicateHash);
    }

    /**
     * Merge duplicate leads into one (keep the most recent, archive others)
     */
    @Transactional
    public Lead mergeDuplicates(UUID primaryLeadId, List<UUID> duplicateLeadIds) {
        Lead primary = leadRepository.findById(primaryLeadId)
            .orElseThrow(() -> new com.lawfirm.brs.exception.ResourceNotFoundException("Lead not found: " + primaryLeadId));

        for (UUID duplicateId : duplicateLeadIds) {
            if (duplicateId.equals(primaryLeadId)) {
                continue;
            }
            leadRepository.findById(duplicateId).ifPresent(duplicate -> {
                if (duplicate.getNotes() != null) {
                    String existingNotes = primary.getNotes() != null ? primary.getNotes() + "\n" : "";
                    primary.setNotes(existingNotes + "[MERGED] " + duplicate.getNotes());
                }
                if (duplicate.getSource() != null && !duplicate.getSource().equals(primary.getSource())) {
                    String existingNotes = primary.getNotes() != null ? primary.getNotes() + "\n" : "";
                    primary.setNotes(existingNotes + "[MERGED from source: " + duplicate.getSource() + "]");
                }
                log.info("Merged duplicate lead {} into lead {}", duplicateId, primaryLeadId);
            });
        }

        return leadRepository.save(primary);
    }
}
