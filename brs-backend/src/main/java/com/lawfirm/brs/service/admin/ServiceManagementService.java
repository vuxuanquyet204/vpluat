package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.ServiceRequest;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.ServiceEntityMapper;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for managing services (admin).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceManagementService {

    private final ServiceEntityRepository serviceRepository;
    private final ServiceEntityMapper serviceMapper;

    @Transactional(readOnly = true)
    public PageResponse<ServiceDTO> getAllServices(int page, int size) {
        log.debug("Fetching all services: page={}, size={}", page, size);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<ServiceEntity> servicePage = serviceRepository.findAll(pageRequest);

        return PageResponse.<ServiceDTO>builder()
                .content(serviceMapper.toDTOList(servicePage.getContent()))
                .page(servicePage.getNumber())
                .size(servicePage.getSize())
                .totalElements(servicePage.getTotalElements())
                .totalPages(servicePage.getTotalPages())
                .first(servicePage.isFirst())
                .last(servicePage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ServiceDTO getServiceById(UUID id) {
        log.debug("Fetching service by id: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        return serviceMapper.toDTOWithDetails(service);
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceDTO createService(ServiceRequest request) {
        log.debug("Creating service: {}", request.slug());

        if (serviceRepository.findBySlug(request.slug()).isPresent()) {
            throw new RuntimeException("Service with slug already exists: " + request.slug());
        }

        ServiceEntity service = ServiceEntity.builder()
                .slug(request.slug())
                .name(request.titleVi() != null ? request.titleVi() : request.slug())
                .icon(request.icon())
                .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
                .isActive(request.isActive() != null ? request.isActive() : true)
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();

        if (request.parentId() != null && !request.parentId().isBlank()) {
            UUID parentId = UUID.fromString(request.parentId());
            ServiceEntity parent = serviceRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent service not found: " + parentId));
            service.setParent(parent);
        }

        ServiceEntity saved = serviceRepository.save(service);
        log.info("Created service: {}", saved.getId());
        return serviceMapper.toDTO(saved);
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceDTO updateService(UUID id, ServiceRequest request) {
        log.debug("Updating service: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        if (request.slug() != null && !request.slug().equals(service.getSlug())) {
            if (serviceRepository.findBySlug(request.slug()).isPresent()) {
                throw new RuntimeException("Service with slug already exists: " + request.slug());
            }
            service.setSlug(request.slug());
        }

        if (request.titleVi() != null) {
            service.setName(request.titleVi());
        }

        if (request.icon() != null) {
            service.setIcon(request.icon());
        }

        if (request.displayOrder() != null) {
            service.setDisplayOrder(request.displayOrder());
        }

        if (request.isFeatured() != null) {
            service.setIsFeatured(request.isFeatured());
        }

        if (request.isActive() != null) {
            service.setIsActive(request.isActive());
        }

        if (request.parentId() != null) {
            if (request.parentId().isBlank()) {
                service.setParent(null);
            } else {
                UUID parentId = UUID.fromString(request.parentId());
                if (parentId.equals(id)) {
                    throw new RuntimeException("Service cannot be its own parent");
                }
                ServiceEntity parent = serviceRepository.findById(parentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Parent service not found: " + parentId));
                service.setParent(parent);
            }
        }

        ServiceEntity saved = serviceRepository.save(service);
        log.info("Updated service: {}", saved.getId());
        return serviceMapper.toDTO(saved);
    }

    @CacheEvict(value = "services", allEntries = true)
    public void deleteService(UUID id) {
        log.debug("Soft deleting service: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        service.softDelete();
        serviceRepository.save(service);
        log.info("Soft deleted service: {}", id);
    }
}
