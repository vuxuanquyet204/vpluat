package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.AvailabilitySlotDTO;
import com.lawfirm.brs.entity.AvailabilitySlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AvailabilitySlotMapper {

    @Named("slotToDTO")
    @Mapping(target = "lawyerId", source = "lawyer.id")
    @Mapping(target = "appointmentId", source = "appointment.id")
    AvailabilitySlotDTO toDTO(AvailabilitySlot slot);

    @Named("slotToDTOWithDetails")
    @Mapping(target = "lawyerId", source = "lawyer.id")
    @Mapping(target = "appointmentId", source = "appointment.id")
    AvailabilitySlotDTO toDTOWithDetails(AvailabilitySlot slot);

    List<AvailabilitySlotDTO> toDTOList(List<AvailabilitySlot> slots);
}
