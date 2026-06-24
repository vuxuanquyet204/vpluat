package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Lawyer profile repository.
 */
@Repository
public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, UUID> {

    Optional<LawyerProfile> findBySlug(String slug);

    List<LawyerProfile> findByIsFeaturedTrue();

    @Query("SELECT l FROM LawyerProfile l WHERE l.isFeatured = true ORDER BY l.nameVi")
    List<LawyerProfile> findFeaturedLawyers();

    @Query("SELECT l FROM LawyerProfile l WHERE LOWER(l.nameVi) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.nameEn) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<LawyerProfile> searchByName(@Param("query") String query);

    @Query("SELECT l FROM LawyerProfile l WHERE LOWER(l.nameVi) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<LawyerProfile> findByDisplayNameContaining(@Param("name") String name);
}
