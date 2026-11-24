package com.aayush.blackjack.coupon.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.coupon.dto.CouponResponse;
import com.aayush.blackjack.coupon.dto.CreateCouponRequest;
import com.aayush.blackjack.coupon.dto.UpdateCouponRequest;
import com.aayush.blackjack.coupon.entity.Coupon;
import com.aayush.blackjack.coupon.repository.CouponRedemptionRepository;
import com.aayush.blackjack.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminCouponService {

    private static final String ENTITY_TYPE = "COUPON";

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public List<CouponResponse> listAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CouponResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(UUID couponId) {
        return CouponResponse.from(findCouponOrThrow(couponId));
    }

    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest request) {
        String normalizedCode = normalizeCode(request.code());
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + normalizedCode);
        }

        validateScheduleWindow(request.startsAt(), request.expiresAt());

        int maxUsesPerUser = request.maxUsesPerUser() != null ? request.maxUsesPerUser() : 1;
        boolean active = request.active() != null ? request.active() : true;

        Coupon coupon = new Coupon();
        coupon.setCode(normalizedCode);
        coupon.setDescription(trimToNull(request.description()));
        coupon.setChipReward(request.chipReward());
        coupon.setMaxUsesPerUser(maxUsesPerUser);
        coupon.setMaxTotalUses(request.maxTotalUses());
        coupon.setTimesRedeemed(0L);
        coupon.setActive(active);
        coupon.setStartsAt(request.startsAt());
        coupon.setExpiresAt(request.expiresAt());

        Coupon saved = couponRepository.saveAndFlush(coupon);

        adminAuditService.log(
                "CREATE_COUPON",
                ENTITY_TYPE,
                saved.getId(),
                Map.of(),
                snapshotCoupon(saved)
        );

        return CouponResponse.from(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(UUID couponId, UpdateCouponRequest request) {
        Coupon coupon = findCouponOrThrow(couponId);
        Map<String, Object> oldValues = snapshotCoupon(coupon);

        if (request.code() != null) {
            String normalizedCode = normalizeCode(request.code());
            if (couponRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, couponId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + normalizedCode);
            }
            coupon.setCode(normalizedCode);
        }

        if (request.description().isPresent()) {
            coupon.setDescription(trimToNull(request.description().orElse(null)));
        }

        if (request.chipReward() != null) {
            coupon.setChipReward(request.chipReward());
        }

        if (request.maxUsesPerUser() != null) {
            coupon.setMaxUsesPerUser(request.maxUsesPerUser());
        }

        if (request.maxTotalUses().isPresent()) {
            Integer nextMaxTotal = request.maxTotalUses().orElse(null);
            if (nextMaxTotal < coupon.getTimesRedeemed()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Max total uses cannot be less than already redeemed count (" + coupon.getTimesRedeemed() + ")"
                );
            }
            coupon.setMaxTotalUses(nextMaxTotal);
        }

        if (request.active() != null) {
            coupon.setActive(request.active());
        }

        Instant nextStartsAt = request.startsAt().isPresent() ? request.startsAt().orElse(null) : coupon.getStartsAt();
        Instant nextExpiresAt = request.expiresAt().isPresent() ? request.expiresAt().orElse(null) : coupon.getExpiresAt();
        validateScheduleWindow(nextStartsAt, nextExpiresAt);
        coupon.setStartsAt(nextStartsAt);
        coupon.setExpiresAt(nextExpiresAt);

        Coupon saved = couponRepository.saveAndFlush(coupon);

        adminAuditService.log(
                "UPDATE_COUPON",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshotCoupon(saved)
        );

        return CouponResponse.from(saved);
    }

    @Transactional
    public CouponResponse setActiveStatus(UUID couponId, boolean active) {
        Coupon coupon = findCouponOrThrow(couponId);
        Map<String, Object> oldValues = snapshotCoupon(coupon);

        coupon.setActive(active);
        Coupon saved = couponRepository.saveAndFlush(coupon);

        adminAuditService.log(
                active ? "ACTIVATE_COUPON" : "DEACTIVATE_COUPON",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshotCoupon(saved)
        );

        return CouponResponse.from(saved);
    }

    @Transactional
    public void deleteCoupon(UUID couponId) {
        Coupon coupon = findCouponOrThrow(couponId);
        Map<String, Object> oldValues = snapshotCoupon(coupon);

        couponRedemptionRepository.detachCouponFromRedemptions(couponId);

        couponRepository.delete(coupon);
        couponRepository.flush();

        adminAuditService.log(
                "DELETE_COUPON",
                ENTITY_TYPE,
                couponId,
                oldValues,
                Map.of("deleted", true)
        );
    }

    private Coupon findCouponOrThrow(UUID couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found: " + couponId));
    }

    private void validateScheduleWindow(Instant startsAt, Instant expiresAt) {
        if (startsAt != null && expiresAt != null && !expiresAt.isAfter(startsAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiration time must be after start time");
        }
    }

    private String normalizeCode(String rawCode) {
        String trimmed = rawCode == null ? "" : rawCode.trim().toUpperCase(Locale.ROOT);
        if (trimmed.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon code cannot be blank");
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Map<String, Object> snapshotCoupon(Coupon coupon) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", coupon.getId());
        map.put("code", coupon.getCode());
        map.put("description", coupon.getDescription());
        map.put("chipReward", coupon.getChipReward());
        map.put("maxUsesPerUser", coupon.getMaxUsesPerUser());
        map.put("maxTotalUses", coupon.getMaxTotalUses());
        map.put("timesRedeemed", coupon.getTimesRedeemed());
        map.put("active", coupon.getActive());
        map.put("startsAt", coupon.getStartsAt());
        map.put("expiresAt", coupon.getExpiresAt());
        return map;
    }
}