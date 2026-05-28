package com.lawfirm.brs.service.booking;

import com.lawfirm.brs.dto.request.AvailabilitySlotRequest;
import com.lawfirm.brs.dto.response.AvailabilitySlotDTO;
import com.lawfirm.brs.entity.AvailabilitySlot;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.exception.BusinessException;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.AvailabilitySlotMapper;
import com.lawfirm.brs.repository.jpa.AvailabilitySlotRepository;
import com.lawfirm.brs.repository.jpa.LawyerProfileRepository;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing lawyer availability slots.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AvailabilityService {

    private final AvailabilitySlotRepository slotRepository;
    private final LawyerProfileRepository lawyerRepository;
    private final AvailabilitySlotMapper slotMapper;

    public List<AvailabilitySlotDTO> getAvailableSlots(UUID lawyerId, LocalDate fromDate, LocalDate toDate) {
        log.debug("Fetching available slots for lawyer: {} from {} to {}", lawyerId, fromDate, toDate);
        
        return slotMapper.toDTOList(
            slotRepository.findAvailableSlots(lawyerId, fromDate, toDate)
        );
    }

    @Transactional
    public AvailabilitySlotDTO createSlot(AvailabilitySlotRequest request) {
        log.info("Creating availability slot for lawyer: {}", request.lawyerId());

        LawyerProfile lawyer = lawyerRepository.findById(request.lawyerId())
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + request.lawyerId()));

        if (request.startTime().isAfter(request.endTime()) || request.startTime().equals(request.endTime())) {
            throw new BusinessException("INVALID_TIME_RANGE", "Start time must be before end time");
        }

        boolean exists = slotRepository.existsByLawyerIdAndSlotDateAndStartTime(
            request.lawyerId(), 
            request.slotDate(), 
            request.startTime()
        );

        if (exists) {
            throw new BusinessException("SLOT_ALREADY_EXISTS", "This slot already exists");
        }

        AvailabilitySlot slot = AvailabilitySlot.builder()
            .lawyer(lawyer)
            .slotDate(request.slotDate())
            .startTime(request.startTime())
            .endTime(request.endTime())
            .isAvailable(true)
            .build();

        slot = slotRepository.save(slot);
        log.info("Created availability slot: {}", slot.getId());

        return slotMapper.toDTO(slot);
    }

    @Transactional
    public void createSlotsFromWorkingHours(UUID lawyerId, LocalDate startDate, LocalDate endDate) {
        log.info("Creating slots from working hours for lawyer: {}", lawyerId);
        
        LawyerProfile lawyer = lawyerRepository.findById(lawyerId)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + lawyerId));

        // Parse working hours from JSON and create slots
        // This is a simplified implementation
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(17, 0);
        int slotDuration = 60;

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            LocalTime slotStart = startTime;
            while (slotStart.plusMinutes(slotDuration).isBefore(endTime) || slotStart.plusMinutes(slotDuration).equals(endTime)) {
                LocalTime slotEnd = slotStart.plusMinutes(slotDuration);
                
                if (!slotRepository.existsByLawyerIdAndSlotDateAndStartTime(lawyerId, current, slotStart)) {
                    AvailabilitySlot slot = AvailabilitySlot.builder()
                        .lawyer(lawyer)
                        .slotDate(current)
                        .startTime(slotStart)
                        .endTime(slotEnd)
                        .isAvailable(true)
                        .build();
                    slotRepository.save(slot);
                }
                
                slotStart = slotEnd;
            }
            current = current.plusDays(1);
        }
    }

    @Transactional
    public void deleteSlot(UUID slotId) {
        log.info("Deleting availability slot: {}", slotId);
        
        AvailabilitySlot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found: " + slotId));

        if (!slot.getIsAvailable()) {
            throw new BusinessException("SLOT_ALREADY_BOOKED", "Cannot delete a booked slot");
        }

        slotRepository.delete(slot);
    }
}
