package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.ChatbotMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, UUID> {

    List<ChatbotMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    long countBySessionId(UUID sessionId);
}
