package com.aayush.blackjack.media.service;

import com.aayush.blackjack.media.dto.MediaUploadResult;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryStorageService implements MediaStorageService{

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;

    @Override
    public MediaUploadResult uploadImage(MultipartFile file, String folder) {
        validateImageFile(file);

        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "overwrite", true
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), options);

            String secureUrl = String.valueOf(uploadResult.get("secure_url"));
            String publicId = String.valueOf(uploadResult.get("public_id"));

            return new MediaUploadResult(secureUrl, publicId);
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary in folder [{}]", folder, e);
            throw new IllegalStateException("Failed to upload image. Please try again.", e);
        }
    }

    @Override
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", "image")
            );

            log.debug("Cloudinary delete result for [{}]: {}", publicId, result.get("result"));
        } catch (IOException e) {
            log.warn("Failed to delete image [{}] from Cloudinary", publicId, e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size exceeds the maximum limit of 5 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported image format. Allowed formats: JPEG, PNG, WEBP");
        }
    }
}
