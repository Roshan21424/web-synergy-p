import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/ContextProvider";
import api from "../service/api";
import { Loader2, ArrowLeft, User, Search, Phone, Star, Clock, Sparkles } from "lucide-react";

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
      const res = await api.get(
        `/api/call/experts?field=${field}&subField=${subField}`
      );
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
      {
        withCredentials: true,
      }
    );

    setSse(emitter);

    console.log("user SSE opened for user id: ", userId);

    emitter.addEventListener("call-pending", (e) => {
      console.log("Call pending: ", e.data);
      setMessage(e.data);
    });

    emitter.addEventListener("call-accepted", (e) => {
      console.log("Call accepted:", e.data);
      setSessionId(e.data);
      setMessage("Call Accepted(" + e.data + ")");

      emitter.close();

      const id = e.data.replace("session-", "");
      navigate(
        `/user_session/${id}/${encodeURIComponent(selectedExpert.name)}`
      );
    });

    emitter.addEventListener("call-rejected", (e) => {
      console.log("Call rejected:", e.data);
      setMessage("Call Rejected (" + e.data + ")");

      emitter.close();
    });

    emitter.onerror = (err) => {
      console.error("User SSE error:", err);
      setMessage("Connection lost");

      emitter.close();
    };

    try {
      await api.post(`/api/call/request?userId=${userId}&expertId=${expertId}`);
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (sse) {
        console.log("Closing SSE for user:", userId);
        sse.close();
      }
    };
  }, [sse, userId]);

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
              <Search size={28} className="text-amber-200" />
              Find Experts
            </h1>
            <p className="text-amber-100 text-sm mt-1 font-medium">Connect with professionals instantly</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6">
        <div className="w-1/3">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-5 border-b-2 border-amber-200">
                <h2 className="text-xl font-extrabold text-amber-900 flex items-center gap-2">
                  <Search size={24} className="text-amber-600" />
                  Search Experts
                </h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Field
                    </label>
                    <select
                      className="w-full border-2 border-amber-200 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subfield
                    </label>
                    <select
                      className="w-full border-2 border-amber-200 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      value={subField}
                      onChange={(e) => setSubField(e.target.value)}
                    >
                      <option value="">Select Subfield</option>

                      {field === "Computer Science" && (
                        <>
                          <option value="AI Scientist">AI Scientist</option>
                          <option value="Hardware Scientist">
                            Hardware Scientist
                          </option>
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
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg p-3 transition-all active:scale-95 shadow-lg hover:shadow-xl"
                    onClick={handleSearch}
                  >
                    {loading ? (
                      <Loader2 className="inline animate-spin mr-2" size={18} />
                    ) : (
                      ""
                    )}
                    Search
                  </button>
                </div>

                <div className="mt-6">
                  {loading && (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="animate-spin text-amber-500" size={24} />
                    </div>
                  )}

                  {!loading && experts.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {experts.map((expert) => (
                        <div
                          key={expert.id}
                          onClick={() => setSelectedExpert(expert)}
                          className={`p-4 cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                            selectedExpert?.id === expert.id
                              ? "bg-gradient-to-r from-amber-100 to-orange-100 border-amber-500 shadow-lg scale-105"
                              : "bg-white border-gray-200 hover:border-amber-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0 shadow-md">
                              <User size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {expert.name}
                              </p>
                              <p className="text-xs text-amber-700 mt-1 font-medium">
                                {expert.subField}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Live since: {expert.liveSince}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative h-full">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden h-full">
              {selectedExpert ? (
                <div className="h-full flex flex-col">
                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-8 py-6 border-b-2 border-amber-200">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-xl">
                        <User size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-amber-800">
                          {selectedExpert.name}
                        </h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {selectedExpert.field}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Specialization:</strong> {selectedExpert.subField}
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>About:</strong>{" "}
                        {selectedExpert.description || "No description available"}
                      </p>
                    </div>

                    <button
                      onClick={() => startCall(selectedExpert.expertId)}
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg p-3 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      📞 Call {selectedExpert.name}
                    </button>

                    {message && (
                      <div className="mt-6 bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
                        <p className="text-sm text-gray-800">{message}</p>
                        {sessionId && (
                          <p className="text-xs text-gray-600 mt-2">
                            Session: {sessionId}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-amber-400" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium">
                      Select an expert to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}