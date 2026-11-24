package com.aayush.blackjack.coupon.controller;

import com.aayush.blackjack.coupon.dto.CouponRedemptionHistoryResponse;
import com.aayush.blackjack.coupon.dto.RedeemCouponRequest;
import com.aayush.blackjack.coupon.dto.RedeemCouponResponse;
import com.aayush.blackjack.coupon.service.CouponRedemptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRedemptionService couponRedemptionService;

    @PostMapping("/redeem")
    public ResponseEntity<RedeemCouponResponse> redeemCoupon(@Valid @RequestBody RedeemCouponRequest request) {
        return ResponseEntity.ok(couponRedemptionService.redeemCoupon(request));
    }

    @GetMapping("/redemptions/me")
    public ResponseEntity<List<CouponRedemptionHistoryResponse>> getMyRedemptions() {
        return ResponseEntity.ok(couponRedemptionService.getMyRedemptions());
    }
}