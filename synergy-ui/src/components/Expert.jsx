import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMyContext } from "../context/ContextProvider"
import api from "../service/api"
import { Loader2, ArrowLeft, Phone, PhoneOff, Wifi, WifiOff } from "lucide-react"

export default function Expert() {
  const [incomingCall, setIncomingCall] = useState(null)
  const [message, setMessage] = useState(null)
  const [connected, setConnected] = useState(false)
  const [sse, setSse] = useState(null)
  const [callLoading, setCallLoading] = useState(false)
  const [field, setField] = useState("")
  const [subField, setSubField] = useState("")
  const navigate = useNavigate()
  const { user, sessionId, setSessionId } = useMyContext()
  const expertId = user.id
  const token = localStorage.getItem("JWT_TOKEN")

  useEffect(() => {
    console.log("expert is" + user)
  })

  const connectExpert = () => {
    if (!field || !subField) {
      alert("Please select field and subfield before connecting.")
      return
    }

    const emitter = new EventSource(
      `${process.env.REACT_APP_SERVER_URL}/api/call/sse/expert?expertId=${expertId}&field=${encodeURIComponent(field)}&subField=${encodeURIComponent(subField)}&token=${token}`,
      { withCredentials: true },
    )

    console.log("SSE connection opened for Expert:", expertId)
    setSse(emitter)
    setConnected(true)

    emitter.addEventListener("INIT", (e) => { console.log("INIT:", e.data); setMessage(e.data) })
    emitter.addEventListener("heartbeat", (e) => { console.log("Heartbeat:", e.data) })
    emitter.addEventListener("incoming-call", (e) => { console.log("Incoming call from user:", e.data); setIncomingCall({ fromUser: e.data }) })
    emitter.addEventListener("call-accepted", (e) => {
      console.log("Call accepted:", e.data)
      setSessionId(e.data)
      setMessage("Call Accepted")
      const id = e.data.replace("session-", "")
      navigate(`/expert_session/${id}`)
    })
    emitter.addEventListener("call-rejected", (e) => { console.log("Call rejected:", e.data); setMessage("Call Rejected" + e.data); setIncomingCall(null) })
    emitter.onerror = (err) => { console.error("SSE connection error:", err); setMessage("Connection lost"); emitter.close(); setConnected(false) }
  }

  useEffect(() => {
    return () => { if (sse) { console.log("Closing SSE connection for Expert:", expertId); sse.close() } }
  }, [sse, expertId])

  const acceptCall = async () => {
    if (!incomingCall) return
    setCallLoading(true)
    try {
      await api.post(`/api/call/accept?expertId=${expertId}&userId=${incomingCall.fromUser}`)
      setIncomingCall(null)
    } catch (error) {
      console.error("Error accepting call:", error)
    } finally {
      setCallLoading(false)
    }
  }

  const rejectCall = () => { setIncomingCall(null) }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Expert Portal</h1>
            <p className="text-xs text-slate-500">Connect with users seeking your expertise</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">{!connected ? "Setup Your Profile" : "You're Online"}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {!connected ? "Configure your specialization to start receiving calls" : "Waiting for incoming calls"}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${connected ? "text-green-600" : "text-slate-400"}`}>
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "Online" : "Offline"}
            </div>
          </div>

          <div className="p-6">
            {!connected ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Field</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                  >
                    <option value="">Select your primary field</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Specialization</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={subField}
                    onChange={(e) => setSubField(e.target.value)}
                    disabled={!field}
                  >
                    <option value="">Select your specialization</option>
                    {field === "Computer Science" && (
                      <>
                        <option value="AI Scientist">AI Scientist</option>
                        <option value="Hardware Scientist">Hardware Scientist</option>
                        <option value="Software Engineer">Software Engineer</option>
                      </>
                    )}
                    {field === "Physics" && (
                      <>
                        <option value="Quantum Physicist">Quantum Physicist</option>
                        <option value="Astrophysicist">Astrophysicist</option>
                      </>
                    )}
                  </select>
                </div>

                <button
                  onClick={connectExpert}
                  disabled={!field || !subField}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wifi size={16} />
                  Go Online
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Connected status */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Connected & Ready</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    <span className="font-medium">Specialization:</span> {field} — {subField}
                  </p>
                </div>

                {/* Incoming call */}
                {incomingCall && !sessionId && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Incoming Call</p>
                        <p className="text-xs text-slate-500">User ID: {incomingCall.fromUser}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={acceptCall}
                        disabled={callLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {callLoading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                        Accept
                      </button>
                      <button
                        onClick={rejectCall}
                        disabled={callLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <PhoneOff size={16} />
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <p className="text-sm text-slate-700">{message}</p>
                    {sessionId && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">Session: {sessionId}</p>
                    )}
                  </div>
                )}

                {!incomingCall && !message && (
                  <div className="text-center py-10 text-slate-400">
                    <Phone size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Waiting for calls...</p>
                    <p className="text-xs mt-1">You'll be notified when someone requests your expertise</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}