import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Call ,cleanupCall} from "../service/scripts";
import { User, PhoneOff, ArrowLeft, Send } from "lucide-react";
import { connect, sendMessage } from "../service/chatService.js";
import { useMyContext } from "../context/ContextProvider.js";

const VideoBox = ({ refVideo, label, loading, micOff, videoOff }) => (
  <div className="relative w-full h-52 bg-slate-900 rounded-xl overflow-hidden">
    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 z-10">
      <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
        <User size={12} className="text-white" />
      </div>
      <span className="text-xs font-medium text-white">{label}</span>
      {micOff && (
        <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded">
          Muted
        </span>
      )}
      {videoOff && (
        <span className="text-xs bg-red-500/80 text-white px-1.5 py-0.5 rounded">
          No video
        </span>
      )}
    </div>
    {loading && (
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-20">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
      </div>
    )}
    <video
      ref={refVideo}
      className="w-full h-full object-cover"
      autoPlay
      playsInline
      muted={label.includes("You")}
    />
  </div>
);

const ExpertSession = () => {
  const { user } = useMyContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [sessionId] = useState(id);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [myUserName] = useState(user.username);
  const [localMic] = useState(true);
  const [localCam] = useState(true);

  useEffect(() => {
    const client = connect(id, (msg) => setMessages((prev) => [...prev, msg]));
    setStompClient(client);
    return () => {
      client?.deactivate?.();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !stompClient?.connected) return;
    const message = {
      service: { id: sessionId },
      senderId: myUserName,
      content: input,
    };
    sendMessage(stompClient, message);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    if (!sessionId) return;
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;
    Call(myUserName, sessionId, localVideo, remoteVideo, "expert", {
      onLocalStreamReady: () => setLoadingLocal(false),
      onRemoteStreamReady: () => setLoadingRemote(false),
    });
    // TO:
    return () => {
      cleanupCall();
      [localVideo, remoteVideo].forEach((vid) => {
        if (vid) vid.srcObject = null;
      });
    };
  }, [sessionId, myUserName]);

  const hangUp = () => {
    [localVideoRef.current, remoteVideoRef.current].forEach((vid) => {
      vid?.srcObject?.getTracks().forEach((t) => t.stop());
      if (vid) vid.srcObject = null;
    });
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-sm font-medium text-slate-900">Session</p>
            <p className="text-xs text-slate-400 font-mono">{sessionId}</p>
          </div>
        </div>
        <button
          onClick={hangUp}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          <PhoneOff size={15} />
          End Call
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 md:flex-row flex-col overflow-hidden">
        {/* Video column */}
        <div className="md:w-72 lg:w-80 flex-shrink-0 flex flex-col gap-3 p-4 bg-slate-900">
          <VideoBox
            refVideo={localVideoRef}
            label={`You (${myUserName})`}
            loading={loadingLocal}
            micOff={!localMic}
            videoOff={!localCam}
          />
          <VideoBox
            refVideo={remoteVideoRef}
            label="Participant"
            loading={loadingRemote}
          />
        </div>

        {/* Chat column */}
        <div className="flex-1 flex flex-col border-l border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Live Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center mt-10 text-sm">
                No messages yet.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.senderId === myUserName ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-xs">
                  <p
                    className={`text-xs font-medium mb-1 ${m.senderId === myUserName ? "text-right text-slate-400" : "text-left text-slate-500"}`}
                  >
                    {m.senderId}
                  </p>
                  <div
                    className={`px-4 py-2.5 rounded-xl text-sm ${
                      m.senderId === myUserName
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-900 rounded-bl-sm"
                    }`}
                  >
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

export default ExpertSession;
