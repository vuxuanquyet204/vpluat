package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.PostRevision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRevisionRepository extends JpaRepository<PostRevision, UUID> {

    Page<PostRevision> findByPostIdOrderByRevisionNumberDesc(UUID postId, Pageable pageable);

    List<PostRevision> findByPostIdOrderByRevisionNumberDesc(UUID postId);

    Optional<PostRevision> findFirstByPostIdOrderByRevisionNumberDesc(UUID postId);

    long countByPostId(UUID postId);
}
