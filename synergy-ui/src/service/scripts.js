import { io } from "socket.io-client";

let socket;
let peerConnection;
let localStream;
let remoteStream;

let pendingSignals = [];
let pendingIce = [];

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const SIGNALING_URL =
  process.env.REACT_APP_SIGNALING_URL || "https://localhost:8181";

export const Call = async (
  userName,
  sessionId,
  localVideo,
  remoteVideo,
  role,
  callbacks
) => {
  console.log(`[Call] Connecting as ${role} to session ${sessionId}`);

  socket = io(SIGNALING_URL, {
    auth: { userName, sessionId, role },
  });

  socket.on("connect", () => {
    console.log(`[Socket] Connected to signaling server as ${role}`);
  });

  socket.on("joinedSession", ({ sessionId, role }) => {
    console.log(`[Socket] Joined session ${sessionId} as ${role}`);
  });

  socket.on("readyToStart", async () => {
    console.log(`[Socket] Both peers ready — starting WebRTC as ${role}`);
    await startCall(role, localVideo, remoteVideo, callbacks);
  });

  socket.on("signal", async (message) => {
    if (!peerConnection) {
      pendingSignals.push(message);
      return;
    }
    await handleSignal(message);
  });

  socket.on("peerReadyForSdp", async () => {
    if (role !== "expert") return;
    console.log("[Handshake] peerReadyForSdp received → creating offer");
    try {
      if (peerConnection.signalingState !== "stable") {
        console.warn("[Expert] Not stable, skipping offer for now");
        return;
      }
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("signal", offer);
      console.log("[Expert] Offer created & sent");
    } catch (err) {
      console.error("[Expert] Offer creation failed:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected from signaling server");
  });
};

async function startCall(role, localVideo, remoteVideo, callbacks) {
  console.log(`[WebRTC] Starting call as ${role}`);

  peerConnection = new RTCPeerConnection(config);

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;
    callbacks?.onLocalStreamReady?.();
    console.log("[Media] Local media ready");
  } catch (err) {
    console.error("[Media] getUserMedia failed:", err);
    return;
  }

  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;
  remoteVideo.onloadedmetadata = () => {
    console.log("[Remote] Metadata loaded, playing stream");
    remoteVideo
      .play()
      .catch((e) => console.warn("[Remote] autoplay blocked:", e));
  };

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((t) => {
      if (!remoteStream.getTracks().find((x) => x.id === t.id)) {
        remoteStream.addTrack(t);
      }
    });
    callbacks?.onRemoteStreamReady?.();
  };

  localStream.getTracks().forEach((t) => peerConnection.addTrack(t, localStream));

  if (role === "user") {
    console.log("[User] Adding recvonly transceivers for remote media");
    peerConnection.addTransceiver("video", { direction: "recvonly" });
    peerConnection.addTransceiver("audio", { direction: "recvonly" });
  }

  peerConnection.onicecandidate = ({ candidate }) => {
    if (candidate) socket.emit("signal", { candidate });
  };

  peerConnection.onconnectionstatechange = () => {
    console.log("[PC] Connection state:", peerConnection.connectionState);
  };

  while (pendingSignals.length) {
    const msg = pendingSignals.shift();
    await handleSignal(msg);
  }

  await flushPendingIce();

  if (role === "user") {
    socket.emit("readyForSdp");
    console.log("[Handshake] User emitted readyForSdp");
  }
}

async function handleSignal(message) {
  if (message.type === "offer") {
    console.log("[Signal] Offer");
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("signal", peerConnection.localDescription);
    await flushPendingIce();
    return;
  }

  if (message.type === "answer") {
    console.log("[Signal] Answer");
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message)
    );
    await flushPendingIce();
    return;
  }

  if (message.candidate) {
    if (!peerConnection.remoteDescription) {
      pendingIce.push(message.candidate);
      return;
    }
    try {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(message.candidate)
      );
    } catch (err) {
      console.error("[ICE] addIceCandidate failed:", err);
    }
  }
}

async function flushPendingIce() {
  if (!peerConnection.remoteDescription || !pendingIce.length) return;
  const queue = pendingIce.slice();
  pendingIce = [];
  for (const c of queue) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(c));
    } catch (err) {
      console.error("[ICE] addIceCandidate (flush) failed:", err);
    }
  }
}