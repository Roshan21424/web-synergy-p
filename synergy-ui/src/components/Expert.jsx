import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMyContext } from "../context/ContextProvider"
import api from "../service/api"
import { Loader2, ArrowLeft, Phone, PhoneOff, Wifi, WifiOff, Sparkles } from "lucide-react"

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
      `${process.env.REACT_APP_SERVER_URL}/api/call/sse/expert?expertId=${expertId}&field=${encodeURIComponent(
        field,
      )}&subField=${encodeURIComponent(subField)}&token=${token}`,
      { withCredentials: true },
    )

    console.log("SSE connection opened for Expert:", expertId)
    setSse(emitter)
    setConnected(true)

    emitter.addEventListener("INIT", (e) => {
      console.log("INIT:", e.data)
      setMessage(e.data)
    })

    emitter.addEventListener("heartbeat", (e) => {
      console.log("Heartbeat:", e.data)
    })

    emitter.addEventListener("incoming-call", (e) => {
      console.log("Incoming call from user:", e.data)
      setIncomingCall({ fromUser: e.data })
    })

    emitter.addEventListener("call-accepted", (e) => {
      console.log("Call accepted:", e.data)
      setSessionId(e.data)
      setMessage("Call Accepted")

      const id = e.data.replace("session-", "")
      navigate(`/expert_session/${id}`)
    })

    emitter.addEventListener("call-rejected", (e) => {
      console.log("Call rejected:", e.data)
      setMessage("Call Rejected" + e.data)
      setIncomingCall(null)
    })

    emitter.onerror = (err) => {
      console.error("SSE connection error:", err)
      setMessage("Connection lost")
      emitter.close()
      setConnected(false)
    }
  }

  useEffect(() => {
    return () => {
      if (sse) {
        console.log("Closing SSE connection for Expert:", expertId)
        sse.close()
      }
    }
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

  const rejectCall = () => {
    setIncomingCall(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
      <div className="relative bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 text-white px-6 py-5 shadow-xl border-b-4 border-amber-800/30">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent"></div>
        <div className="relative flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Sparkles size={28} className="text-amber-200" />
              Expert Portal
            </h1>
            <p className="text-amber-100 text-sm mt-1 font-medium">Connect with users seeking your expertise</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-3xl blur-2xl"></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-8 py-6 border-b-2 border-amber-200">
              <h2 className="text-2xl md:text-3xl font-extrabold text-amber-900 flex items-center gap-3">
                {!connected ? (
                  <>
                    <WifiOff className="text-amber-600" size={32} />
                    Expert Setup
                  </>
                ) : (
                  <>
                    <Wifi className="text-green-600 animate-pulse" size={32} />
                    You're Online
                  </>
                )}
              </h2>
              <p className="text-amber-700 text-sm mt-2">
                {!connected ? "Configure your specialization to start receiving calls" : "Waiting for incoming calls from users"}
              </p>
            </div>

            <div className="p-8">
              {!connected ? (
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                      Select Your Field
                    </label>
                    <select
                      className="w-full border-2 border-amber-200 rounded-xl p-4 bg-gradient-to-r from-white to-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all text-gray-900 font-medium shadow-sm hover:shadow-md"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                    >
                      <option value="">Choose your primary field...</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</span>
                      Select Your Specialization
                    </label>
                    <select
                      className="w-full border-2 border-amber-200 rounded-xl p-4 bg-gradient-to-r from-white to-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition-all text-gray-900 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      value={subField}
                      onChange={(e) => setSubField(e.target.value)}
                      disabled={!field}
                    >
                      <option value="">Choose your specialization...</option>

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
                    className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl p-5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg"
                  >
                    <Wifi size={24} />
                    Go Online & Accept Calls
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                        <p className="text-green-800 font-bold text-lg">Connected & Ready</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                        <p className="text-sm text-gray-700 font-semibold mb-1">Your Specialization:</p>
                        <p className="text-amber-900 font-bold text-lg">{field} → {subField}</p>
                      </div>
                    </div>
                  </div>

                  {incomingCall && !sessionId && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-4 border-amber-400 rounded-2xl p-8 shadow-2xl animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10"></div>
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
                              <Phone size={32} className="text-white animate-bounce" />
                            </div>
                            <div className="absolute -inset-1 bg-amber-400 rounded-full animate-ping opacity-75"></div>
                          </div>
                          <div>
                            <p className="text-amber-900 font-extrabold text-2xl">Incoming Call!</p>
                            <p className="text-amber-700 text-sm font-medium mt-1">User ID: {incomingCall.fromUser}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <button
                            onClick={acceptCall}
                            disabled={callLoading}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                          >
                            {callLoading ? (
                              <>
                                <Loader2 size={22} className="animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <Phone size={22} />
                                <span>Accept Call</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={rejectCall}
                            disabled={callLoading}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                          >
                            <PhoneOff size={22} />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-5 rounded-2xl shadow-lg">
                      <p className="text-amber-900 font-semibold text-base">{message}</p>
                      {sessionId && (
                        <div className="mt-3 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                          <p className="text-xs text-gray-600 font-medium">Session ID:</p>
                          <p className="text-sm text-amber-900 font-mono font-bold">{sessionId}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!incomingCall && !message && (
                    <div className="text-center py-12">
                      <div className="relative inline-block mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                          <Phone size={40} className="text-white" />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-400 animate-ping opacity-50"></div>
                      </div>
                      <p className="text-gray-600 text-lg font-medium">Waiting for calls...</p>
                      <p className="text-gray-500 text-sm mt-2">You'll be notified when someone requests your expertise</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}