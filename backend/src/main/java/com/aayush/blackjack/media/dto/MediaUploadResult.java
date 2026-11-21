package com.aayush.blackjack.media.dto;

import lombok.Builder;

@Builder
public record MediaUploadResult(
        String url,
        String publicId
) {}
