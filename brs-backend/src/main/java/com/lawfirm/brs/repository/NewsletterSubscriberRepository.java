package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.NewsletterSubscriber;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Newsletter subscriber repository.
 */
@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, java.util.UUID> {

    Optional<NewsletterSubscriber> findByEmail(String email);

    Optional<NewsletterSubscriber> findByVerificationToken(String token);

    Page<NewsletterSubscriber> findByStatus(String status, Pageable pageable);

    @Query("SELECT COUNT(s) FROM NewsletterSubscriber s WHERE s.status = 'ACTIVE'")
    long countByStatus(String status);
}
