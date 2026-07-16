package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.isActive = true")
    Optional<User> findActiveByEmail(String email);

    Optional<User> findByFullNameIgnoreCase(String fullName);

    List<User> findByIsActiveTrue();

    List<User> findByRole(com.lawfirm.brs.constants.Roles role);

    Page<User> findByRole(com.lawfirm.brs.constants.Roles role, Pageable pageable);

    Page<User> findByRoleAndIsActive(com.lawfirm.brs.constants.Roles role, Boolean isActive, Pageable pageable);
}
