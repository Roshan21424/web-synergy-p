package com.personal.synergy.entity;

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
    private LocalDateTime endTime;
    private String status;

    public Session(String id, String userId, String expertId) {
        this.id = id;
        this.userId = userId;
        this.expertId = expertId;
        this.startTime = LocalDateTime.now();
        this.endTime = LocalDateTime.now();
        this.status="PENDING";
    }

}
