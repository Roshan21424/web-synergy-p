package com.personal.synergy.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpertInfo {

    private String expertId;
    private String name;
    private String email;
    private String field;
    private String subField;
    private String profileDescription;
    private boolean active;
    private LocalDateTime liveSince = LocalDateTime.now();
    private transient SseEmitter emitter;
    public long getLiveDurationMinutes() {
        return Duration.between(liveSince, LocalDateTime.now()).toMinutes();
    }
}
