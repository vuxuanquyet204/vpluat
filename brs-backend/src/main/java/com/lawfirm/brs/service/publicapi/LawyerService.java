package com.lawfirm.brs.service.publicapi;

import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.LawyerMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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

    @Cacheable(value = "lawyers", key = "'all'")
    public List<LawyerDTO> getAllLawyers() {
        log.debug("Fetching all lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findAll());
    }

    @Cacheable(value = "lawyers", key = "'featured'")
    public List<LawyerDTO> getFeaturedLawyers() {
        log.debug("Fetching featured lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findByIsFeaturedTrue());
    }

    public Page<LawyerDTO> getLawyers(Pageable pageable) {
        log.debug("Fetching lawyers with pagination: {}", pageable);
        return lawyerRepository.findAll(pageable)
            .map(lawyerMapper::toDTO);
    }

    @Cacheable(value = "lawyers", key = "#slug")
    public LawyerDTO getLawyerBySlug(String slug) {
        log.debug("Fetching lawyer by slug: {}", slug);
        LawyerProfile lawyer = lawyerRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + slug));
        return lawyerMapper.toDTOWithDetails(lawyer);
    }

    public LawyerDTO getLawyerById(UUID id) {
        log.debug("Fetching lawyer by id: {}", id);
        LawyerProfile lawyer = lawyerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found: " + id));
        return lawyerMapper.toDTOWithDetails(lawyer);
    }

    public List<LawyerDTO> searchLawyers(String query) {
        log.debug("Searching lawyers with query: {}", query);
        return lawyerMapper.toDTOList(
            lawyerRepository.searchByName(query)
        );
    }
}
