package com.lawfirm.brs.scheduler;

import com.lawfirm.brs.entity.NewsletterCampaign;
import com.lawfirm.brs.entity.NewsletterCampaign.CampaignStatus;
import com.lawfirm.brs.repository.NewsletterCampaignRepository;
import com.lawfirm.brs.service.content.NewsletterCampaignSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class NewsletterCampaignScheduler {
    private final NewsletterCampaignRepository campaignRepository;
    private final NewsletterCampaignSender campaignSender;

    @Scheduled(fixedDelay = 60_000L)
    @Transactional
    public void sendDueCampaigns() {
        for (NewsletterCampaign campaign : campaignRepository.findDueScheduled(Instant.now())) {
            campaign.setStatus(CampaignStatus.SENDING);
            campaign.setUpdatedAt(Instant.now());
            campaignRepository.save(campaign);
            campaignSender.sendAsync(campaign.getId());
            log.info("Queued scheduled newsletter campaign id={}", campaign.getId());
        }
    }
}
