package com.aayush.blackjack.coupon.dto;

import com.aayush.blackjack.coupon.entity.Coupon;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record CouponResponse(
        UUID id,
        String code,
        String description,
        Long chipReward,
        Integer maxUsesPerUser,
        Integer maxTotalUses,
        Long timesRedeemed,
        Boolean active,
        Instant startsAt,
        Instant expiresAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static CouponResponse from(Coupon coupon){
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .chipReward(coupon.getChipReward())
                .maxUsesPerUser(coupon.getMaxUsesPerUser())
                .maxTotalUses(coupon.getMaxTotalUses())
                .timesRedeemed(coupon.getTimesRedeemed())
                .active(coupon.getActive())
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}