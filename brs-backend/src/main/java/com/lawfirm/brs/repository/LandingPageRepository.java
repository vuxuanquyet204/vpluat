package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandingPageRepository extends JpaRepository<LandingPage, UUID> {

    Optional<LandingPage> findBySlug(String slug);

    List<LandingPage> findByIsPublishedTrueOrderByUpdatedAtDesc();
}
