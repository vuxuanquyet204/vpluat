package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.OutboxEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop50ByProcessedFalseOrderByCreatedAtAsc();
    
    Page<OutboxEvent> findByProcessedFalseOrderByCreatedAtAsc(Pageable pageable);
    
    @Modifying
    @Query("UPDATE OutboxEvent o SET o.processed = true, o.processedAt = :now WHERE o.id IN :ids AND o.processed = false")
    int bulkMarkProcessed(List<UUID> ids, Instant now);
}
