package com.lawfirm.brs.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Newsletter subscriber entity.
 */
@Entity
@Table(name = "newsletter_subscribers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "name")
    private String name;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "unsubscribed_at")
    private Instant unsubscribedAt;

    @Column(name = "source")
    @Builder.Default
    private String source = "WEBSITE";

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    /**
     * Verify subscriber
     */
    public void verify() {
        this.status = "VERIFIED";
        this.verifiedAt = Instant.now();
        this.verificationToken = null;
    }

    /**
     * Unsubscribe
     */
    public void unsubscribe() {
        this.status = "UNSUBSCRIBED";
        this.unsubscribedAt = Instant.now();
    }

    /**
     * Check if subscriber is active
     */
    public boolean isActive() {
        return "VERIFIED".equals(status);
    }
}
