package com.aayush.blackjack.payment.repository;

import com.aayush.blackjack.payment.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

}
