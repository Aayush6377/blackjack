package com.aayush.blackjack.room.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.media.dto.MediaUploadResult;
import com.aayush.blackjack.media.service.MediaStorageService;
import com.aayush.blackjack.room.dto.*;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.entity.RoomUnlockRule;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import com.aayush.blackjack.room.validator.GameRoomValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class AdminGameRoomService {

    private static final String ENTITY_TYPE = "GAME_ROOM";
    private static final String DELETING_SLUG_MARKER = "__deleting_";
    private static final String BACKGROUND_FOLDER = "blackjack/rooms/backgrounds";
    private static final String THUMBNAIL_FOLDER = "blackjack/rooms/thumbnails";

    private final GameRoomRepository roomRepository;
    private final RoomUnlockRuleRepository unlockRuleRepository;
    private final MediaStorageService mediaStorageService;
    private final GameRoomValidator gameRoomValidator;
    private final AdminAuditService adminAuditService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public List<AdminGameRoomResponse> listAllRooms() {
        return roomRepository.findAllByOrderByDisplayOrderAscNameAsc()
                .stream()
                .filter(room -> !isPendingDeletion(room))
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminGameRoomResponse getRoomById(UUID roomId) {
        GameRoom room = findRoom(roomId);
        if (isPendingDeletion(room)) {
            throw new IllegalArgumentException("GameRoom not found: " + roomId);
        }
        return toAdminResponse(room);
    }

    @Transactional
    public AdminGameRoomResponse createRoom(CreateGameRoomRequest request) {
        gameRoomValidator.validateForCreate(request);

        GameRoom room = createGameRoom(request);

        applyMediaOnCreate(
                request.backgroundUrl(),
                request.backgroundFile(),
                BACKGROUND_FOLDER,
                room::setBackgroundUrl,
                room::setBackgroundPublicId
        );

        applyMediaOnCreate(
                request.thumbnailUrl(),
                request.thumbnailFile(),
                THUMBNAIL_FOLDER,
                room::setThumbnailUrl,
                room::setThumbnailPublicId
        );

        GameRoom saved = roomRepository.saveAndFlush(room);

        adminAuditService.log(
                "CREATE_GAME_ROOM",
                ENTITY_TYPE,
                saved.getId(),
                Map.of(),
                snapshotRoom(saved)
        );

        return toAdminResponse(saved);
    }

    @Transactional
    public AdminGameRoomResponse updateRoom(UUID roomId, UpdateGameRoomRequest request) {
        GameRoom room = findRoom(roomId);
        gameRoomValidator.validateForUpdate(room, request);

        Map<String, Object> oldValues = snapshotRoom(room);

        boolean wasActive = Boolean.TRUE.equals(room.getActive());
        applyFieldUpdates(room, request);

        boolean isNowActive = Boolean.TRUE.equals(room.getActive());
        cleanupDependentUnlockRulesOnDeactivate(room, wasActive, isNowActive);

        applyMediaOnUpdate(
                request.backgroundUrl(),
                request.backgroundFile(),
                Boolean.TRUE.equals(request.clearBackground()),
                BACKGROUND_FOLDER,
                room.getBackgroundPublicId(),
                room::setBackgroundUrl,
                room::setBackgroundPublicId
        );

        applyMediaOnUpdate(
                request.thumbnailUrl(),
                request.thumbnailFile(),
                Boolean.TRUE.equals(request.clearThumbnail()),
                THUMBNAIL_FOLDER,
                room.getThumbnailPublicId(),
                room::setThumbnailUrl,
                room::setThumbnailPublicId
        );

        GameRoom saved = roomRepository.saveAndFlush(room);

        adminAuditService.log(
                "UPDATE_GAME_ROOM",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshotRoom(saved)
        );

        return toAdminResponse(saved);
    }

    @Transactional
    public AdminGameRoomResponse updateRoomActive(UUID roomId, UpdateGameRoomActiveRequest request) {
        GameRoom room = findRoom(roomId);
        boolean wasActive = Boolean.TRUE.equals(room.getActive());
        boolean nextActive = Boolean.TRUE.equals(request.active());

        Map<String, Object> oldValues = snapshotRoom(room);

        room.setActive(nextActive);
        int removedDependentRules = cleanupDependentUnlockRulesOnDeactivate(room, wasActive, nextActive);

        GameRoom saved = roomRepository.saveAndFlush(room);

        Map<String, Object> newValues = new LinkedHashMap<>(snapshotRoom(saved));
        if (removedDependentRules > 0) {
            newValues.put("removedDependentUnlockRules", removedDependentRules);
        }

        adminAuditService.log(
                nextActive ? "ACTIVATE_GAME_ROOM" : "DEACTIVATE_GAME_ROOM",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                newValues
        );

        return toAdminResponse(saved);
    }

    @Transactional
    public void deleteRoom(UUID roomId) {
        GameRoom room = findRoom(roomId);
        Map<String, Object> oldValues = snapshotRoom(room);

        String bgPublicId = room.getBackgroundPublicId();
        String thumbPublicId = room.getThumbnailPublicId();

        room.setActive(false);
        room.setSlug(room.getSlug() + DELETING_SLUG_MARKER + UUID.randomUUID().toString().substring(0, 8));
        roomRepository.saveAndFlush(room);

        adminAuditService.log(
                "DELETE_GAME_ROOM",
                ENTITY_TYPE,
                roomId,
                oldValues,
                Map.of("deleted", true, "asyncCleanup", true)
        );

        eventPublisher.publishEvent(new GameRoomDeletedEvent(roomId, bgPublicId, thumbPublicId));
    }

    private void applyFieldUpdates(GameRoom room, UpdateGameRoomRequest request) {
        if (request.name() != null) room.setName(request.name().trim());
        if (request.slug() != null) room.setSlug(request.slug().trim().toLowerCase(Locale.ROOT));
        if (request.description() != null) room.setDescription(request.description());
        if (request.difficulty() != null) room.setDifficulty(request.difficulty().trim().toUpperCase(Locale.ROOT));
        if (request.minWallet() != null) room.setMinWallet(request.minWallet());
        if (request.minBet() != null) room.setMinBet(request.minBet());
        if (request.maxBet() != null) room.setMaxBet(request.maxBet());
        if (request.decksPerShoe() != null) room.setDecksPerShoe(request.decksPerShoe());
        if (request.reshuffleThreshold() != null) room.setReshuffleThreshold(request.reshuffleThreshold());
        if (request.blackjackPayout() != null) room.setBlackjackPayout(request.blackjackPayout().trim());
        if (request.dealerHitsSoft17() != null) room.setDealerHitsSoft17(request.dealerHitsSoft17());
        if (request.active() != null) room.setActive(request.active());
        if (request.displayOrder() != null) room.setDisplayOrder(request.displayOrder());
    }

    private void applyMediaOnCreate(
            String directUrl,
            MultipartFile file,
            String folder,
            Consumer<String> urlSetter,
            Consumer<String> publicIdSetter
    ) {
        if (file != null && !file.isEmpty()) {
            MediaUploadResult uploaded = mediaStorageService.uploadImage(file, folder);
            urlSetter.accept(uploaded.url());
            publicIdSetter.accept(uploaded.publicId());
        } else if (directUrl != null && !directUrl.isBlank()) {
            urlSetter.accept(directUrl.trim());
            publicIdSetter.accept(null);
        }
    }

    private void applyMediaOnUpdate(
            String directUrl,
            MultipartFile file,
            boolean clearFlag,
            String folder,
            String existingPublicId,
            Consumer<String> urlSetter,
            Consumer<String> publicIdSetter
    ) {
        if (file != null && !file.isEmpty()) {
            mediaStorageService.deleteImage(existingPublicId);
            MediaUploadResult uploaded = mediaStorageService.uploadImage(file, folder);
            urlSetter.accept(uploaded.url());
            publicIdSetter.accept(uploaded.publicId());
            return;
        }

        if (clearFlag) {
            mediaStorageService.deleteImage(existingPublicId);
            urlSetter.accept(null);
            publicIdSetter.accept(null);
            return;
        }

        if (directUrl != null) {
            if (directUrl.isBlank()) {
                mediaStorageService.deleteImage(existingPublicId);
                urlSetter.accept(null);
                publicIdSetter.accept(null);
            } else {
                mediaStorageService.deleteImage(existingPublicId);
                urlSetter.accept(directUrl.trim());
                publicIdSetter.accept(null);
            }
        }
    }

    private static GameRoom createGameRoom(CreateGameRoomRequest request) {
        GameRoom room = new GameRoom();
        room.setName(request.name().trim());
        room.setSlug(request.slug().trim().toLowerCase(Locale.ROOT));
        room.setDescription(request.description());
        room.setDifficulty(request.difficulty().trim().toUpperCase(Locale.ROOT));
        room.setMinWallet(request.minWallet());
        room.setMinBet(request.minBet());
        room.setMaxBet(request.maxBet());
        room.setDecksPerShoe(request.decksPerShoe());
        room.setReshuffleThreshold(request.reshuffleThreshold());
        room.setBlackjackPayout(request.blackjackPayout().trim());
        room.setDealerHitsSoft17(request.dealerHitsSoft17());
        room.setActive(request.active() != null ? request.active() : true);
        room.setDisplayOrder(request.displayOrder() != null ? request.displayOrder() : 0);
        return room;
    }

    private AdminGameRoomResponse toAdminResponse(GameRoom room) {
        List<AdminRoomUnlockRuleDto> rules = unlockRuleRepository.findAllByRoom_Id(room.getId())
                .stream()
                .map(AdminRoomUnlockRuleDto::from)
                .toList();
        return AdminGameRoomResponse.from(room, rules);
    }

    private GameRoom findRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("GameRoom not found: " + roomId));
    }

    private Map<String, Object> snapshotRoom(GameRoom room) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", room.getId());
        map.put("name", room.getName());
        map.put("slug", room.getSlug());
        map.put("difficulty", room.getDifficulty());
        map.put("backgroundUrl", room.getBackgroundUrl());
        map.put("thumbnailUrl", room.getThumbnailUrl());
        map.put("minWallet", room.getMinWallet());
        map.put("minBet", room.getMinBet());
        map.put("maxBet", room.getMaxBet());
        map.put("decksPerShoe", room.getDecksPerShoe());
        map.put("reshuffleThreshold", room.getReshuffleThreshold());
        map.put("blackjackPayout", room.getBlackjackPayout());
        map.put("dealerHitsSoft17", room.getDealerHitsSoft17());
        map.put("active", room.getActive());
        map.put("displayOrder", room.getDisplayOrder());
        return map;
    }

    private int cleanupDependentUnlockRulesOnDeactivate(GameRoom deactivatedRoom, boolean wasActive, boolean isNowActive) {
        if (!wasActive || isNowActive) {
            return 0;
        }
        List<RoomUnlockRule> dependentRules = unlockRuleRepository.findAllByPrerequisiteRoom_Id(deactivatedRoom.getId());
        int count = dependentRules.size();
        if (count > 0) {
            unlockRuleRepository.deleteAll(dependentRules);
            unlockRuleRepository.flush();
        }
        return count;
    }

    private boolean isPendingDeletion(GameRoom room) {
        return room.getSlug() != null && room.getSlug().contains(DELETING_SLUG_MARKER);
    }
}