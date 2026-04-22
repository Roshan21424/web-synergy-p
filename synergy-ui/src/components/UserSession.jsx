import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Call } from "../service/scripts";
import { connect, sendMessage } from "../service/chatService.js";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, ArrowLeft, Send } from "lucide-react";
import { io } from "socket.io-client";
import { useMyContext } from "../context/ContextProvider.js";

const SIGNALING_URL =
  process.env.REACT_APP_SIGNALING_URL || "https://localhost:8181";

const useCall = ({ userName, sessionId, localRef, remoteRef }) => {
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    if (!sessionId || !userName) return;
    let isMounted = true;

    const socket = io(SIGNALING_URL, {
      auth: { userName, sessionId, role: "user" },
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to signaling server");
      setStatus("Connected to signaling server...");
    });
    socket.on("waitingForExpert", () => {
      console.log("Waiting for expert...");
      setStatus("Waiting for expert to join...");
    });
    socket.on("readyToStart", () => {
      console.log("Expert joined, starting WebRTC call...");
      setStatus("Connecting to expert...");
      Call(userName, sessionId, localRef.current, remoteRef.current, "user", {
        onLocalStreamReady: () => isMounted && setLoadingLocal(false),
        onRemoteStreamReady: () => isMounted && setLoadingRemote(false),
      });
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from signaling server");
      setStatus("Disconnected. Please reload.");
    });

    const localVideo = localRef.current;
    const remoteVideo = remoteRef.current;

    return () => {
      isMounted = false;
      socket.disconnect();
      [localVideo, remoteVideo].forEach((vid) => {
        const stream = vid?.srcObject;
        if (stream) stream.getTracks().forEach((t) => t.stop());
        if (vid) vid.srcObject = null;
      });
    };
  }, [userName, sessionId, localRef, remoteRef]);

  const toggleTrack = (kind) => {
    if (!localRef.current?.srcObject) return;
    localRef.current.srcObject
      .getTracks()
      .filter((t) => t.kind === kind)
      .forEach((t) => (t.enabled = !t.enabled));
  };

  return { loadingLocal, loadingRemote, toggleTrack, status };
};

const VideoBox = ({ refVideo, label, loading, micOff, videoOff }) => (
  <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden">
    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 z-10">
      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
        <User size={12} className="text-white" />
      </div>
      <span className="text-xs font-medium text-white">{label}</span>
      {micOff && <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded">Muted</span>}
      {videoOff && <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded">No video</span>}
    </div>
    {loading && (
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-20">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
      </div>
    )}
    <video ref={refVideo} className="w-full h-full object-cover" autoPlay playsInline />
  </div>
);

const UserSession = () => {
  const { id, expert } = useParams();
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const { user } = useMyContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [localMic, setLocalMic] = useState(true);
  const [localCam, setLocalCam] = useState(true);
  const [myUserName] = useState(user.username);

  const { loadingLocal, loadingRemote, toggleTrack } = useCall({
    userName: myUserName,
    sessionId: id,
    localRef: localVideoRef,
    remoteRef: remoteVideoRef,
  });

useEffect(() => {
    const client = connect(id, (msg) => setMessages((prev) => [...prev, msg]));
    setStompClient(client);
    return () => { client?.deactivate(); };
}, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !stompClient?.active) return;
    const message = { service: { id }, senderId: myUserName, content: input };
    console.log(message);
    sendMessage(stompClient, message);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const hangUp = () => {
    [localVideoRef.current, remoteVideoRef.current].forEach((vid) =>
      vid?.srcObject?.getTracks().forEach((t) => t.stop())
    );
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-sm font-medium text-slate-900">Session with {expert}</p>
            <p className="text-xs text-slate-400 font-mono">{id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { toggleTrack("audio"); setLocalMic(!localMic); }}
            disabled={loadingLocal}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {localMic ? <Mic size={15} /> : <MicOff size={15} className="text-red-500" />}
          </button>

          <button
            onClick={() => { toggleTrack("video"); setLocalCam(!localCam); }}
            disabled={loadingLocal}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {localCam ? <Video size={15} /> : <VideoOff size={15} className="text-red-500" />}
          </button>

          <button
            onClick={hangUp}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            <PhoneOff size={15} />
            End
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 md:flex-row flex-col overflow-hidden">
        {/* Video */}
        <div className="md:w-72 lg:w-80 flex-shrink-0 flex flex-col gap-3 p-4 bg-slate-900">
          <VideoBox refVideo={localVideoRef} label={`You (${myUserName})`} loading={loadingLocal} micOff={!localMic} videoOff={!localCam} />
          <VideoBox refVideo={remoteVideoRef} label={expert} loading={loadingRemote} />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col border-l border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Live Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center mt-10 text-sm">No messages yet.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderId === myUserName ? "justify-end" : "justify-start"}`}>
                <div className="max-w-xs">
                  <p className={`text-xs font-medium mb-1 ${m.senderId === myUserName ? "text-right text-slate-400" : "text-left text-slate-500"}`}>
                    {m.senderId}
                  </p>
                  <div className={`px-4 py-2.5 rounded-xl text-sm ${
                    m.senderId === myUserName
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-900 rounded-bl-sm"
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-slate-100 p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <Send size={14} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSession;