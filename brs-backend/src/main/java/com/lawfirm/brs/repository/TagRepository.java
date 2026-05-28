package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Tag repository.
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {

    Optional<Tag> findBySlug(String slug);
}
