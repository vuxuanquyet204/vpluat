package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.ServiceRequest;
import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.entity.ServiceLawyer;
import com.lawfirm.brs.mapper.ServiceEntityMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.repository.ServiceLawyerRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the service-management mutation paths.
 * Verifies the {@code lawyerIds} payload is correctly persisted via the
 * {@code service_lawyers} join table and round-tripped on the response DTO.
 */
@ExtendWith(MockitoExtension.class)
class ServiceManagementServiceTest {

    @Mock private ServiceEntityRepository serviceRepository;
    @Mock private ServiceEntityMapper serviceMapper;
    @Mock private ServiceLawyerRepository serviceLawyerRepository;
    @Mock private LawyerProfileRepository lawyerRepository;
    @Mock private EntityManager entityManager;

    @InjectMocks private ServiceManagementService service;

    private UUID serviceId;
    private UUID lawyerA;
    private UUID lawyerB;
    private UUID lawyerC;

    @BeforeEach
    void setUp() {
        serviceId = UUID.randomUUID();
        lawyerA = UUID.randomUUID();
        lawyerB = UUID.randomUUID();
        lawyerC = UUID.randomUUID();

        // ServiceManagementService injects EntityManager via @PersistenceContext,
        // which Mockito can't wire through @InjectMocks — poke the mock in.
        ReflectionTestUtils.setField(service, "entityManager", entityManager);
    }

    private ServiceRequest request(List<UUID> lawyerIds) {
        return new ServiceRequest(
                "tu-van-doanh-nghiep",
                "Tư vấn doanh nghiệp",
                null,
                null,
                0,
                false,
                true,
                lawyerIds,
                "Mô tả dịch vụ",
                null,
                null,
                "Doanh nghiệp"
        );
    }

    private ServiceEntity savedEntity() {
        return ServiceEntity.builder()
                .id(serviceId)
                .slug("tu-van-doanh-nghiep")
                .name("Tư vấn doanh nghiệp")
                .build();
    }

    private ServiceDTO mappedDto() {
        return ServiceDTO.builder()
                .id(serviceId)
                .slug("tu-van-doanh-nghiep")
                .name("Tư vấn doanh nghiệp")
                .build();
    }

    private LawyerProfile lawyer(UUID id) {
        return LawyerProfile.builder()
                .id(id)
                .serviceIds(new ArrayList<>())
                .build();
    }

    private void stubLawyers(UUID... ids) {
        List<LawyerProfile> lawyers = java.util.Arrays.stream(ids)
                .map(this::lawyer)
                .toList();
        when(lawyerRepository.findAllById(any())).thenReturn(lawyers);
        for (UUID id : ids) {
            when(lawyerRepository.findById(id)).thenReturn(Optional.of(lawyer(id)));
        }
    }

    @Test
    @DisplayName("createService persists lawyerIds via the join table")
    void createService_persistsLawyerIds() {
        when(serviceRepository.findBySlug("tu-van-doanh-nghiep")).thenReturn(Optional.empty());
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceLawyerRepository.findLawyerIdsByServiceId(serviceId))
                .thenReturn(List.of(lawyerA, lawyerB));
        when(serviceMapper.toDTO(any(ServiceEntity.class))).thenReturn(mappedDto());
        stubLawyers(lawyerA, lawyerB);

        ServiceRequest req = request(List.of(lawyerA, lawyerB));
        ServiceDTO result = service.createService(req);

        assertThat(result.getLawyerIds()).containsExactlyInAnyOrder(lawyerA, lawyerB);
        verify(serviceLawyerRepository).deleteByServiceId(serviceId);
        ArgumentCaptor<ServiceLawyer> captor = ArgumentCaptor.forClass(ServiceLawyer.class);
        verify(serviceLawyerRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(row -> row.getId().getLawyerId())
                .containsExactly(lawyerA, lawyerB);
        verify(entityManager).flush();
    }

    @Test
    @DisplayName("updateService replaces prior assignments when lawyerIds is non-null")
    void updateService_replacesAssignments() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        when(serviceLawyerRepository.findLawyerIdsByServiceId(serviceId))
                .thenReturn(List.of(lawyerC));
        when(serviceMapper.toDTO(any(ServiceEntity.class))).thenReturn(mappedDto());
        stubLawyers(lawyerC);

        ServiceRequest req = request(List.of(lawyerC));
        ServiceDTO result = service.updateService(serviceId, req);

        assertThat(result.getLawyerIds()).containsExactly(lawyerC);
        verify(serviceLawyerRepository).deleteByServiceId(serviceId);
        verify(serviceLawyerRepository, times(1)).save(any(ServiceLawyer.class));
    }

    @Test
    @DisplayName("updateService leaves existing assignments untouched when lawyerIds is null")
    void updateService_keepsExistingWhenNull() {
        // Pre-existing DB rows for this service that the join table would return.
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        when(serviceLawyerRepository.findLawyerIdsByServiceId(serviceId))
                .thenReturn(List.of(lawyerA, lawyerB));
        when(serviceMapper.toDTO(any(ServiceEntity.class))).thenReturn(mappedDto());

        ServiceRequest req = request(null);
        ServiceDTO result = service.updateService(serviceId, req);

        // The DB rows are not modified — but the response reflects the
        // post-update state so the client knows what's currently assigned.
        verify(serviceLawyerRepository, never()).deleteByServiceId(any(UUID.class));
        verify(serviceLawyerRepository, never()).save(any(ServiceLawyer.class));
        assertThat(result.getLawyerIds()).containsExactlyInAnyOrder(lawyerA, lawyerB);
    }

    @Test
    @DisplayName("updateService clears all assignments when an explicit empty list is sent")
    void updateService_clearsAllWhenEmptyList() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        when(serviceLawyerRepository.findLawyerIdsByServiceId(serviceId))
                .thenReturn(new ArrayList<>());
        when(serviceMapper.toDTO(any(ServiceEntity.class))).thenReturn(mappedDto());

        ServiceRequest req = request(List.of());
        ServiceDTO result = service.updateService(serviceId, req);

        verify(serviceLawyerRepository).deleteByServiceId(serviceId);
        verify(serviceLawyerRepository, never()).save(any(ServiceLawyer.class));
        assertThat(result.getLawyerIds()).isEmpty();
    }

    @Test
    @DisplayName("updateService deduplicates incoming lawyerIds before saving")
    void updateService_deduplicates() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        when(serviceLawyerRepository.findLawyerIdsByServiceId(serviceId))
                .thenReturn(List.of(lawyerA));
        when(serviceMapper.toDTO(any(ServiceEntity.class))).thenReturn(mappedDto());
        stubLawyers(lawyerA, lawyerB);

        ServiceRequest req = request(List.of(lawyerA, lawyerA, lawyerB, lawyerB));
        service.updateService(serviceId, req);

        // Only two distinct rows should be written even though the input had four entries.
        verify(serviceLawyerRepository, times(2)).save(any(ServiceLawyer.class));
    }

    @Test
    @DisplayName("updateService rejects duplicate-slug update before touching assignments")
    void updateService_rejectsDuplicateSlug() {
        ServiceEntity existing = savedEntity();
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(existing));
        when(serviceRepository.findBySlug("bi-trung-slug"))
                .thenReturn(Optional.of(ServiceEntity.builder().id(UUID.randomUUID()).build()));

        ServiceRequest req = new ServiceRequest(
                "bi-trung-slug",
                "Tên khác",
                null,
                null, 0, false, true,
                List.of(lawyerA),
                null, null, null, null
        );

        assertThatThrownBy(() -> service.updateService(serviceId, req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
        verify(serviceLawyerRepository, never()).save(any());
        verify(serviceLawyerRepository, never()).deleteByServiceId(any(UUID.class));
    }

    @Test
    @DisplayName("deleteService also clears lawyer assignments so soft-deletes don't leak")
    void deleteService_clearsLawyerAssignments() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());

        service.deleteService(serviceId);

        verify(serviceLawyerRepository).deleteByServiceId(serviceId);
    }

    @Test
    @DisplayName("replaceServiceLawyers surfaces a clear error when the FK is violated")
    @SuppressWarnings("DataFlowIssue")
    void replaceServiceLawlers_invalidLawyerIds() {
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(savedEntity()));
        when(serviceRepository.save(any(ServiceEntity.class))).thenReturn(savedEntity());
        org.mockito.Mockito.doThrow(new org.springframework.dao.DataIntegrityViolationException("fk"))
                .when(serviceLawyerRepository).deleteByServiceId(serviceId);

        // Build a request whose payload triggers the FK violation
        ServiceRequest req = request(List.of(UUID.randomUUID()));

        assertThatThrownBy(() -> service.updateService(serviceId, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("lawyerId");
    }
}
