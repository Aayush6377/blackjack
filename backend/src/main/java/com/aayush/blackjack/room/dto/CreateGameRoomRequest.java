package com.aayush.blackjack.room.dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public record CreateGameRoomRequest(
        @NotBlank(message = "Room name is required")
        @Size(max = 100)
        String name,

        @NotBlank(message = "Room slug is required")
        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase kebab-case")
        String slug,

        String description,

        @NotBlank(message = "Difficulty is required")
        @Size(max = 50)
        String difficulty,

        String backgroundUrl,
        MultipartFile backgroundFile,

        String thumbnailUrl,
        MultipartFile thumbnailFile,

        @NotNull(message = "minWallet is required")
        @Min(0)
        Long minWallet,

        @NotNull(message = "minBet is required")
        @Min(1)
        Long minBet,

        @NotNull(message = "maxBet is required")
        @Min(1)
        Long maxBet,

        @NotNull(message = "decksPerShoe is required")
        @Min(1) @Max(12)
        Integer decksPerShoe,

        @NotNull(message = "reshuffleThreshold is required")
        @DecimalMin("0.1") @DecimalMax("0.95")
        Double reshuffleThreshold,

        @NotBlank(message = "blackjackPayout is required")
        @Size(max = 20)
        String blackjackPayout,

        @NotNull(message = "dealerHitsSoft17 is required")
        Boolean dealerHitsSoft17,

        Boolean active,

        @Min(0)
        Integer displayOrder
) {}