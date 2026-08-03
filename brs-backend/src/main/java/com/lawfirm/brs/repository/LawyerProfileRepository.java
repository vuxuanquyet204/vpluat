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

    List<LawyerProfile> findByIsActiveTrue();

    Optional<LawyerProfile> findByUser_Id(java.util.UUID userId);

    boolean existsBySlug(String slug);

    @Query("SELECT l FROM LawyerProfile l WHERE l.isActive = true ORDER BY l.nameVi")
    List<LawyerProfile> findFeaturedLawyers();

    @Query("SELECT l FROM LawyerProfile l JOIN l.user u WHERE (LOWER(l.nameVi) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.nameEn) LIKE LOWER(CONCAT('%', :query, '%'))) AND u.isActive = true")
    List<LawyerProfile> searchByName(@Param("query") String query);

    @Query("SELECT l FROM LawyerProfile l WHERE LOWER(l.nameVi) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<LawyerProfile> findByDisplayNameContaining(@Param("name") String name);

    @Query("SELECT l FROM LawyerProfile l LEFT JOIN FETCH l.user WHERE l.id = :id")
    Optional<LawyerProfile> findByIdWithUser(@Param("id") UUID id);

    @Query("SELECT l FROM LawyerProfile l LEFT JOIN FETCH l.user")
    List<LawyerProfile> findAllWithUser();

    @Query(value = "SELECT l.* FROM lawyer_profiles l JOIN users u ON u.id = l.user_id WHERE u.is_active = true AND l.service_ids @> to_jsonb(ARRAY[:serviceId])", nativeQuery = true)
    org.springframework.data.domain.Page<LawyerProfile> findByServiceId(@Param("serviceId") java.util.UUID serviceId, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT l.* FROM lawyer_profiles l JOIN users u ON u.id = l.user_id WHERE u.is_active = true", nativeQuery = true, countQuery = "SELECT count(*) FROM lawyer_profiles l JOIN users u ON u.id = l.user_id WHERE u.is_active = true")
    org.springframework.data.domain.Page<LawyerProfile> findAllActiveLawyers(org.springframework.data.domain.Pageable pageable);
}
