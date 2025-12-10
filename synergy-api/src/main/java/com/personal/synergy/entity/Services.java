package com.personal.synergy.entity;

import com.personal.synergy.entity.enums.ServiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Services {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User expert;

    @ManyToOne
    private User user;
    private int durationInMinutes;
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ServiceStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean escrowReleased;

}
