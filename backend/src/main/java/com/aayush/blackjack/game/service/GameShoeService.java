package com.aayush.blackjack.game.service;

import com.aayush.blackjack.game.engine.shoe.Shoe;
import com.aayush.blackjack.game.entity.GameShoe;
import com.aayush.blackjack.game.enums.ShoeStatus;
import com.aayush.blackjack.game.repository.GameShoeRepository;
import com.aayush.blackjack.room.entity.GameRoom;
import com.aayush.blackjack.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameShoeService {
    private final GameShoeRepository gameShoeRepository;

    public GameShoe lockOrCreateActiveShoe(User user, GameRoom room) {
        return gameShoeRepository.findLockedActiveShoe(user.getId(), room.getId())
                .orElseGet(() -> createNewShoeEntity(user, room));
    }

    public GameShoe lockActiveShoe(UUID userId, UUID roomId) {
        return gameShoeRepository.findLockedActiveShoe(userId, roomId)
                .orElseThrow(() -> new IllegalStateException("Active game shoe not found"));
    }

    public Shoe toEngineShoe(GameShoe entity) {
        return new Shoe(entity.getDecksCount(), entity.getShuffledCards(), entity.getNextCardIndex());
    }

    public void syncAndSave(GameShoe entity, Shoe engineShoe, boolean reshuffled) {
        if (reshuffled) {
            entity.setShuffleNumber(entity.getShuffleNumber() + 1);
        }
        entity.setShuffledCards(new ArrayList<>(engineShoe.getCards()));
        entity.setNextCardIndex(engineShoe.getCursor());
        entity.setTotalCards(engineShoe.getTotalCards());
        gameShoeRepository.save(entity);
    }

    private GameShoe createNewShoeEntity(User user, GameRoom gameRoom){
        Shoe freshShoe = Shoe.createShuffled(gameRoom.getDecksPerShoe());
        GameShoe newShoe = new GameShoe();
        newShoe.setUser(user);
        newShoe.setRoom(gameRoom);
        newShoe.setDecksCount(gameRoom.getDecksPerShoe());
        newShoe.setTotalCards(freshShoe.getTotalCards());
        newShoe.setShuffledCards(new ArrayList<>(freshShoe.getCards()));
        newShoe.setNextCardIndex(0);
        newShoe.setReshuffleThreshold(gameRoom.getReshuffleThreshold());
        newShoe.setShuffleNumber(1);
        newShoe.setStatus(ShoeStatus.ACTIVE);

        return gameShoeRepository.save(newShoe);
    }
}
