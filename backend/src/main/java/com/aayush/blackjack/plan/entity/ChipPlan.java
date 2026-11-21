package com.aayush.blackjack.plan.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chip_plans")
@Getter
@Setter
@NoArgsConstructor
public class ChipPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long chips;

    @Column(nullable = false)
    private Long bonusChips = 0L;

    @Column(nullable = false)
    private Long priceInPaise = 0L;

    @Column(nullable = false)
    private Boolean active = false;

    private Long salePriceInPaise;
    private String saleName;
    private Instant saleStartAt;
    private Instant saleEndAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public boolean isOnSale(){
        if (salePriceInPaise == null || saleStartAt == null || saleEndAt == null){
            return false;
        }

        Instant now = Instant.now();
        return now.isAfter(saleStartAt) && now.isBefore(saleEndAt);
    }

    public long getEffectivePrice() {
        return isOnSale() ? salePriceInPaise : priceInPaise;
    }
}
