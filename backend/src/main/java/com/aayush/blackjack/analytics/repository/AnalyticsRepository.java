package com.aayush.blackjack.analytics.repository;

import com.aayush.blackjack.payment.enums.PurchaseStatus;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<User, UUID> {

    @Query("SELECT COUNT(u) FROM User u WHERE u.deleted = false AND u.role <> :excludedRole")
    long countExcludeUsers(@Param("excludedRole") Role excludedRole);

    @Query("SELECT u.createdAt FROM User u WHERE u.deleted = false AND u.role <> :excludedRole AND u.createdAt >= :since ORDER BY u.createdAt ASC")
    List<Instant> findNonAdminUserSignupTimestampsSince(@Param("excludedRole") Role excludedRole, @Param("since") Instant since);

    @Query("SELECT COUNT(r) FROM GameRoom r WHERE r.active = true")
    long countActiveRooms();

    @Query("SELECT COUNT(p) FROM ChipPlan p WHERE p.active = true")
    long countActivePlans();

    @Query("""
            SELECT COALESCE(SUM(p.amountInPaise), 0)
            FROM Purchase p
            WHERE p.status = :status
            """)
    Long sumTotalRevenue(@Param("status") PurchaseStatus status);

    @Query("""
            SELECT COUNT(p)
            FROM Purchase p
            WHERE p.status = :status
            """)
    long countCompletedPurchases(@Param("status") PurchaseStatus status);

    @Query("""
            SELECT p.createdAt, p.amountInPaise
            FROM Purchase p
            WHERE p.status = :status
              AND p.createdAt >= :since
            ORDER BY p.createdAt ASC
            """)
    List<Object[]> findPurchaseTimestampsAndAmountsSince(@Param("status") PurchaseStatus status, @Param("since") Instant since);

    @Query("""
            SELECT r.id, r.name, COUNT(gr.id)
            FROM GameRoom r
            LEFT JOIN GameRound gr ON gr.room.id = r.id
            WHERE r.active = true
            GROUP BY r.id, r.name
            ORDER BY COUNT(gr.id) DESC, r.name ASC
            """)
    List<Object[]> findActiveRoomPopularity();

    @Query("""
            SELECT pl.id, pl.name, COUNT(pu.id), COALESCE(SUM(pu.amountInPaise), 0)
            FROM ChipPlan pl
            LEFT JOIN Purchase pu ON pu.plan.id = pl.id
                AND pu.status = :status
            WHERE pl.active = true
            GROUP BY pl.id, pl.name
            ORDER BY COUNT(pu.id) DESC, COALESCE(SUM(pu.amountInPaise), 0) DESC, pl.name ASC
            """)
    List<Object[]> findActivePlanPopularity(@Param("status") PurchaseStatus status);
}