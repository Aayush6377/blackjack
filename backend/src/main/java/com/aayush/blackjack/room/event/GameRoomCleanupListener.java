package com.aayush.blackjack.room.event;

import com.aayush.blackjack.game.entity.GameRound;
import com.aayush.blackjack.game.repository.GameActionRepository;
import com.aayush.blackjack.game.repository.GameHandRepository;
import com.aayush.blackjack.game.repository.GameRoundRepository;
import com.aayush.blackjack.game.repository.GameShoeRepository;
import com.aayush.blackjack.media.service.MediaStorageService;
import com.aayush.blackjack.room.dto.GameRoomDeletedEvent;
import com.aayush.blackjack.room.repository.GameRoomRepository;
import com.aayush.blackjack.room.repository.RoomProgressRepository;
import com.aayush.blackjack.room.repository.RoomUnlockRuleRepository;
import com.aayush.blackjack.wallet.repository.ChipTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameRoomCleanupListener {

    private final GameRoomRepository roomRepository;
    private final RoomUnlockRuleRepository unlockRuleRepository;
    private final RoomProgressRepository roomProgressRepository;
    private final GameRoundRepository gameRoundRepository;
    private final GameHandRepository gameHandRepository;
    private final GameActionRepository gameActionRepository;
    private final GameShoeRepository gameShoeRepository;
    private final ChipTransactionRepository chipTransactionRepository;
    private final MediaStorageService mediaStorageService;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGameRoomDeleted(GameRoomDeletedEvent event) {
        UUID roomId = event.roomId();
        log.info("Starting async cleanup for deleted GameRoom [{}]", roomId);

        try {
            // Round cleanup
            List<GameRound> rounds = gameRoundRepository.findAllByRoom_Id(roomId);
            if (!rounds.isEmpty()) {
                List<UUID> roundIds = rounds.stream().map(GameRound::getId).toList();

                gameActionRepository.deleteAllByRoundIds(roundIds);
                gameHandRepository.deleteAllByRoundIds(roundIds);
                chipTransactionRepository.clearGameRoundByRoundIds(roundIds);

                gameRoundRepository.deleteAllInBatch(rounds);
                gameRoundRepository.flush();
            }

            // Shoe cleanup
            gameShoeRepository.deleteAllByRoom_Id(roomId);
            gameShoeRepository.flush();

            // Room progress cleanup
            roomProgressRepository.deleteAllByRoomId(roomId);
            roomProgressRepository.flush();

            // Unlock rules cleanup
            unlockRuleRepository.deleteByRoom_IdOrPrerequisiteRoom_Id(roomId, roomId);
            unlockRuleRepository.flush();

            // Hard-delete the GameRoom row
            roomRepository.deleteById(roomId);
            roomRepository.flush();

            // External image cleanup
            mediaStorageService.deleteImage(event.backgroundPublicId());
            mediaStorageService.deleteImage(event.thumbnailPublicId());

        } catch (Exception ex) {
            log.error("Failed async cleanup for GameRoom [{}]. Manual retry may be required.", roomId, ex);
        }
    }
}