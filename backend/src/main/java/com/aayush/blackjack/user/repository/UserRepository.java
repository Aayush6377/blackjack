package com.aayush.blackjack.user.repository;

import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    @Query("""
        SELECT u FROM User u
        WHERE u.role = :role
          AND u.deleted = false
          AND (
            :search = ''
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
          )
        """)
    Page<User> searchUsersByRole(
            @Param("role") Role role,
            @Param("search") String search,
            Pageable pageable
    );

    Optional<User> findByIdAndDeleted(UUID userId, boolean deleted);
}
