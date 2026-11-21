package com.aayush.blackjack.wallet.entity;

import com.aayush.blackjack.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chip_wallets")
@Getter
@Setter
@NoArgsConstructor
public class ChipWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private Long balance = 1000L;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
