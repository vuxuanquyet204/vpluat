package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.SeedRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeedRunRepository extends JpaRepository<SeedRun, String> {
}
