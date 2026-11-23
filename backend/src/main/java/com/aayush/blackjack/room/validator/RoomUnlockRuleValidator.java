package com.aayush.blackjack.room.validator;

import com.aayush.blackjack.room.dto.CreateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.dto.UpdateRoomUnlockRuleRequest;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.room.entity.RoomUnlockRule;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class RoomUnlockRuleValidator {

    private final GameRoomRepository roomRepository;
    private final RoomUnlockRuleRepository unlockRuleRepository;

    public GameRoom validateAndGetRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("GameRoom not found: " + roomId));
    }

    public GameRoom validateAndGetPrerequisite(UUID prerequisiteRoomId) {
        return roomRepository.findById(prerequisiteRoomId)
                .orElseThrow(() -> new IllegalArgumentException("Prerequisite GameRoom not found: " + prerequisiteRoomId));
    }

    public void validateForCreate(GameRoom targetRoom, CreateRoomUnlockRuleRequest request) {
        GameRoom prereq = validateAndGetPrerequisite(request.prerequisiteRoomId());
        validateNoSelfReference(targetRoom.getId(), prereq.getId());

        if (unlockRuleRepository.existsByRoom_IdAndPrerequisiteRoom_Id(targetRoom.getId(), prereq.getId())) {
            throw new IllegalArgumentException("An unlock rule already exists for prerequisite room: " + prereq.getSlug());
        }

        validateNoCycle(targetRoom.getId(), prereq.getId());
    }

    public void validateForUpdate(GameRoom targetRoom, RoomUnlockRule existingRule, UpdateRoomUnlockRuleRequest request) {
        UUID effectivePrereqId = request.prerequisiteRoomId() != null
                ? request.prerequisiteRoomId()
                : existingRule.getPrerequisiteRoom().getId();

        GameRoom effectivePrereq = validateAndGetPrerequisite(effectivePrereqId);
        validateNoSelfReference(targetRoom.getId(), effectivePrereq.getId());

        if (!existingRule.getPrerequisiteRoom().getId().equals(effectivePrereq.getId())
                && unlockRuleRepository.existsByRoom_IdAndPrerequisiteRoom_Id(targetRoom.getId(), effectivePrereq.getId())) {
            throw new IllegalArgumentException("An unlock rule already exists for prerequisite room: " + effectivePrereq.getSlug());
        }

        validateNoCycle(targetRoom.getId(), effectivePrereq.getId());
    }

    private void validateNoSelfReference(UUID roomId, UUID prerequisiteRoomId) {
        if (roomId.equals(prerequisiteRoomId)) {
            throw new IllegalArgumentException("A room cannot be a prerequisite of itself.");
        }
    }

    private void validateNoCycle(UUID targetRoomId, UUID prerequisiteRoomId) {
        Set<UUID> visited = new HashSet<>();
        Deque<UUID> queue = new ArrayDeque<>();
        queue.add(prerequisiteRoomId);

        while (!queue.isEmpty()) {
            UUID currentRoomId = queue.poll();
            if (!visited.add(currentRoomId)) {
                continue;
            }
            for (RoomUnlockRule rule : unlockRuleRepository.findAllByRoom_Id(currentRoomId)) {
                UUID nextPrereqId = rule.getPrerequisiteRoom().getId();
                if (nextPrereqId.equals(targetRoomId)) {
                    throw new IllegalArgumentException("Circular room unlock rule detected: prerequisite chain loops back to target room.");
                }
                queue.add(nextPrereqId);
            }
        }
    }
}