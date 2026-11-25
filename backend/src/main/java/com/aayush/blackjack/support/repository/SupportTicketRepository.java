package com.aayush.blackjack.support.repository;

import com.aayush.blackjack.support.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID>, JpaSpecificationExecutor<SupportTicket> {

    Optional<SupportTicket> findByIdAndUser_Id(UUID ticketId, UUID userId);

    void deleteByUser_Id(UUID userId);

    long countByUser_IdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(UUID id, Instant startOfDay, Instant startOfNextDay);
}