package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.AvailabilitySlotDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.entity.AvailabilitySlot;
import com.lawfirm.brs.entity.LawyerProfile;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-29T00:41:02+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class AvailabilitySlotMapperImpl implements AvailabilitySlotMapper {

    @Override
    public AvailabilitySlotDTO toDTO(AvailabilitySlot slot) {
        if ( slot == null ) {
            return null;
        }

        AvailabilitySlotDTO.AvailabilitySlotDTOBuilder availabilitySlotDTO = AvailabilitySlotDTO.builder();

        availabilitySlotDTO.lawyerId( slotLawyerId( slot ) );
        availabilitySlotDTO.appointmentId( slotAppointmentId( slot ) );
        availabilitySlotDTO.id( slot.getId() );
        availabilitySlotDTO.slotDate( slot.getSlotDate() );
        availabilitySlotDTO.startTime( slot.getStartTime() );
        availabilitySlotDTO.endTime( slot.getEndTime() );
        availabilitySlotDTO.isAvailable( slot.getIsAvailable() );

        return availabilitySlotDTO.build();
    }

    @Override
    public AvailabilitySlotDTO toDTOWithDetails(AvailabilitySlot slot) {
        if ( slot == null ) {
            return null;
        }

        AvailabilitySlotDTO.AvailabilitySlotDTOBuilder availabilitySlotDTO = AvailabilitySlotDTO.builder();

        availabilitySlotDTO.lawyerId( slotLawyerId( slot ) );
        availabilitySlotDTO.appointmentId( slotAppointmentId( slot ) );
        availabilitySlotDTO.id( slot.getId() );
        availabilitySlotDTO.slotDate( slot.getSlotDate() );
        availabilitySlotDTO.startTime( slot.getStartTime() );
        availabilitySlotDTO.endTime( slot.getEndTime() );
        availabilitySlotDTO.isAvailable( slot.getIsAvailable() );

        return availabilitySlotDTO.build();
    }

    @Override
    public List<AvailabilitySlotDTO> toDTOList(List<AvailabilitySlot> slots) {
        if ( slots == null ) {
            return null;
        }

        List<AvailabilitySlotDTO> list = new ArrayList<AvailabilitySlotDTO>( slots.size() );
        for ( AvailabilitySlot availabilitySlot : slots ) {
            list.add( availabilitySlotToAvailabilitySlotDTO( availabilitySlot ) );
        }

        return list;
    }

    private UUID slotLawyerId(AvailabilitySlot availabilitySlot) {
        if ( availabilitySlot == null ) {
            return null;
        }
        LawyerProfile lawyer = availabilitySlot.getLawyer();
        if ( lawyer == null ) {
            return null;
        }
        UUID id = lawyer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private UUID slotAppointmentId(AvailabilitySlot availabilitySlot) {
        if ( availabilitySlot == null ) {
            return null;
        }
        Appointment appointment = availabilitySlot.getAppointment();
        if ( appointment == null ) {
            return null;
        }
        UUID id = appointment.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected AvailabilitySlotDTO availabilitySlotToAvailabilitySlotDTO(AvailabilitySlot availabilitySlot) {
        if ( availabilitySlot == null ) {
            return null;
        }

        AvailabilitySlotDTO.AvailabilitySlotDTOBuilder availabilitySlotDTO = AvailabilitySlotDTO.builder();

        availabilitySlotDTO.id( availabilitySlot.getId() );
        availabilitySlotDTO.slotDate( availabilitySlot.getSlotDate() );
        availabilitySlotDTO.startTime( availabilitySlot.getStartTime() );
        availabilitySlotDTO.endTime( availabilitySlot.getEndTime() );
        availabilitySlotDTO.isAvailable( availabilitySlot.getIsAvailable() );

        return availabilitySlotDTO.build();
    }
}
