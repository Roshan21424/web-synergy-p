import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const connect = (sessionId, onMessageReceived) => {
  // Use localStorage (consistent with rest of app — was incorrectly using localStorage before)
  const token = localStorage.getItem("JWT_TOKEN");
  const backendUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:8080";

  const socket = new SockJS(`${backendUrl}/synergy-chat?token=${token}`);

  const stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000,

    onConnect: (frame) => {
      console.log("connected: ", frame);
      stompClient.subscribe(`/topic/${sessionId}`, (message) => {
        onMessageReceived(JSON.parse(message.body));
      });
    },

    onStompError: (frame) => {
      console.error("Broker error: " + frame.headers["message"]);
      console.error("Details: " + frame.body);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const sendMessage = (connection, message) => {
  if (connection && connection.active) {
    connection.publish({
      destination: "/app/chat",
      body: JSON.stringify(message),
    });
  }
};