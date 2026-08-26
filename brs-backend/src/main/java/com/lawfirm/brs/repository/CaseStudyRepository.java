package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.CaseStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CaseStudyRepository extends JpaRepository<CaseStudy, UUID> {

    Optional<CaseStudy> findBySlugAndDeletedAtIsNull(String slug);

    List<CaseStudy> findAllByDeletedAtIsNullOrderByUpdatedAtDesc();

    List<CaseStudy> findAllByPublishedTrueAndDeletedAtIsNullOrderByUpdatedAtDesc();

    @Query("select distinct cs from CaseStudy cs join cs.services s "
        + "where s.id = :serviceId and cs.deletedAt is null "
        + "and (:publishedOnly = false or cs.published = true) "
        + "order by cs.updatedAt desc")
    List<CaseStudy> findByServiceId(
        @Param("serviceId") UUID serviceId,
        @Param("publishedOnly") boolean publishedOnly
    );
}
