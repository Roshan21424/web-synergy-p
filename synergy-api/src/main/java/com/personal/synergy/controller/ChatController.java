package com.personal.synergy.controller;

import com.personal.synergy.entity.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    /*
    used to send messages to WebSocket destinations.
    acts as the server-side publisher for STOMP topics.
    */
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /*
     1.listen for incoming STOMP messages on "/app/chat"
     2.receive message payload sent by client
     3.attach server-side timestamp
     4.broadcast message to topic based on service/session id
     5.all subscribers of the topic receive the message
     */
    @MessageMapping("/chat")
    public void sendMessage(@Payload Message message) {
        System.out.println(message);// log received message for debugging
        message.setTimestamp(LocalDateTime.now());// add server timestamp to message

        // send message to all subscribers of this service/session
        messagingTemplate.convertAndSend("/topic/" + message.getService().getId(),message);
    }

}