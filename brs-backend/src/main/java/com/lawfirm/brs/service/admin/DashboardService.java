package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.constants.LeadStatus;
import com.lawfirm.brs.constants.ReviewStatus;
import com.lawfirm.brs.dto.response.DashboardStatsDTO;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.repository.AuditLogRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.NewsletterSubscriberRepository;
import com.lawfirm.brs.repository.PostRepository;
import com.lawfirm.brs.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

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
    private final AuditLogRepository auditLogRepository;

    public DashboardStatsDTO getStats() {
        log.debug("Fetching dashboard statistics");

        Instant oneWeekAgo = Instant.now().minus(7, ChronoUnit.DAYS);

        return DashboardStatsDTO.builder()
            .totalLeads(leadRepository.count())
            .newLeads(leadRepository.countByStatusAndCreatedAtAfter(
                LeadStatus.NEW, oneWeekAgo))
            .totalAppointments(appointmentRepository.count())
            .pendingAppointments(appointmentRepository.countByStatus(
                AppointmentStatus.PENDING))
            .confirmedAppointments(appointmentRepository.countByStatus(
                AppointmentStatus.CONFIRMED))
            .totalPosts(postRepository.count())
            .publishedPosts(postRepository.countByStatus(
                com.lawfirm.brs.constants.PostStatus.PUBLISHED))
            .totalReviews(reviewRepository.count())
            .newsletterSubscribers(subscriberRepository.countByStatus("ACTIVE"))
            .build();
    }

    /**
     * Compute extended ERP-style stats for a given range.
     * Range: today | week (default) | month | quarter | year.
     */
    public DashboardStatsDTO getStatsRange(String range) {
        if (range == null || range.isBlank()) range = "week";
        String r = range.toLowerCase(Locale.ROOT);
        Instant[] w = rangeWindow(r);
        Instant from = w[0];
        Instant prevFrom = w[2];
        Instant to = w[1];

        ZoneId zone = ZoneId.systemDefault();
        Instant dayStart = LocalDate.now(zone).atStartOfDay(zone).toInstant();
        Instant dayEnd = dayStart.plus(1, ChronoUnit.DAYS);

        int appointmentsToday = (int) appointmentRepository.countByScheduledAtBetween(dayStart, dayEnd);
        int prevAppointmentsToday = (int) prevCount(from, prevFrom, to, dayStart, dayEnd, true);

        int leadsInRange = (int) leadRepository.countByCreatedAtBetween(from, to);
        int prevLeads = (int) leadRepository.countByCreatedAtBetween(prevFrom, from);

        int pending = (int) appointmentRepository.countByStatusAndScheduledAtAfter(
            AppointmentStatus.PENDING, Instant.EPOCH);
        int cancelledToday = (int) appointmentRepository.countByStatusAndScheduledAtBetween(
            AppointmentStatus.CANCELLED, dayStart, dayEnd);
        int completedToday = (int) appointmentRepository.countByStatusAndScheduledAtBetween(
            AppointmentStatus.COMPLETED, dayStart, dayEnd);

        long convertedInRange = leadRepository.countByStatusAndCreatedAtBetween(
            LeadStatus.WON, from, to);
        long prevConverted = leadRepository.countByStatusAndCreatedAtBetween(
            LeadStatus.WON, prevFrom, from);
        BigDecimal conversionRate = leadsInRange == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(convertedInRange).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(leadsInRange), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal prevConversion = prevLeads == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(prevConverted).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(prevLeads), 2, java.math.RoundingMode.HALF_UP);

        long revenue = appointmentRepository.findConfirmedAppointmentsInRange(from, to).stream()
            .filter(java.util.Objects::nonNull)
            .count();
        long prevRevenue = appointmentRepository.findConfirmedAppointmentsInRange(prevFrom, from).stream()
            .filter(java.util.Objects::nonNull)
            .count();

        // Approximate revenue as confirmed booking count (placeholder until
        // service.price is wired into the aggregation).
        BigDecimal revenueValue = BigDecimal.valueOf(revenue * 1_000_000L);
        BigDecimal prevRevenueValue = BigDecimal.valueOf(prevRevenue * 1_000_000L);
        BigDecimal revenueChange = revenueValue.subtract(prevRevenueValue);

        Double avg = reviewRepository.averageApprovedRating();
        BigDecimal rating = avg == null ? BigDecimal.ZERO : BigDecimal.valueOf(Math.round(avg * 10) / 10.0);
        int reviewsPending = (int) reviewRepository.countByStatus(ReviewStatus.PENDING);

        long chatbotInRange = auditLogRepository.findByActionAndCreatedAtBetween("CHAT_MESSAGE", from, to).size()
            + auditLogRepository.findByActionAndCreatedAtBetween("CHATBOT_REPLY", from, to).size();
        long prevChatbot = auditLogRepository.findByActionAndCreatedAtBetween("CHAT_MESSAGE", prevFrom, from).size()
            + auditLogRepository.findByActionAndCreatedAtBetween("CHATBOT_REPLY", prevFrom, from).size();

        return DashboardStatsDTO.builder()
            .appointmentsToday(appointmentsToday)
            .appointmentsChange(appointmentsToday - prevAppointmentsToday)
            .leadsInRange(leadsInRange)
            .leadsChange(leadsInRange - prevLeads)
            .conversionRate(conversionRate)
            .conversionChange(conversionRate.subtract(prevConversion))
            .chatbotConversations((int) chatbotInRange)
            .chatbotChange((int) (chatbotInRange - prevChatbot))
            .pendingCount(pending)
            .cancelledToday(cancelledToday)
            .completedToday(completedToday)
            .revenue(revenueValue)
            .revenueChange(revenueChange)
            .reviewsAvgRating(rating)
            .reviewsPending(reviewsPending)
            .range(r)
            .build();
    }

    private long prevCount(Instant rangeFrom, Instant prevFrom, Instant rangeTo,
                           Instant dayStart, Instant dayEnd, boolean isDay) {
        if (!isDay) return 0L;
        Instant prevDayStart = dayStart.minus(1, ChronoUnit.DAYS);
        Instant prevDayEnd = dayStart;
        return appointmentRepository.countByScheduledAtBetween(prevDayStart, prevDayEnd);
    }

    private static Instant[] rangeWindow(String range) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        LocalDate from;
        switch (range) {
            case "today":
                from = today;
                break;
            case "month":
                from = today.minusMonths(1);
                break;
            case "quarter":
                from = today.minusMonths(3);
                break;
            case "year":
                from = today.minusYears(1);
                break;
            case "week":
            default:
                from = today.minusDays(7);
                break;
        }
        Instant fromInstant = from.atStartOfDay(zone).toInstant();
        Instant toInstant = today.plusDays(1).atStartOfDay(zone).toInstant();
        long days = ChronoUnit.DAYS.between(
            from.atStartOfDay(zone).toInstant(),
            toInstant);
        Instant prevFrom = fromInstant.minus(days, ChronoUnit.SECONDS);
        return new Instant[] { fromInstant, toInstant, prevFrom };
    }
}
