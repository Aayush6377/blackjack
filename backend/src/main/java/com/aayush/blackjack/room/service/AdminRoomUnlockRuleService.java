package com.aayush.blackjack.room.service;

import com.aayush.blackjack.admin.service.AdminAuditService;
import com.aayush.blackjack.room.dto.AdminRoomUnlockRuleDto;
import com.aayush.blackjack.room.dto.CreateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.dto.UpdateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.entity.RoomUnlockRule;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import com.aayush.blackjack.room.validator.RoomUnlockRuleValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminRoomUnlockRuleService {

    private static final String ENTITY_TYPE = "ROOM_UNLOCK_RULE";

    private final RoomUnlockRuleRepository unlockRuleRepository;
    private final RoomUnlockRuleValidator unlockRuleValidator;
    private final AdminAuditService adminAuditService;

    @Transactional(readOnly = true)
    public List<AdminRoomUnlockRuleDto> listRulesForRoom(UUID roomId) {
        unlockRuleValidator.validateAndGetRoom(roomId);
        return unlockRuleRepository.findAllByRoom_Id(roomId)
                .stream()
                .map(AdminRoomUnlockRuleDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminRoomUnlockRuleDto getRuleById(UUID roomId, UUID ruleId) {
        unlockRuleValidator.validateAndGetRoom(roomId);
        RoomUnlockRule rule = findRuleInRoom(roomId, ruleId);
        return AdminRoomUnlockRuleDto.from(rule);
    }

    @Transactional
    public AdminRoomUnlockRuleDto createRule(UUID roomId, CreateRoomUnlockRuleRequest request) {
        GameRoom room = unlockRuleValidator.validateAndGetRoom(roomId);
        unlockRuleValidator.validateForCreate(room, request);
        GameRoom prerequisite = unlockRuleValidator.validateAndGetPrerequisite(request.prerequisiteRoomId());

        RoomUnlockRule rule = new RoomUnlockRule();
        rule.setRoom(room);
        rule.setPrerequisiteRoom(prerequisite);
        rule.setRequiredRounds(request.requiredRounds());
        rule.setRequiredWins(request.requiredWins());
        rule.setMinimumWallet(request.minimumWallet());

        RoomUnlockRule saved = unlockRuleRepository.saveAndFlush(rule);

        adminAuditService.log(
                "CREATE_ROOM_UNLOCK_RULE",
                ENTITY_TYPE,
                saved.getId(),
                Map.of(),
                snapshotRule(saved)
        );

        return AdminRoomUnlockRuleDto.from(saved);
    }

    @Transactional
    public AdminRoomUnlockRuleDto updateRule(UUID roomId, UUID ruleId, UpdateRoomUnlockRuleRequest request) {
        GameRoom room = unlockRuleValidator.validateAndGetRoom(roomId);
        RoomUnlockRule rule = findRuleInRoom(roomId, ruleId);
        unlockRuleValidator.validateForUpdate(room, rule, request);

        Map<String, Object> oldValues = snapshotRule(rule);

        if (request.prerequisiteRoomId() != null) {
            GameRoom newPrereq = unlockRuleValidator.validateAndGetPrerequisite(request.prerequisiteRoomId());
            rule.setPrerequisiteRoom(newPrereq);
        }
        if (request.requiredRounds() != null) {
            rule.setRequiredRounds(request.requiredRounds());
        }
        if (request.requiredWins() != null) {
            rule.setRequiredWins(request.requiredWins());
        }
        if (request.minimumWallet() != null) {
            rule.setMinimumWallet(request.minimumWallet());
        }

        RoomUnlockRule saved = unlockRuleRepository.saveAndFlush(rule);

        adminAuditService.log(
                "UPDATE_ROOM_UNLOCK_RULE",
                ENTITY_TYPE,
                saved.getId(),
                oldValues,
                snapshotRule(saved)
        );

        return AdminRoomUnlockRuleDto.from(saved);
    }

    @Transactional
    public void deleteRule(UUID roomId, UUID ruleId) {
        unlockRuleValidator.validateAndGetRoom(roomId);
        RoomUnlockRule rule = findRuleInRoom(roomId, ruleId);

        Map<String, Object> oldValues = snapshotRule(rule);

        unlockRuleRepository.delete(rule);
        unlockRuleRepository.flush();

        adminAuditService.log(
                "DELETE_ROOM_UNLOCK_RULE",
                ENTITY_TYPE,
                ruleId,
                oldValues,
                Map.of("deleted", true)
        );
    }

    private RoomUnlockRule findRuleInRoom(UUID roomId, UUID ruleId) {
        return unlockRuleRepository.findByIdAndRoom_Id(ruleId, roomId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unlock rule [" + ruleId + "] not found for room [" + roomId + "]"
                ));
    }

    private Map<String, Object> snapshotRule(RoomUnlockRule rule) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", rule.getId());
        map.put("roomId", rule.getRoom().getId());
        map.put("roomSlug", rule.getRoom().getSlug());
        map.put("prerequisiteRoomId", rule.getPrerequisiteRoom().getId());
        map.put("prerequisiteRoomSlug", rule.getPrerequisiteRoom().getSlug());
        map.put("requiredRounds", rule.getRequiredRounds());
        map.put("requiredWins", rule.getRequiredWins());
        map.put("minimumWallet", rule.getMinimumWallet());
        return map;
    }
}