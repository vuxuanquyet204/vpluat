package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.response.DashboardStatsDTO;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.NewsletterSubscriberRepository;
import com.lawfirm.brs.repository.PostRepository;
import com.lawfirm.brs.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Service for admin dashboard statistics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final LeadRepository leadRepository;
    private final AppointmentRepository appointmentRepository;
    private final PostRepository postRepository;
    private final ReviewRepository reviewRepository;
    private final NewsletterSubscriberRepository subscriberRepository;

    public DashboardStatsDTO getStats() {
        log.debug("Fetching dashboard statistics");

        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        return DashboardStatsDTO.builder()
            .totalLeads(leadRepository.count())
            .newLeads(leadRepository.countByStatusAndCreatedAtAfter(
                com.lawfirm.brs.constants.LeadStatus.NEW, oneWeekAgo))
            .totalAppointments(appointmentRepository.count())
            .pendingAppointments(appointmentRepository.countByStatus(
                com.lawfirm.brs.constants.AppointmentStatus.PENDING))
            .confirmedAppointments(appointmentRepository.countByStatus(
                com.lawfirm.brs.constants.AppointmentStatus.CONFIRMED))
            .totalPosts(postRepository.count())
            .publishedPosts(postRepository.countByStatus(
                com.lawfirm.brs.constants.PostStatus.PUBLISHED))
            .totalReviews(reviewRepository.count())
            .newsletterSubscribers(subscriberRepository.countByStatus("ACTIVE"))
            .build();
    }
}
