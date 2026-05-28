package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.ServiceEntityMapper;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing legal services (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ServiceEntityService {

    private final ServiceEntityRepository serviceRepository;
    private final ServiceEntityMapper serviceMapper;

    @Cacheable(value = "services", key = "'all-active'")
    public List<ServiceDTO> getActiveServices() {
        log.debug("Fetching all active services");
        return serviceMapper.toDTOList(serviceRepository.findByIsActiveTrueAndDeletedAtIsNull());
    }

    @Cacheable(value = "services", key = "'featured'")
    public List<ServiceDTO> getFeaturedServices() {
        log.debug("Fetching featured services");
        return serviceMapper.toDTOList(serviceRepository.findByIsFeaturedTrueAndIsActiveTrueAndDeletedAtIsNull());
    }

    @Cacheable(value = "services", key = "#slug")
    public ServiceDTO getServiceBySlug(String slug) {
        log.debug("Fetching service by slug: {}", slug);
        ServiceEntity service = serviceRepository.findBySlugAndDeletedAtIsNull(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + slug));
        return serviceMapper.toDTOWithDetails(service);
    }

    public ServiceDTO getServiceById(UUID id) {
        log.debug("Fetching service by id: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return serviceMapper.toDTOWithDetails(service);
    }

    public List<ServiceDTO> getServicesByParent(UUID parentId) {
        log.debug("Fetching services by parent id: {}", parentId);
        return serviceMapper.toDTOList(serviceRepository.findByParentIdAndDeletedAtIsNull(parentId));
    }
}
