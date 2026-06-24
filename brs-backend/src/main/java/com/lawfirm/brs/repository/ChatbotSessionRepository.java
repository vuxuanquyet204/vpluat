package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.ChatbotSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatbotSessionRepository extends JpaRepository<ChatbotSession, UUID> {

    Page<ChatbotSession> findByStartedAtBetween(Instant from, Instant to, Pageable pageable);

    Page<ChatbotSession> findByEscalatedTrue(Pageable pageable);

    List<ChatbotSession> findByEscalatedTrueAndEndedAtIsNull();

    long countByStartedAtBetween(Instant from, Instant to);

    long countByEscalatedTrueAndStartedAtBetween(Instant from, Instant to);
}
