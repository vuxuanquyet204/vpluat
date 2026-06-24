package com.lawfirm.brs.service.erp;

import com.lawfirm.brs.constants.AppointmentStatus;
import com.lawfirm.brs.constants.LeadStatus;
import com.lawfirm.brs.dto.response.DistributionSlice;
import com.lawfirm.brs.dto.response.TimeSeriesPoint;
import com.lawfirm.brs.repository.AppointmentRepository;
import com.lawfirm.brs.repository.LeadRepository;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aggregated reports: revenue, conversion funnel, lawyer performance,
 * service trends, and CSV export for any of them.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportExportService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    private final LeadRepository leadRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final LawyerProfileRepository lawyerRepository;

    public List<TimeSeriesPoint> revenue(String range, String groupBy) {
        Instant[] w = rangeWindow(range);
        long days = ChronoUnit.DAYS.between(w[0], w[1]);
        long buckets = switch (groupBy == null ? "day" : groupBy) {
            case "week" -> Math.max(1, days / 7);
            case "month" -> Math.max(1, days / 30);
            default -> Math.max(1, Math.min(days, 90));
        };

        var confirmed = appointmentRepository.findConfirmedAppointmentsInRange(w[0], w[1]);
        Map<LocalDate, Long> counts = new HashMap<>();
        for (var a : confirmed) {
            LocalDate d = a.getScheduledAt().atZone(ZoneId.systemDefault()).toLocalDate();
            counts.merge(d, 1L, Long::sum);
        }

        List<TimeSeriesPoint> out = new ArrayList<>();
        LocalDate from = w[0].atZone(ZoneId.systemDefault()).toLocalDate();
        for (long i = 0; i < buckets; i++) {
            LocalDate d = from.plusDays(i);
            out.add(TimeSeriesPoint.builder()
                .date(d)
                .value(counts.getOrDefault(d, 0L))
                .label(d.format(ISO))
                .build());
        }
        return out;
    }

    public Map<String, Object> conversionFunnel(String range) {
        Instant[] w = rangeWindow(range);
        long total = leadRepository.countByCreatedAtBetween(w[0], w[1]);
        long contacted = leadRepository.countByStatusAndCreatedAtBetween(LeadStatus.CONTACTED, w[0], w[1]);
        long qualified = leadRepository.countByStatusAndCreatedAtBetween(LeadStatus.QUALIFIED, w[0], w[1]);
        long won = leadRepository.countByStatusAndCreatedAtBetween(LeadStatus.WON, w[0], w[1]);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("total", total);
        map.put("contacted", contacted);
        map.put("qualified", qualified);
        map.put("converted", won);
        map.put("conversionRate", total == 0 ? 0 : round2(won * 100.0 / total));
        return map;
    }

    public List<Map<String, Object>> lawyerPerformance(Instant from, Instant to) {
        var lawyers = lawyerRepository.findAll();
        List<Map<String, Object>> out = new ArrayList<>();
        for (var l : lawyers) {
            var appts = appointmentRepository.findByLawyerIdAndScheduledAtBetween(
                l.getId(), from, to);
            long confirmed = appts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED
                          || a.getStatus() == AppointmentStatus.COMPLETED)
                .count();
            long cancelled = appts.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count();
            Double avg = reviewRepository.findAverageRatingByLawyerId(l.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("lawyerId", l.getId());
            row.put("name", l.getNameVi());
            row.put("totalBookings", appts.size());
            row.put("confirmedBookings", confirmed);
            row.put("cancelledBookings", cancelled);
            row.put("avgRating", avg == null ? 0 : Math.round(avg * 10) / 10.0);
            out.add(row);
        }
        out.sort((a, b) -> Long.compare(
            ((Number) b.get("confirmedBookings")).longValue(),
            ((Number) a.get("confirmedBookings")).longValue()));
        return out;
    }

    public List<DistributionSlice> serviceTrends(String range) {
        Instant[] w = rangeWindow(range);
        var rows = leadRepository.countByServiceInRange(w[0], w[1]);
        long total = rows.stream().mapToLong(r -> ((Number) r[1]).longValue()).sum();
        if (total == 0) return List.of();
        return rows.stream()
            .map(r -> DistributionSlice.builder()
                .label((String) r[0])
                .count(((Number) r[1]).longValue())
                .percentage(round2(((Number) r[1]).longValue() * 100.0 / total))
                .build())
            .collect(Collectors.toList());
    }

    public String export(String reportType, String range) {
        StringWriter sw = new StringWriter();
        try (PrintWriter pw = new PrintWriter(sw)) {
            switch (reportType.toLowerCase(Locale.ROOT)) {
                case "revenue" -> {
                    pw.println("date,bookings");
                    revenue(range, "day").forEach(p ->
                        pw.printf("%s,%d%n", p.getLabel(), p.getValue()));
                }
                case "conversion" -> {
                    pw.println("metric,value");
                    var f = conversionFunnel(range);
                    f.forEach((k, v) -> pw.printf("%s,%s%n", k, v));
                }
                case "lawyer" -> {
                    pw.println("lawyerId,name,total,confirmed,cancelled,avgRating");
                    lawyerPerformance(Instant.EPOCH, Instant.now().plusSeconds(60))
                        .forEach(r -> pw.printf("%s,%s,%s,%s,%s,%s%n",
                            r.get("lawyerId"), r.get("name"),
                            r.get("totalBookings"), r.get("confirmedBookings"),
                            r.get("cancelledBookings"), r.get("avgRating")));
                }
                case "service" -> {
                    pw.println("service,count,percentage");
                    serviceTrends(range).forEach(s ->
                        pw.printf("%s,%d,%.2f%n", s.getLabel(), s.getCount(), s.getPercentage()));
                }
                default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
            }
        }
        return sw.toString();
    }

    private Instant[] rangeWindow(String range) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate today = LocalDate.now(zone);
        LocalDate from;
        if (range == null) range = "week";
        switch (range.toLowerCase(Locale.ROOT)) {
            case "today": from = today; break;
            case "month": from = today.minusMonths(1); break;
            case "quarter": from = today.minusMonths(3); break;
            case "year": from = today.minusYears(1); break;
            case "week":
            default: from = today.minusDays(7); break;
        }
        return new Instant[] {
            from.atStartOfDay(zone).toInstant(),
            today.plusDays(1).atStartOfDay(zone).toInstant()
        };
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
