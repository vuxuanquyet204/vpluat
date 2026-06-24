package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.ReportCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportCacheRepository extends JpaRepository<ReportCache, UUID> {

    @Query("""
        SELECT r FROM ReportCache r
        WHERE r.reportType = :type
          AND r.params = CAST(:paramsJson AS string)
          AND r.expiresAt > :now
        ORDER BY r.generatedAt DESC
        LIMIT 1
        """)
    Optional<ReportCache> findFresh(@Param("type") String type,
                                    @Param("paramsJson") String paramsJson,
                                    @Param("now") Instant now);

    @Modifying
    @Query("DELETE FROM ReportCache r WHERE r.expiresAt < :now")
    int deleteExpired(@Param("now") Instant now);
}
