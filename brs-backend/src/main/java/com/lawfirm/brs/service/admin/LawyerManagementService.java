package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.LawyerRequest;
import com.lawfirm.brs.dto.response.LawyerDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.mapper.LawyerMapper;
import com.lawfirm.brs.repository.jpa.LawyerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing lawyer profiles.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LawyerManagementService {

    private final LawyerProfileRepository lawyerRepository;
    private final LawyerMapper lawyerMapper;

    public LawyerDTO createLawyer(LawyerRequest request) {
        log.debug("Creating lawyer: {}", request.slug());
        LawyerProfile lawyer = LawyerProfile.builder()
                .slug(request.slug())
                .nameVi(request.nameVi())
                .nameEn(request.nameEn())
                .bioVi(request.bioVi())
                .bioEn(request.bioEn())
                .positionVi(request.positionVi())
                .positionEn(request.positionEn())
                .experienceYears(request.experienceYears())
                .barNumber(request.barNumber())
                .languages(request.languages())
                .avatarUrl(request.avatarUrl())
                .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
                .workingHours(request.workingHours())
                .build();
        
        return lawyerMapper.toDTO(lawyerRepository.save(lawyer));
    }

    public LawyerDTO updateLawyer(UUID id, LawyerRequest request) {
        log.debug("Updating lawyer: {}", id);
        LawyerProfile lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));
        
        lawyer.setSlug(request.slug());
        lawyer.setNameVi(request.nameVi());
        lawyer.setNameEn(request.nameEn());
        lawyer.setBioVi(request.bioVi());
        lawyer.setBioEn(request.bioEn());
        lawyer.setPositionVi(request.positionVi());
        lawyer.setPositionEn(request.positionEn());
        lawyer.setExperienceYears(request.experienceYears());
        lawyer.setBarNumber(request.barNumber());
        lawyer.setLanguages(request.languages());
        lawyer.setAvatarUrl(request.avatarUrl());
        if (request.isFeatured() != null) {
            lawyer.setIsFeatured(request.isFeatured());
        }
        lawyer.setWorkingHours(request.workingHours());
        
        return lawyerMapper.toDTO(lawyerRepository.save(lawyer));
    }

    @Transactional(readOnly = true)
    public LawyerDTO getLawyerById(UUID id) {
        log.debug("Fetching lawyer by id: {}", id);
        LawyerProfile lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));
        return lawyerMapper.toDTO(lawyer);
    }

    @Transactional(readOnly = true)
    public List<LawyerDTO> getAllLawyers() {
        log.debug("Fetching all lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<LawyerDTO> getFeaturedLawyers() {
        log.debug("Fetching featured lawyers");
        return lawyerMapper.toDTOList(lawyerRepository.findByIsFeaturedTrue());
    }

    public LawyerDTO toggleFeature(UUID id) {
        log.debug("Toggling lawyer feature: {}", id);
        LawyerProfile lawyer = lawyerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lawyer not found: " + id));
        
        lawyer.setIsFeatured(!Boolean.TRUE.equals(lawyer.getIsFeatured()));
        return lawyerMapper.toDTO(lawyerRepository.save(lawyer));
    }

    public void deleteLawyer(UUID id) {
        log.debug("Deleting lawyer: {}", id);
        lawyerRepository.deleteById(id);
    }
}
