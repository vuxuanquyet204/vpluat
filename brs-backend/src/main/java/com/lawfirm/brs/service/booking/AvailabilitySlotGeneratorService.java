package com.lawfirm.brs.service.booking;

import com.lawfirm.brs.entity.AvailabilitySlot;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.repository.AvailabilitySlotRepository;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for auto-generating availability slots.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilitySlotGeneratorService {

    private final AvailabilitySlotRepository slotRepository;
    private final LawyerProfileRepository lawyerRepository;

    @Transactional
    public void generateSlotsForActiveLawyers() {
        log.info("Running availability slot generation...");

        List<LawyerProfile> allLawyers = lawyerRepository.findAll();

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(30);

        int totalCreated = 0;
        for (LawyerProfile lawyer : allLawyers) {
            int created = createSlotsForLawyer(lawyer, startDate, endDate);
            totalCreated += created;
        }

        log.info("Generated {} slots for {} lawyers", totalCreated, allLawyers.size());
    }

    @Transactional
    public void generateSlotsForLawyer(UUID lawyerId, LocalDate startDate, LocalDate endDate) {
        LawyerProfile lawyer = lawyerRepository.findById(lawyerId)
                .orElseThrow(() -> new IllegalArgumentException("Lawyer not found: " + lawyerId));

        int created = createSlotsForLawyer(lawyer, startDate, endDate);
        log.info("Generated {} slots for lawyer: {}", created, lawyerId);
    }

    private int createSlotsForLawyer(LawyerProfile lawyer, LocalDate startDate, LocalDate endDate) {
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(17, 0);
        int slotDuration = 60;

        int createdCount = 0;
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            LocalTime slotStart = startTime;
            while (slotStart.plusMinutes(slotDuration).isBefore(endTime) ||
                   slotStart.plusMinutes(slotDuration).equals(endTime)) {

                LocalTime slotEnd = slotStart.plusMinutes(slotDuration);

                if (!slotRepository.existsByLawyerIdAndSlotDateAndStartTime(
                        lawyer.getId(), current, slotStart)) {

                    AvailabilitySlot slot = AvailabilitySlot.builder()
                            .lawyer(lawyer)
                            .slotDate(current)
                            .startTime(slotStart)
                            .endTime(slotEnd)
                            .isAvailable(true)
                            .build();
                    slotRepository.save(slot);
                    createdCount++;
                }

                slotStart = slotEnd;
            }
            current = current.plusDays(1);
        }

        return createdCount;
    }
}
