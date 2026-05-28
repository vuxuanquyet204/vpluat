package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.ServiceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service entity repository.
 */
@Repository
public interface ServiceEntityRepository extends JpaRepository<ServiceEntity, UUID> {

    Optional<ServiceEntity> findBySlug(String slug);

    Optional<ServiceEntity> findBySlugAndDeletedAtIsNull(String slug);

    @Query("SELECT s FROM ServiceEntity s WHERE s.isActive = true AND s.deletedAt IS NULL ORDER BY s.displayOrder")
    List<ServiceEntity> findByIsActiveTrueAndDeletedAtIsNull();

    @Query("SELECT s FROM ServiceEntity s WHERE s.isFeatured = true AND s.isActive = true AND s.deletedAt IS NULL")
    List<ServiceEntity> findByIsFeaturedTrueAndIsActiveTrueAndDeletedAtIsNull();

    @Query("SELECT s FROM ServiceEntity s WHERE s.isFeatured = true AND s.isActive = true AND s.deletedAt IS NULL")
    List<ServiceEntity> findFeatured();

    @Query("SELECT s FROM ServiceEntity s WHERE s.parent.id = :parentId AND s.deletedAt IS NULL")
    List<ServiceEntity> findByParentIdAndDeletedAtIsNull(@Param("parentId") UUID parentId);

    @Query("SELECT s FROM ServiceEntity s WHERE s.isActive = true AND s.deletedAt IS NULL AND (LOWER(s.slug) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ServiceEntity> searchServices(@Param("query") String query, Pageable pageable);

    @Query("SELECT s FROM ServiceEntity s WHERE s.isActive = true AND s.deletedAt IS NULL AND (LOWER(s.slug) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ServiceEntity> searchByQuery(@Param("query") String query);
}
