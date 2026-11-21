package com.aayush.blackjack.room.repository;

import com.aayush.blackjack.room.entity.RoomUnlockRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomUnlockRuleRepository extends JpaRepository<RoomUnlockRule, UUID> {

    List<RoomUnlockRule> findAllByRoom_Id(UUID id);

    List<RoomUnlockRule> findAllByPrerequisiteRoom_Id(UUID id);
}
