package com.aayush.blackjack.coupon.service;

import com.aayush.blackjack.coupon.dto.CouponRedemptionHistoryResponse;
import com.aayush.blackjack.coupon.dto.RedeemCouponRequest;
import com.aayush.blackjack.coupon.dto.RedeemCouponResponse;
import com.aayush.blackjack.coupon.entity.Coupon;
import com.aayush.blackjack.coupon.entity.CouponRedemption;
import com.aayush.blackjack.coupon.repository.CouponRedemptionRepository;
import com.aayush.blackjack.coupon.repository.CouponRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipTransaction;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.enums.TransactionType;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponRedemptionService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final ChipTransactionRepository chipTransactionRepository;

    @Transactional
    public RedeemCouponResponse redeemCoupon(RedeemCouponRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalizedCode = normalizeCode(request.code());

        Coupon coupon = couponRepository.findLockedByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid coupon code"));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon is currently inactive");
        }

        Instant now = Instant.now();
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon is not active yet");
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This coupon has expired");
        }

        long currentTotalUses = coupon.getTimesRedeemed() != null ? coupon.getTimesRedeemed() : 0L;
        if (coupon.getMaxTotalUses() != null && currentTotalUses >= coupon.getMaxTotalUses()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This coupon has reached its maximum usage limit");
        }

        int maxPerUser = coupon.getMaxUsesPerUser() != null ? coupon.getMaxUsesPerUser() : 1;
        long userRedemptionCount = couponRedemptionRepository.countByCoupon_IdAndUser_Id(coupon.getId(), user.getId());
        if (userRedemptionCount >= maxPerUser) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already claimed this coupon the maximum allowed times (" + maxPerUser + ")"
            );
        }

        ChipWallet wallet = chipWalletRepository.findLockedByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User wallet not found"));

        long rewardChips = coupon.getChipReward();
        long updatedBalance = wallet.getBalance() + rewardChips;
        wallet.setBalance(updatedBalance);

        coupon.setTimesRedeemed(currentTotalUses + 1);
        Coupon savedCoupon = couponRepository.save(coupon);
        chipWalletRepository.save(wallet);

        CouponRedemption redemption = new CouponRedemption();
        redemption.setCoupon(savedCoupon);
        redemption.setUser(user);
        redemption.setCouponCodeSnapshot(savedCoupon.getCode());
        redemption.setChipsAwarded(rewardChips);
        CouponRedemption savedRedemption = couponRedemptionRepository.saveAndFlush(redemption);

        ChipTransaction transaction = new ChipTransaction();
        transaction.setUser(user);
        transaction.setCouponRedemption(savedRedemption);
        transaction.setType(TransactionType.COUPON_REWARD);
        transaction.setAmount(rewardChips);
        transaction.setBalanceAfter(updatedBalance);
        transaction.setReferenceKey("txn:coupon:" + savedRedemption.getId());
        chipTransactionRepository.save(transaction);

        return RedeemCouponResponse.builder()
                .redemptionId(savedRedemption.getId())
                .code(savedCoupon.getCode())
                .chipsAwarded(rewardChips)
                .updatedWalletBalance(updatedBalance)
                .redeemedAt(savedRedemption.getRedeemedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CouponRedemptionHistoryResponse> getMyRedemptions() {
        UUID userId = currentUserService.getCurrentUserId();
        return couponRedemptionRepository.findAllByUser_IdOrderByRedeemedAtDesc(userId)
                .stream()
                .map(r -> CouponRedemptionHistoryResponse.builder()
                        .id(r.getId())
                        .code(r.getCouponCodeSnapshot())
                        .chipsAwarded(r.getChipsAwarded())
                        .redeemedAt(r.getRedeemedAt())
                        .build())
                .toList();
    }

    private String normalizeCode(String rawCode) {
        String trimmed = rawCode == null ? "" : rawCode.trim().toUpperCase(Locale.ROOT);
        if (trimmed.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon code cannot be blank");
        }
        return trimmed;
    }
}