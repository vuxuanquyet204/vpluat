package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.entity.Appointment;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
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
public class AppointmentMapperImpl implements AppointmentMapper {

    @Override
    public AppointmentDTO toDTO(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }

        AppointmentDTO.AppointmentDTOBuilder appointmentDTO = AppointmentDTO.builder();

        appointmentDTO.lawyerId( appointmentLawyerId( appointment ) );
        appointmentDTO.lawyerName( appointmentLawyerNameVi( appointment ) );
        appointmentDTO.serviceId( appointmentServiceId( appointment ) );
        appointmentDTO.serviceName( appointmentServiceSlug( appointment ) );
        appointmentDTO.clientPhone( appointment.getClientPhone() );
        appointmentDTO.id( appointment.getId() );
        appointmentDTO.clientName( appointment.getClientName() );
        appointmentDTO.clientEmail( appointment.getClientEmail() );
        appointmentDTO.scheduledAt( appointment.getScheduledAt() );
        appointmentDTO.durationMinutes( appointment.getDurationMinutes() );
        appointmentDTO.timezone( appointment.getTimezone() );
        appointmentDTO.meetingLink( appointment.getMeetingLink() );
        appointmentDTO.cancelReason( appointment.getCancelReason() );
        appointmentDTO.source( appointment.getSource() );
        appointmentDTO.utmSource( appointment.getUtmSource() );
        appointmentDTO.utmMedium( appointment.getUtmMedium() );
        appointmentDTO.utmCampaign( appointment.getUtmCampaign() );
        appointmentDTO.confirmedAt( appointment.getConfirmedAt() );
        appointmentDTO.createdAt( appointment.getCreatedAt() );
        appointmentDTO.updatedAt( appointment.getUpdatedAt() );

        appointmentDTO.status( appointment.getStatus().name() );
        appointmentDTO.meetingType( appointment.getMeetingType().name() );

        return appointmentDTO.build();
    }

    @Override
    public AppointmentDTO toDTOWithDetails(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }

        AppointmentDTO.AppointmentDTOBuilder appointmentDTO = AppointmentDTO.builder();

        appointmentDTO.lawyerId( appointmentLawyerId( appointment ) );
        appointmentDTO.lawyerName( appointmentLawyerNameVi( appointment ) );
        appointmentDTO.serviceId( appointmentServiceId( appointment ) );
        appointmentDTO.serviceName( appointmentServiceSlug( appointment ) );
        appointmentDTO.clientPhone( appointment.getClientPhone() );
        appointmentDTO.id( appointment.getId() );
        appointmentDTO.clientName( appointment.getClientName() );
        appointmentDTO.clientEmail( appointment.getClientEmail() );
        appointmentDTO.scheduledAt( appointment.getScheduledAt() );
        appointmentDTO.durationMinutes( appointment.getDurationMinutes() );
        appointmentDTO.timezone( appointment.getTimezone() );
        appointmentDTO.meetingLink( appointment.getMeetingLink() );
        appointmentDTO.cancelReason( appointment.getCancelReason() );
        appointmentDTO.source( appointment.getSource() );
        appointmentDTO.utmSource( appointment.getUtmSource() );
        appointmentDTO.utmMedium( appointment.getUtmMedium() );
        appointmentDTO.utmCampaign( appointment.getUtmCampaign() );
        appointmentDTO.confirmedAt( appointment.getConfirmedAt() );
        appointmentDTO.createdAt( appointment.getCreatedAt() );
        appointmentDTO.updatedAt( appointment.getUpdatedAt() );

        appointmentDTO.status( appointment.getStatus().name() );
        appointmentDTO.meetingType( appointment.getMeetingType().name() );
        appointmentDTO.includeOtpDetails( false );

        return appointmentDTO.build();
    }

    @Override
    public List<AppointmentDTO> toDTOList(List<Appointment> appointments) {
        if ( appointments == null ) {
            return null;
        }

        List<AppointmentDTO> list = new ArrayList<AppointmentDTO>( appointments.size() );
        for ( Appointment appointment : appointments ) {
            list.add( appointmentToAppointmentDTO( appointment ) );
        }

        return list;
    }

    private UUID appointmentLawyerId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        LawyerProfile lawyer = appointment.getLawyer();
        if ( lawyer == null ) {
            return null;
        }
        UUID id = lawyer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String appointmentLawyerNameVi(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        LawyerProfile lawyer = appointment.getLawyer();
        if ( lawyer == null ) {
            return null;
        }
        String nameVi = lawyer.getNameVi();
        if ( nameVi == null ) {
            return null;
        }
        return nameVi;
    }

    private UUID appointmentServiceId(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        ServiceEntity service = appointment.getService();
        if ( service == null ) {
            return null;
        }
        UUID id = service.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String appointmentServiceSlug(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }
        ServiceEntity service = appointment.getService();
        if ( service == null ) {
            return null;
        }
        String slug = service.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }

    protected AppointmentDTO appointmentToAppointmentDTO(Appointment appointment) {
        if ( appointment == null ) {
            return null;
        }

        AppointmentDTO.AppointmentDTOBuilder appointmentDTO = AppointmentDTO.builder();

        appointmentDTO.id( appointment.getId() );
        appointmentDTO.clientName( appointment.getClientName() );
        appointmentDTO.clientEmail( appointment.getClientEmail() );
        appointmentDTO.clientPhone( appointment.getClientPhone() );
        appointmentDTO.scheduledAt( appointment.getScheduledAt() );
        appointmentDTO.durationMinutes( appointment.getDurationMinutes() );
        appointmentDTO.timezone( appointment.getTimezone() );
        if ( appointment.getStatus() != null ) {
            appointmentDTO.status( appointment.getStatus().name() );
        }
        if ( appointment.getMeetingType() != null ) {
            appointmentDTO.meetingType( appointment.getMeetingType().name() );
        }
        appointmentDTO.meetingLink( appointment.getMeetingLink() );
        appointmentDTO.cancelReason( appointment.getCancelReason() );
        appointmentDTO.source( appointment.getSource() );
        appointmentDTO.utmSource( appointment.getUtmSource() );
        appointmentDTO.utmMedium( appointment.getUtmMedium() );
        appointmentDTO.utmCampaign( appointment.getUtmCampaign() );
        appointmentDTO.confirmedAt( appointment.getConfirmedAt() );
        appointmentDTO.createdAt( appointment.getCreatedAt() );
        appointmentDTO.updatedAt( appointment.getUpdatedAt() );

        return appointmentDTO.build();
    }
}
