package com.aayush.blackjack.room.repository;

import com.aayush.blackjack.room.entity.RoomUnlockRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomUnlockRuleRepository extends JpaRepository<RoomUnlockRule, UUID> {

    List<RoomUnlockRule> findAllByRoom_Id(UUID id);

    List<RoomUnlockRule> findAllByPrerequisiteRoom_Id(UUID id);

    void deleteByRoom_IdOrPrerequisiteRoom_Id(UUID roomId, UUID prerequisiteRoomId);

    boolean existsByRoom_IdAndPrerequisiteRoom_Id(UUID roomId, UUID prerequisiteRoomId);

    Optional<RoomUnlockRule> findByIdAndRoom_Id(UUID ruleId, UUID roomId);
}
