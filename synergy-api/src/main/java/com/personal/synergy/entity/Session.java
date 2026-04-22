package com.personal.synergy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Session {

    @Id
    private String id;
    private String userId;
    private String expertId;
    private LocalDateTime startTime;

    @Column(nullable = true)
    private LocalDateTime endTime;   // FIX: null until session actually ends (was set to now() on creation)

    private String status;

    public Session(String id, String userId, String expertId) {
        this.id = id;
        this.userId = userId;
        this.expertId = expertId;
        this.startTime = LocalDateTime.now();
        this.endTime = null;   // FIX: do not set endTime until reject/complete
        this.status = "PENDING";
    }
}
