package com.lawfirm.brs.service.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.brs.dto.response.LawyerScheduleDTO;
import com.lawfirm.brs.dto.response.LawyerScheduleOverrideDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.LawyerSchedule;
import com.lawfirm.brs.entity.LawyerScheduleOverride;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.LawyerScheduleOverrideRepository;
import com.lawfirm.brs.repository.LawyerScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing lawyer schedules and overrides.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LawyerScheduleService {

    private final LawyerScheduleRepository scheduleRepository;
    private final LawyerScheduleOverrideRepository overrideRepository;
    private final LawyerProfileRepository lawyerRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<LawyerScheduleDTO> getScheduleByLawyer(UUID lawyerId) {
        log.debug("Fetching schedule for lawyer: {}", lawyerId);

        if (!lawyerRepository.existsById(lawyerId)) {
            throw new ResourceNotFoundException("Lawyer not found: " + lawyerId);
        }

        List<LawyerSchedule> schedules = scheduleRepository.findByLawyerIdOrderByDayOfWeekAsc(lawyerId);

        // Ensure all 7 days are present (0-6)
        Map<Integer, LawyerSchedule> scheduleMap = schedules.stream()
            .collect(Collectors.toMap(LawyerSchedule::getDayOfWeek, s -> s));

        List<LawyerScheduleDTO> result = new ArrayList<>();
        for (int day = 0; day <= 6; day++) {
            LawyerSchedule schedule = scheduleMap.get(day);
            if (schedule != null) {
                result.add(toDTO(schedule));
            } else {
                // Default: day off
                result.add(new LawyerScheduleDTO(
                    null, lawyerId, null, day, true,
                    Collections.emptyList(), null, null, null
                ));
            }
        }
        return result;
    }

    @Transactional
    public List<LawyerScheduleDTO> saveSchedule(UUID lawyerId, List<LawyerScheduleDTO.SlotUpdate> updates) {
        log.info("Saving schedule for lawyer: {}", lawyerId);

        LawyerProfile lawyer = lawyerRepository.findById(lawyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + lawyerId));

        for (LawyerScheduleDTO.SlotUpdate update : updates) {
            Optional<LawyerSchedule> existingOpt = scheduleRepository.findByLawyerIdAndDayOfWeek(lawyerId, update.dayOfWeek());

            LawyerSchedule schedule;
            if (existingOpt.isPresent()) {
                schedule = existingOpt.get();
            } else {
                schedule = LawyerSchedule.builder()
                    .lawyer(lawyer)
                    .dayOfWeek(update.dayOfWeek())
                    .createdAt(java.time.Instant.now())
                    .updatedAt(java.time.Instant.now())
                    .build();
            }

            schedule.setIsOff(update.isOff());
            if (update.slots() != null && !update.slots().isEmpty()) {
                schedule.setSlots(toJson(update.slots()));
            } else {
                schedule.setSlots("[]");
            }
            schedule.setNote(update.note());

            scheduleRepository.save(schedule);
        }

        return getScheduleByLawyer(lawyerId);
    }

    @Transactional(readOnly = true)
    public Map<UUID, LawyerScheduleResponse> getAllSchedules(LocalDate from, LocalDate to) {
        log.debug("Fetching all lawyer schedules from {} to {}", from, to);

        List<LawyerProfile> lawyers = lawyerRepository.findAll();
        Map<UUID, LawyerScheduleResponse> result = new HashMap<>();

        for (LawyerProfile lawyer : lawyers) {
            UUID lawyerId = lawyer.getId();

            List<LawyerScheduleDTO> regular = getScheduleByLawyer(lawyerId);
            List<LawyerScheduleOverrideDTO> overrides = overrideRepository
                .findByLawyerIdAndOverrideDateBetweenOrderByOverrideDateAsc(lawyerId, from, to)
                .stream()
                .map(this::toOverrideDTO)
                .toList();

            result.put(lawyerId, new LawyerScheduleResponse(regular, overrides));
        }

        return result;
    }

    @Transactional
    public LawyerScheduleOverrideDTO createOverride(UUID lawyerId, LocalDate overrideDate,
            String type, List<LawyerScheduleDTO.TimeSlot> slots, String reason) {
        log.info("Creating schedule override for lawyer {} on {}", lawyerId, overrideDate);

        LawyerProfile lawyer = lawyerRepository.findById(lawyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + lawyerId));

        // Remove existing override for the same date
        overrideRepository.findByLawyerIdAndOverrideDate(lawyerId, overrideDate)
            .ifPresent(overrideRepository::delete);

        boolean isOff = "off".equalsIgnoreCase(type);

        LawyerScheduleOverride override = LawyerScheduleOverride.builder()
            .lawyer(lawyer)
            .overrideDate(overrideDate)
            .isOff(isOff)
            .slots(toJson(slots))
            .reason(reason)
            .createdAt(java.time.Instant.now())
            .build();

        override = overrideRepository.save(override);
        return toOverrideDTO(override);
    }

    @Transactional
    public void deleteOverride(UUID lawyerId, LocalDate overrideDate) {
        log.info("Deleting schedule override for lawyer {} on {}", lawyerId, overrideDate);
        overrideRepository.findByLawyerIdAndOverrideDate(lawyerId, overrideDate)
            .ifPresent(overrideRepository::delete);
    }

    private LawyerScheduleDTO toDTO(LawyerSchedule schedule) {
        List<LawyerScheduleDTO.TimeSlot> slots = parseSlots(schedule.getSlots());
        String lawyerName = schedule.getLawyer() != null
            ? schedule.getLawyer().getDisplayName("vi")
            : null;

        return new LawyerScheduleDTO(
            schedule.getId(),
            schedule.getLawyer() != null ? schedule.getLawyer().getId() : null,
            lawyerName,
            schedule.getDayOfWeek(),
            Boolean.TRUE.equals(schedule.getIsOff()),
            slots,
            schedule.getEffectiveFrom(),
            schedule.getEffectiveTo(),
            schedule.getNote()
        );
    }

    private LawyerScheduleOverrideDTO toOverrideDTO(LawyerScheduleOverride override) {
        List<LawyerScheduleDTO.TimeSlot> slots = parseSlots(override.getSlots());
        String lawyerName = override.getLawyer() != null
            ? override.getLawyer().getDisplayName("vi")
            : null;

        return new LawyerScheduleOverrideDTO(
            override.getId(),
            override.getLawyer() != null ? override.getLawyer().getId() : null,
            lawyerName,
            override.getOverrideDate(),
            Boolean.TRUE.equals(override.getIsOff()) ? "off" : "custom",
            slots,
            override.getReason(),
            override.getCreatedAt() != null
                ? override.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
                : null
        );
    }

    private List<LawyerScheduleDTO.TimeSlot> parseSlots(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<LawyerScheduleDTO.TimeSlot>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse slots JSON: {}", json, e);
            return Collections.emptyList();
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize to JSON", e);
            return "[]";
        }
    }

    public record LawyerScheduleResponse(
        List<LawyerScheduleDTO> regular,
        List<LawyerScheduleOverrideDTO> overrides
    ) {}
}
