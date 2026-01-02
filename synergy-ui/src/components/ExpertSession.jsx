import { useEffect, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Call } from "../service/scripts"
import { User, PhoneOff, ArrowLeft } from "lucide-react"
import { connect, sendMessage } from "../service/chatService.js"
import { useMyContext } from "../context/ContextProvider.js"

const VideoBox = ({ refVideo, label, loading, children, micOff, videoOff }) => (
  <div className="relative w-full max-w-sm h-64 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-md z-10 border border-amber-100">
      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
        <User size={16} className="text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <div className="flex gap-1">
          {micOff && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Mic off</span>}
          {videoOff && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Video off</span>}
        </div>
      </div>
    </div>

    {loading && (
      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    )}

    <video
      ref={refVideo}
      className="w-full h-full object-cover bg-gray-200"
      autoPlay
      playsInline
      muted={label.includes("You")}
    />
    {children}
  </div>
)

const ControlButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="bg-red-500 hover:bg-red-600 p-3.5 rounded-full transition-all shadow-md hover:scale-110 active:scale-95 text-white font-medium"
  >
    {children}
  </button>
)

const ExpertSession = () => {
  const { user } = useMyContext()
  const navigate = useNavigate()
  const { id } = useParams()
  const [sessionId] = useState(id)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const chatEndRef = useRef(null)

  const [loadingLocal, setLoadingLocal] = useState(true)
  const [loadingRemote, setLoadingRemote] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [stompClient, setStompClient] = useState(null)
  const [myUserName] = useState(user.username)
  const [localMic, setLocalMic] = useState(true)
  const [localCam, setLocalCam] = useState(true)

  useEffect(() => {
    const client = connect(id, (msg) => setMessages((prev) => [...prev, msg]))
    setStompClient(client)
  }, [id])

  useEffect(() => {
    console.log("Messages updated:", messages)
  }, [messages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || !stompClient?.connected) return

    const message = {
      service: { id: sessionId },
      senderId: myUserName,
      content: input,
    }

    sendMessage(stompClient, message)
    setInput("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend()
  }

  useEffect(() => {
    if (!sessionId) return

    console.log("ExpertSession starting:", myUserName, "session:", sessionId)

    Call(myUserName, sessionId, localVideoRef.current, remoteVideoRef.current, "expert", {
      onLocalStreamReady: () => setLoadingLocal(false),
      onRemoteStreamReady: () => setLoadingRemote(false),
    })

    return () => {
      ;[localVideoRef.current, remoteVideoRef.current].forEach((vid) => {
        vid?.srcObject?.getTracks().forEach((t) => t.stop())
      })
    }
  }, [sessionId, myUserName])

  const hangUp = () => {
    ;[localVideoRef.current, remoteVideoRef.current].forEach((vid) => {
      vid?.srcObject?.getTracks().forEach((t) => t.stop())
    })
    navigate(-1)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-gray-900 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 border-b border-amber-300 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-amber-400 rounded-lg transition-all">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="text-sm font-semibold text-white">
            Session: <span className="font-mono">{sessionId}</span>
          </div>
        </div>

        <ControlButton onClick={hangUp}>
          <PhoneOff size={20} />
        </ControlButton>
      </div>

      <div className="flex flex-1 md:flex-row flex-col justify-center items-stretch p-6 gap-6">
        <div className="flex flex-col items-center justify-center gap-6">
          <VideoBox
            refVideo={localVideoRef}
            label={`You (${myUserName})`}
            loading={loadingLocal}
            micOff={!localMic}
            videoOff={!localCam}
          />

          <VideoBox refVideo={remoteVideoRef} label="Participant" loading={loadingRemote} />
        </div>

        <div className="md:w-1/2 w-full flex flex-col bg-gray-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b-2 border-amber-200 bg-gradient-to-r from-amber-500 to-amber-600">
            <h2 className="text-lg font-bold text-white"> Live Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <p className="text-gray-400 text-center mt-10 text-sm">No messages yet. Start chatting below </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.senderId === myUserName ? "justify-end" : "justify-start"}`}>
                <div className="max-w-xs">
                  <p
                    className={`text-xs font-extrabold mb-1 ${m.senderId === myUserName ? "text-right text-amber-600" : "text-left text-gray-600"}`}
                  >
                    {m.senderId}
                  </p>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm shadow-md ${
                      m.senderId === myUserName
                        ? "bg-amber-800 text-white rounded-br-none"
                        : "bg-amber-600 text-white rounded-bl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t-2 border-amber-200 bg-white p-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <button
              onClick={handleSend}
              className="bg-amber-500 px-6 py-2 rounded-lg text-white font-semibold hover:bg-amber-600 active:scale-95 transition-all shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpertSession
