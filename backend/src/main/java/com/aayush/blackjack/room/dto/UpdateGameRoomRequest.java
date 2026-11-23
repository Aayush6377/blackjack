package com.aayush.blackjack.room.dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public record UpdateGameRoomRequest(
        @Size(max = 100)
        String name,

        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "Slug must be lowercase kebab-case")
        String slug,

        String description,

        @Size(max = 50)
        String difficulty,

        String backgroundUrl,
        MultipartFile backgroundFile,
        Boolean clearBackground,

        String thumbnailUrl,
        MultipartFile thumbnailFile,
        Boolean clearThumbnail,

        @Min(0)
        Long minWallet,

        @Min(1)
        Long minBet,

        @Min(1)
        Long maxBet,

        @Min(1) @Max(12)
        Integer decksPerShoe,

        @DecimalMin("0.1") @DecimalMax("0.95")
        Double reshuffleThreshold,

        @Size(max = 20)
        String blackjackPayout,

        Boolean dealerHitsSoft17,

        Boolean active,

        @Min(0)
        Integer displayOrder
) {}