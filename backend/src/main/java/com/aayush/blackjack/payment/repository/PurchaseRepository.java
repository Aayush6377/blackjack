package com.aayush.blackjack.payment.repository;

import com.aayush.blackjack.payment.entity.Purchase;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Purchase p WHERE p.id = :id")
    Optional<Purchase> findByIdForUpdate(@Param("id") UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Purchase p SET p.plan = null WHERE p.plan.id = :planId")
    int detachPlanFromPurchases(@Param("planId") UUID planId);

    Page<Purchase> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUser_Id(UUID userId);

    @Query("""
        SELECT COALESCE(SUM(p.amountInPaise), 0)
        FROM Purchase p
        WHERE p.user.id = :userId
          AND p.status = com.aayush.blackjack.payment.enums.PurchaseStatus.SUCCESS
        """)
    long sumSuccessfulAmountInPaiseByUserId(@Param("userId") UUID userId);
}
