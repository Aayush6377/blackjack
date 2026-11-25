package com.aayush.blackjack.user.dto;

import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public record UpdateProfileRequest (
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    String profileImageUrl,
    MultipartFile avatar,
    Boolean removeImage
) { }