package com.personal.synergy.controller;

import com.personal.synergy.entity.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Slf4j
@Controller
@RequiredArgsConstructor   // FIX: constructor injection
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;   // FIX: private final, no @Autowired

    @MessageMapping("/chat")
    public void sendMessage(@Payload Message message) {
        log.debug("Chat message received: service={} sender={}", message.getService().getId(), message.getSenderId());   // FIX: was System.out.println
        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/" + message.getService().getId(), message);
    }
}