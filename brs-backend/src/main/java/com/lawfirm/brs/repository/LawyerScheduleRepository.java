package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LawyerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LawyerScheduleRepository extends JpaRepository<LawyerSchedule, UUID> {

    List<LawyerSchedule> findByLawyerIdOrderByDayOfWeekAsc(UUID lawyerId);

    Optional<LawyerSchedule> findByLawyerIdAndDayOfWeek(UUID lawyerId, Integer dayOfWeek);

    void deleteByLawyerId(UUID lawyerId);
}
