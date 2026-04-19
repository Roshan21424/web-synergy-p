import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/ContextProvider";
import api from "../service/api";
import { Loader2, ArrowLeft, User, Search } from "lucide-react";

export default function CallUser() {
  const navigate = useNavigate();
  const { user, sessionId, setSessionId } = useMyContext();
  const userId = user?.id;
  const [message, setMessage] = useState(null);
  const [sse, setSse] = useState(null);
  const [field, setField] = useState("");
  const [subField, setSubField] = useState("");
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!field) return alert("Select a field first!");
    setLoading(true);
    try {
      const res = await api.get(`/api/call/experts?field=${field}&subField=${subField}`);
      setExperts(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setMessage("Error fetching experts");
    } finally {
      setLoading(false);
    }
  };

  const startCall = async (expertId) => {
    const token = localStorage.getItem("JWT_TOKEN");
    const emitter = new EventSource(
      `${process.env.REACT_APP_SERVER_URL}/api/call/sse/user?userId=${userId}&token=${token}`,
      { withCredentials: true }
    );
    setSse(emitter);
    console.log("user SSE opened for user id: ", userId);

    emitter.addEventListener("call-pending", (e) => { console.log("Call pending: ", e.data); setMessage(e.data) });
    emitter.addEventListener("call-accepted", (e) => {
      console.log("Call accepted:", e.data);
      setSessionId(e.data);
      setMessage("Call Accepted(" + e.data + ")");
      emitter.close();
      const id = e.data.replace("session-", "");
      navigate(`/user_session/${id}/${encodeURIComponent(selectedExpert.name)}`);
    });
    emitter.addEventListener("call-rejected", (e) => { console.log("Call rejected:", e.data); setMessage("Call Rejected (" + e.data + ")"); emitter.close() });
    emitter.onerror = (err) => { console.error("User SSE error:", err); setMessage("Connection lost"); emitter.close() };

    try {
      await api.post(`/api/call/request?userId=${userId}&expertId=${expertId}`);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  useEffect(() => {
    return () => { if (sse) { console.log("Closing SSE for user:", userId); sse.close() } };
  }, [sse, userId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Find Experts</h1>
            <p className="text-xs text-slate-500">Connect with professionals instantly</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Search size={15} className="text-slate-400" />
                Search Experts
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Field</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                >
                  <option value="">Select Field</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Subfield</label>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={subField}
                  onChange={(e) => setSubField(e.target.value)}
                >
                  <option value="">Select Subfield</option>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleSearch}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                Search
              </button>
            </div>

            {/* Results */}
            {!loading && experts.length > 0 && (
              <div className="border-t border-slate-100">
                <div className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {experts.length} Expert{experts.length !== 1 ? 's' : ''} Found
                </div>
                <div className="px-3 pb-3 space-y-1 max-h-80 overflow-y-auto">
                  {experts.map((expert) => (
                    <button
                      key={expert.id}
                      onClick={() => setSelectedExpert(expert)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                        selectedExpert?.id === expert.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{expert.name}</p>
                          <p className="text-xs text-slate-500">{expert.subField}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="border-t border-slate-100 py-8 flex justify-center">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1">
          <div className="bg-white border border-slate-200 rounded-xl h-full min-h-[400px] overflow-hidden">
            {selectedExpert ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <User size={22} className="text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                        {selectedExpert.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedExpert.field}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6 space-y-2">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">Specialization:</span> {selectedExpert.subField}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">About:</span>{" "}
                      <span className="text-slate-500">{selectedExpert.description || "No description available"}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                      Live since: {selectedExpert.liveSince}
                    </p>
                  </div>

                  <button
                    onClick={() => startCall(selectedExpert.expertId)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📞 Call {selectedExpert.name}
                  </button>

                  {message && (
                    <div className="mt-5 bg-slate-50 border border-slate-200 p-4 rounded-lg">
                      <p className="text-sm text-slate-700">{message}</p>
                      {sessionId && <p className="text-xs text-slate-500 mt-1">Session: {sessionId}</p>}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-20">
                <div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400">Select an expert to view their profile</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}