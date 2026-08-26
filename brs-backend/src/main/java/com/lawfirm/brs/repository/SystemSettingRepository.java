package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.SettingsNamespace;
import com.lawfirm.brs.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, UUID> {
    Optional<SystemSetting> findByNamespace(SettingsNamespace namespace);
}
