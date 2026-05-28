package com.lawfirm.brs.mapper;

import com.lawfirm.brs.dto.response.AppointmentDTO;
import com.lawfirm.brs.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {LawyerMapper.class, ServiceEntityMapper.class})
public interface AppointmentMapper {

    @Named("appointmentToDTO")
    @Mapping(target = "lawyerId", source = "lawyer.id")
    @Mapping(target = "lawyerName", source = "lawyer.nameVi")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.slug")
    @Mapping(target = "status", expression = "java(appointment.getStatus().name())")
    @Mapping(target = "meetingType", expression = "java(appointment.getMeetingType().name())")
    @Mapping(target = "clientPhone", source = "clientPhone")
    AppointmentDTO toDTO(Appointment appointment);

    @Named("appointmentToDTOWithDetails")
    @Mapping(target = "lawyerId", source = "lawyer.id")
    @Mapping(target = "lawyerName", source = "lawyer.nameVi")
    @Mapping(target = "serviceId", source = "service.id")
    @Mapping(target = "serviceName", source = "service.slug")
    @Mapping(target = "status", expression = "java(appointment.getStatus().name())")
    @Mapping(target = "meetingType", expression = "java(appointment.getMeetingType().name())")
    @Mapping(target = "clientPhone", source = "clientPhone")
    @Mapping(target = "includeOtpDetails", constant = "false")
    AppointmentDTO toDTOWithDetails(Appointment appointment);

    List<AppointmentDTO> toDTOList(List<Appointment> appointments);
}
