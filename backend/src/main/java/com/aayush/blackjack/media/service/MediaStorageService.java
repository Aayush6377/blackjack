package com.aayush.blackjack.media.service;

import com.aayush.blackjack.media.dto.MediaUploadResult;
import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {
    MediaUploadResult uploadImage(MultipartFile file, String folder);
    void deleteImage(String publicId);
}
