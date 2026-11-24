package com.aayush.blackjack.coupon.controller;

import com.aayush.blackjack.coupon.dto.CouponResponse;
import com.aayush.blackjack.coupon.dto.CreateCouponRequest;
import com.aayush.blackjack.coupon.dto.UpdateCouponRequest;
import com.aayush.blackjack.coupon.service.AdminCouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCouponController {

    private final AdminCouponService adminCouponService;

    @GetMapping
    public ResponseEntity<List<CouponResponse>> listCoupons() {
        return ResponseEntity.ok(adminCouponService.listAllCoupons());
    }

    @GetMapping("/{couponId}")
    public ResponseEntity<CouponResponse> getCoupon(@PathVariable UUID couponId) {
        return ResponseEntity.ok(adminCouponService.getCouponById(couponId));
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CreateCouponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCouponService.createCoupon(request));
    }

    @PutMapping("/{couponId}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable UUID couponId,
            @Valid @RequestBody UpdateCouponRequest request
    ) {
        return ResponseEntity.ok(adminCouponService.updateCoupon(couponId, request));
    }

    @PatchMapping("/{couponId}/active")
    public ResponseEntity<CouponResponse> setCouponActive(
            @PathVariable UUID couponId,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(adminCouponService.setActiveStatus(couponId, active));
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable UUID couponId) {
        adminCouponService.deleteCoupon(couponId);
        return ResponseEntity.noContent().build();
    }
}