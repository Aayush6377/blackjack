package com.aayush.blackjack.user.event;

import com.aayush.blackjack.auth.repository.OAuthAccountRepository;
import com.aayush.blackjack.auth.repository.RefreshTokenRepository;
import com.aayush.blackjack.coupon.repository.CouponRedemptionRepository;
import com.aayush.blackjack.game.repository.GameActionRepository;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.game.repository.GameShoeRepository;
import com.aayush.blackjack.media.service.MediaStorageService;
import com.aayush.blackjack.payment.repository.PaymentAttemptRepository;
import com.aayush.blackjack.reward.repository.DailyRewardClaimRepository;
import com.aayush.blackjack.room.repository.RoomProgressRepository;
import com.aayush.blackjack.user.dto.AccountDeletionRequestedEvent;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountDeletionEventListener {

    private final UserRepository userRepository;
    private final MediaStorageService mediaStorageService;

    private final RefreshTokenRepository refreshTokenRepository;
    private final OAuthAccountRepository oauthAccountRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final DailyRewardClaimRepository dailyRewardClaimRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final RoomProgressRepository roomProgressRepository;
    private final GameActionRepository gameActionRepository;
    private final GameHandRepository gameHandRepository;
    private final GameRoundRepository gameRoundRepository;
    private final GameShoeRepository gameShoeRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleAccountDeletionRequested(AccountDeletionRequestedEvent event) {
        UUID userId = event.userId();
        log.info("Starting async account cleanup for userId={}", userId);

        try {
            if (event.profileImagePublicId() != null && !event.profileImagePublicId().isBlank()) {
                try {
                    mediaStorageService.deleteImage(event.profileImagePublicId());
                } catch (Exception ex) {
                    log.warn("Failed to remove profile image [{}] for userId={}: {}", event.profileImagePublicId(), userId, ex.getMessage());
                }
            }

            gameActionRepository.deleteAllByUserId(userId);
            gameHandRepository.deleteAllByUserId(userId);
            gameRoundRepository.deleteByUser_Id(userId);
            gameShoeRepository.deleteByUser_Id(userId);
            roomProgressRepository.deleteByUser_Id(userId);

            dailyRewardClaimRepository.deleteByUser_Id(userId);
            couponRedemptionRepository.deleteByUser_Id(userId);
            paymentAttemptRepository.deleteAllByUserId(userId);

            chipTransactionRepository.deleteByUser_Id(userId);
            chipWalletRepository.deleteByUser_Id(userId);

            oauthAccountRepository.deleteByUser_Id(userId);
            refreshTokenRepository.deleteByUser_Id(userId);

            userRepository.findById(userId).ifPresent(this::markUserDeleted);

            log.info("Completed async account cleanup for userId={}", userId);
        } catch (Exception ex) {
            log.error("Async account cleanup failed for userId={}: {}", userId, ex.getMessage(), ex);
        }
    }

    private void markUserDeleted(User user) {
        user.setName("Deleted User");
        user.setEmail("deleted_" + user.getId() + "@deleted.invalid");
        user.setPasswordHash(null);
        user.setProfileImageUrl(null);
        user.setProfileImagePublicId(null);
        user.setEnabled(false);
        user.setDeleted(true);
        user.setDeletedAt(Instant.now());
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        userRepository.save(user);
    }
}