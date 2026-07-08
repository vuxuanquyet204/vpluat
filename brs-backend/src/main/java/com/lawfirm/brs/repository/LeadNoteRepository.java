package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LeadNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadNoteRepository extends JpaRepository<LeadNote, UUID> {

    /**
     * Returns all notes for a lead, newest first. Backs the lead detail
     * "Ghi chú" tab — capped implicitly by the UI's pagination.
     */
    List<LeadNote> findByLead_IdOrderByCreatedAtDesc(UUID leadId);
}