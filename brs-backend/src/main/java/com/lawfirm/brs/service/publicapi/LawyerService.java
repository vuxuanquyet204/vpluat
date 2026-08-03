package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LawyerMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing lawyer profiles (public-facing).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LawyerService {

    private final LawyerProfileRepository lawyerRepository;
    private final LawyerMapper lawyerMapper;
    private final ServiceEntityRepository serviceRepository;

    @Cacheable(value = "lawyers", key = "'all'")
    public List<LawyerDTO> getAllLawyers() {
        log.debug("Fetching all lawyers");
        List<LawyerDTO> dtos = lawyerMapper.toDTOList(lawyerRepository.findAll());
        populateServiceNamesBatch(dtos);
        return dtos;
    }

    @Cacheable(value = "lawyers", key = "'featured'")
    public List<LawyerDTO> getFeaturedLawyers() {
        log.debug("Fetching featured lawyers");
        List<LawyerProfile> featured = lawyerRepository.findFeaturedLawyers();
        List<LawyerDTO> dtos = lawyerMapper.toDTOList(featured);
        populateServiceNamesBatch(dtos);
        return dtos;
    }

    public Page<LawyerDTO> getLawyers(Pageable pageable) {
        log.debug("Fetching lawyers with pagination: {}", pageable);
        return lawyerRepository.findAllActiveLawyers(pageable)
            .map(lawyerMapper::toDTO)
            .map(dto -> {
                populateServiceNames(dto);
                return dto;
            });
    }

    public Page<LawyerDTO> getLawyers(Pageable pageable, String serviceId, String serviceSlug) {
        log.debug("Fetching lawyers with pagination: {}, serviceId: {}, serviceSlug: {}", pageable, serviceId, serviceSlug);
        Page<LawyerProfile> lawyersPage;
        UUID resolvedServiceId = null;
        if (serviceId != null && !serviceId.isBlank()) {
            resolvedServiceId = UUID.fromString(serviceId);
        } else if (serviceSlug != null && !serviceSlug.isBlank()) {
            resolvedServiceId = serviceRepository.findBySlug(serviceSlug)
                .filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                .map(ServiceEntity::getId)
                .orElse(null);
        }

        if (resolvedServiceId != null) {
            lawyersPage = lawyerRepository.findByServiceId(resolvedServiceId, pageable);
        } else {
            lawyersPage = lawyerRepository.findAllActiveLawyers(pageable);
        }
        return lawyersPage
            .map(lawyerMapper::toDTO)
            .map(dto -> {
                populateServiceNames(dto);
                return dto;
            });
    }

    @Cacheable(value = "lawyers", key = "#slug")
    public LawyerDTO getLawyerBySlug(String slug) {
        log.debug("Fetching lawyer by slug: {}", slug);
        LawyerProfile lawyer = lawyerRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + slug));
        LawyerDTO dto = lawyerMapper.toDTOWithDetails(lawyer);
        populateServiceNames(dto);
        return dto;
    }

    public LawyerDTO getLawyerById(UUID id) {
        log.debug("Fetching lawyer by id: {}", id);
        LawyerProfile lawyer = lawyerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + id));
        LawyerDTO dto = lawyerMapper.toDTOWithDetails(lawyer);
        populateServiceNames(dto);
        return dto;
    }

    public List<LawyerDTO> searchLawyers(String query) {
        log.debug("Searching lawyers with query: {}", query);
        List<LawyerDTO> dtos = lawyerMapper.toDTOList(
            lawyerRepository.searchByName(query)
        );
        populateServiceNamesBatch(dtos);
        return dtos;
    }

    private void populateServiceNames(LawyerDTO dto) {
        if (dto.getServiceIds() == null || dto.getServiceIds().isEmpty()) {
            dto.setServiceNames(Collections.emptyList());
            dto.setServiceSlugs(Collections.emptyList());
            return;
        }
        List<UUID> ids = dto.getServiceIds();
        Map<UUID, ServiceEntity> byId = new HashMap<>();
        for (ServiceEntity s : serviceRepository.findAllById(ids)) {
            byId.put(s.getId(), s);
        }
        List<String> names = new ArrayList<>(ids.size());
        List<String> slugs = new ArrayList<>(ids.size());
        for (UUID id : ids) {
            ServiceEntity s = byId.get(id);
            if (s == null) {
                names.add(null);
                slugs.add(null);
                continue;
            }
            names.add(s.getName() != null && !s.getName().isBlank() ? s.getName() : s.getSlug());
            slugs.add(s.getSlug());
        }
        dto.setServiceNames(names);
        dto.setServiceSlugs(slugs);
    }

    private void populateServiceNamesBatch(List<LawyerDTO> dtos) {
        if (dtos.isEmpty()) return;
        Set<UUID> allIds = dtos.stream()
                .flatMap(d -> d.getServiceIds() == null ? java.util.stream.Stream.empty() : d.getServiceIds().stream())
                .collect(Collectors.toSet());
        if (allIds.isEmpty()) {
            dtos.forEach(d -> {
                d.setServiceNames(Collections.emptyList());
                d.setServiceSlugs(Collections.emptyList());
            });
            return;
        }
        Map<UUID, ServiceEntity> byId = new HashMap<>();
        for (ServiceEntity s : serviceRepository.findAllById(allIds)) {
            byId.put(s.getId(), s);
        }
        for (LawyerDTO dto : dtos) {
            if (dto.getServiceIds() == null || dto.getServiceIds().isEmpty()) {
                dto.setServiceNames(Collections.emptyList());
                dto.setServiceSlugs(Collections.emptyList());
                continue;
            }
            List<String> names = new ArrayList<>(dto.getServiceIds().size());
            List<String> slugs = new ArrayList<>(dto.getServiceIds().size());
            for (UUID id : dto.getServiceIds()) {
                ServiceEntity s = byId.get(id);
                if (s == null) {
                    names.add(null);
                    slugs.add(null);
                    continue;
                }
                names.add(s.getName() != null && !s.getName().isBlank() ? s.getName() : s.getSlug());
                slugs.add(s.getSlug());
            }
            dto.setServiceNames(names);
            dto.setServiceSlugs(slugs);
        }
    }
}
