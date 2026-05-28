package com.lawfirm.brs.repository.jpa;

import com.lawfirm.brs.entity.Post;
import com.lawfirm.brs.constants.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Post repository.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlug(String slug);

    Optional<Post> findBySlugAndDeletedAtIsNull(String slug);

    Page<Post> findByStatusAndLanguage(PostStatus status, String language, Pageable pageable);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    List<Post> findByIsFeaturedTrueAndStatus(PostStatus status);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.language = :language ORDER BY p.publishedAt DESC")
    List<Post> findLatestPublished(String language, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.isFeatured = true AND p.language = :language")
    List<Post> findFeaturedPublished(String language);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY p.publishedAt DESC")
    Page<Post> findPublishedPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.isFeatured = true")
    List<Post> findFeaturedPublishedPosts();

    @Query("SELECT p FROM Post p WHERE p.category.id = :categoryId AND p.deletedAt IS NULL")
    Page<Post> findByCategoryIdAndDeletedAtIsNull(UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.postTags pt JOIN pt.tag t WHERE t.slug = :tagSlug AND p.deletedAt IS NULL")
    Page<Post> findByTagSlugAndDeletedAtIsNull(String tagSlug, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.category.id = :categoryId AND p.status = 'PUBLISHED' AND p.id != :postId ORDER BY p.publishedAt DESC")
    List<Post> findRelatedPosts(UUID postId, UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.id != :postId ORDER BY p.publishedAt DESC")
    List<Post> findRelatedPosts(UUID postId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND (LOWER(p.slug) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPosts(String query, String language, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND (LOWER(p.slug) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Post> searchByQuery(String query);

    long countByStatus(PostStatus status);
}
