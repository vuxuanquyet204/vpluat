package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.NewsletterCampaign;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Newsletter campaign repository.
 */
@Repository
public interface NewsletterCampaignRepository extends JpaRepository<NewsletterCampaign, UUID> {

    Page<NewsletterCampaign> findAllByDeletedAtIsNullOrderByUpdatedAtDesc(Pageable pageable);

    Page<NewsletterCampaign> findAllByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(
        CampaignStatus status, Pageable pageable);

    List<NewsletterCampaign> findAllByDeletedAtIsNullOrderByUpdatedAtDesc();

    /**
     * Campaigns due to be sent by the scheduler.
     */
    @Query("""
        SELECT c FROM NewsletterCampaign c
        WHERE c.status = com.lawfirm.brs.entity.NewsletterCampaign$CampaignStatus.SCHEDULED
          AND c.deletedAt IS NULL
          AND c.scheduledAt IS NOT NULL
          AND c.scheduledAt <= :now
        """)
    List<NewsletterCampaign> findDueScheduled(@Param("now") Instant now);
}
