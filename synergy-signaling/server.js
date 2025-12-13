const fs = require("fs");
const https = require("https");
const express = require("express");
const socketio = require("socket.io");
const app = express();
const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");
const server = https.createServer({ key, cert }, app);

app.use(express.static(__dirname));

const io = socketio(server, {
  cors: {
    origin: ["https://192.168.1.104:3000"],
    methods: ["GET", "POST"],
  },
});

server.listen(8181, "0.0.0.0", () =>
  console.log("Signaling server running on :8181")
);

const sessions = {}; 

io.on("connection", (socket) => {
  socket.on("readyForSdp", () => {
    const { sessionId, role } = socket.data;
    const targetRole = role === "user" ? "expert" : "user";
    const targetId = sessions[sessionId]?.[targetRole];
    if (targetId) {
      io.to(targetId).emit("peerReadyForSdp");
      console.log(`[HANDSHAKE] ${role} readyForSdp -> notify ${targetRole} in ${sessionId}`);
    }
  });


  const { userName, sessionId, role } = socket.handshake.auth || {};
  socket.data = { userName, sessionId, role };

  if (!sessionId || !role) return;

  if (!sessions[sessionId])
    sessions[sessionId] = { user: null, expert: null, ready: { user: false, expert: false } };

  sessions[sessionId][role] = socket.id;

  console.log(`[JOIN] ${role} (${userName}) joined ${sessionId}`);
  socket.emit("joinedSession", { sessionId, role });

  setTimeout(() => {
    sessions[sessionId].ready[role] = true;
    console.log(`[READY] ${role} ready in ${sessionId}`);
    checkIfBothReady(sessionId);
  }, 1000);

  socket.on("signal", (msg) => {
    const targetRole = role === "user" ? "expert" : "user";
    const targetId = sessions[sessionId]?.[targetRole];
    if (targetId) io.to(targetId).emit("signal", msg);
  });

  socket.on("disconnect", () => {
    console.log(`[LEAVE] ${role} left ${sessionId}`);
    if (sessions[sessionId]) {
      sessions[sessionId][role] = null;
      sessions[sessionId].ready[role] = false;
    }
  });
});

function checkIfBothReady(sessionId) {
  const session = sessions[sessionId];
  if (!session) return;
  const { user, expert, ready } = session;
  if (user && expert && ready.user && ready.expert) {
    console.log(`Both peers ready in ${sessionId}`);
    io.to(user).emit("readyToStart");
    io.to(expert).emit("readyToStart");
  }
}
