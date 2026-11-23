package com.aayush.blackjack.room.validator;

import com.aayush.blackjack.room.dto.CreateGameRoomRequest;
import com.aayush.blackjack.room.dto.UpdateGameRoomRequest;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class GameRoomValidator {

    private static final Set<String> ALLOWED_PAYOUTS = Set.of("3:2", "6:5", "1:1");

    private final GameRoomRepository roomRepository;

    public void validateForCreate(CreateGameRoomRequest request) {
        String normalizedSlug = normalizeSlug(request.slug());
        if (roomRepository.existsBySlug(normalizedSlug)) {
            throw new IllegalArgumentException("Room slug already exists: " + normalizedSlug);
        }

        validateBetBounds(request.minBet(), request.maxBet());
        validatePayout(request.blackjackPayout());
        validateImageInput(request.backgroundUrl(), request.backgroundFile(), "background");
        validateImageInput(request.thumbnailUrl(), request.thumbnailFile(), "thumbnail");
    }

    public void validateForUpdate(GameRoom existing, UpdateGameRoomRequest request) {
        if (request.name() != null && request.name().isBlank()) {
            throw new IllegalArgumentException("Room name must not be blank.");
        }

        if (request.slug() != null) {
            if (request.slug().isBlank()) {
                throw new IllegalArgumentException("Room slug must not be blank.");
            }
            String normalizedSlug = normalizeSlug(request.slug());
            if (!normalizedSlug.equals(existing.getSlug()) && roomRepository.existsBySlug(normalizedSlug)) {
                throw new IllegalArgumentException("Room slug already exists: " + normalizedSlug);
            }
        }

        if (request.difficulty() != null && request.difficulty().isBlank()) {
            throw new IllegalArgumentException("Difficulty must not be blank.");
        }

        long effectiveMinBet = request.minBet() != null ? request.minBet() : existing.getMinBet();
        long effectiveMaxBet = request.maxBet() != null ? request.maxBet() : existing.getMaxBet();
        validateBetBounds(effectiveMinBet, effectiveMaxBet);

        if (request.blackjackPayout() != null) {
            validatePayout(request.blackjackPayout());
        }

        validateImageInput(request.backgroundUrl(), request.backgroundFile(), "background");
        validateImageInput(request.thumbnailUrl(), request.thumbnailFile(), "thumbnail");
    }

    private void validateBetBounds(long minBet, long maxBet) {
        if (maxBet < minBet) {
            throw new IllegalArgumentException("maxBet must be greater than or equal to minBet.");
        }
    }

    private void validatePayout(String payout) {
        if (payout == null || !ALLOWED_PAYOUTS.contains(payout.trim())) {
            throw new IllegalArgumentException("Unsupported blackjackPayout. Allowed values: " + ALLOWED_PAYOUTS);
        }
    }

    private void validateImageInput(String url, MultipartFile file, String fieldLabel) {
        boolean hasUrl = url != null && !url.isBlank();
        boolean hasFile = file != null && !file.isEmpty();

        if (hasUrl && hasFile) {
            throw new IllegalArgumentException(
                    "Provide either " + fieldLabel + "Url or " + fieldLabel + "File, not both."
            );
        }
    }

    private String normalizeSlug(String slug) {
        return slug.trim().toLowerCase(Locale.ROOT);
    }
}