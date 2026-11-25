package com.aayush.blackjack.coupon.repository;

import com.aayush.blackjack.coupon.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {

    long countByCoupon_IdAndUser_Id(UUID couponId, UUID userId);

    List<CouponRedemption> findAllByUser_IdOrderByRedeemedAtDesc(UUID userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE CouponRedemption r SET r.coupon = null WHERE r.coupon.id = :couponId")
    int detachCouponFromRedemptions(@Param("couponId") UUID couponId);

    void deleteByUser_Id(UUID userId);
}