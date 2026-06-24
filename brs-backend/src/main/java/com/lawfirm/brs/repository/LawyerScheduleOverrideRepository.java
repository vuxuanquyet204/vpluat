package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LawyerScheduleOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LawyerScheduleOverrideRepository extends JpaRepository<LawyerScheduleOverride, UUID> {

    List<LawyerScheduleOverride> findByLawyerIdAndOverrideDateBetweenOrderByOverrideDateAsc(
        UUID lawyerId, LocalDate from, LocalDate to);

    Optional<LawyerScheduleOverride> findByLawyerIdAndOverrideDate(UUID lawyerId, LocalDate date);

    void deleteByLawyerIdAndOverrideDate(UUID lawyerId, LocalDate date);
}
