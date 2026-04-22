import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/ContextProvider";
import api from "../service/api";
import { Loader2, ArrowLeft, User, Search } from "lucide-react";
import { EXPERT_FIELDS, getSubFields } from "./expertFields";

// ── Expert card ───────────────────────────────────────────────────────────────

function ExpertCard({ expert, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
        selected
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
  );
}

// ── Expert detail panel ───────────────────────────────────────────────────────

function ExpertDetail({ expert, onCall, callStatus }) {
  const isCalling = callStatus === "pending";

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <User size={22} className="text-slate-500" />
          </div>
          <div>
            <h3
              className="font-semibold text-slate-900"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {expert.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{expert.field}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-6 space-y-2">
          <p className="text-sm text-slate-700">
            <span className="font-medium">Specialization:</span> {expert.subField}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">About:</span>{" "}
            <span className="text-slate-500">
              {expert.profileDescription || "No description available"}
            </span>
          </p>
          <p className="text-xs text-slate-400">
            Live since: {new Date(expert.liveSince).toLocaleTimeString()}
          </p>
        </div>

        <button
          onClick={onCall}
          disabled={isCalling}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isCalling ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "📞"
          )}
          {isCalling ? "Calling…" : `Call ${expert.name}`}
        </button>

        {callStatus && callStatus !== "idle" && (
          <div className="mt-5 bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <p className="text-sm text-slate-700 capitalize">{callStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Search sidebar ────────────────────────────────────────────────────────────

function SearchSidebar({
  field, subField, onFieldChange, onSubFieldChange,
  onSearch, loading, experts, selectedExpert, onSelectExpert,
}) {
  const subFields = getSubFields(field);

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Search size={15} className="text-slate-400" />
            Search Experts
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Field */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Field</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              value={field}
              onChange={(e) => { onFieldChange(e.target.value); onSubFieldChange(""); }}
            >
              <option value="">Select Field</option>
              {EXPERT_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Subfield */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Subfield</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 disabled:opacity-50"
              value={subField}
              onChange={(e) => onSubFieldChange(e.target.value)}
              disabled={!field}
            >
              <option value="">All subfields</option>
              {subFields.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={onSearch}
            disabled={!field || loading}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Search
          </button>
        </div>

        {/* Results list */}
        {loading && (
          <div className="border-t border-slate-100 py-8 flex justify-center">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        )}

        {!loading && experts.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
              {experts.length} Expert{experts.length !== 1 ? "s" : ""} Found
            </div>
            <div className="px-3 pb-3 space-y-1 max-h-80 overflow-y-auto">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert.expertId}
                  expert={expert}
                  selected={selectedExpert?.expertId === expert.expertId}
                  onClick={() => onSelectExpert(expert)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && experts.length === 0 && field && (
          <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
            No experts found. Try a broader search.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CallUser() {
  const navigate   = useNavigate();
  const { user, setSessionId } = useMyContext();
  const userId     = user?.id;

  const [field, setField]                   = useState("");
  const [subField, setSubField]             = useState("");
  const [experts, setExperts]               = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading]               = useState(false);
  const [callStatus, setCallStatus]         = useState("idle"); // idle | pending | accepted | rejected | error
  const [sse, setSse]                       = useState(null);
  const [searchError, setSearchError]       = useState(null);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => { sse?.close(); };
  }, [sse]);

  const handleSearch = async () => {
    if (!field) return;
    setLoading(true);
    setSearchError(null);
    try {
      const res = await api.get("/api/call/experts", { params: { field, subField: subField || undefined } });
      setExperts(res.data?.content ?? res.data ?? []);
      setSelectedExpert(null);
    } catch {
      setSearchError("Failed to fetch experts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startCall = useCallback((expertId) => {
    if (!userId) return;
    setCallStatus("pending");

    const token = localStorage.getItem("JWT_TOKEN");
    const url   = new URL(`${process.env.REACT_APP_SERVER_URL}/api/call/sse/user`);
    url.searchParams.set("userId", userId);
    url.searchParams.set("token", token);

    const emitter = new EventSource(url.toString(), { withCredentials: true });
    setSse(emitter);

    emitter.addEventListener("call-pending", () => setCallStatus("pending"));

    emitter.addEventListener("call-accepted", (e) => {
      setSessionId(e.data);
      setCallStatus("accepted");
      emitter.close();
      const id = e.data.replace("session-", "");
      navigate(`/user_session/${id}/${encodeURIComponent(selectedExpert?.name ?? "Expert")}`);
    });

    emitter.addEventListener("call-rejected", () => {
      setCallStatus("rejected");
      emitter.close();
      setSse(null);
    });

    emitter.onerror = () => {
      setCallStatus("error");
      emitter.close();
      setSse(null);
    };

    // Fire the call request after SSE is open
    api
      .post(`/api/call/request?userId=${userId}&expertId=${expertId}`)
      .catch(() => {
        setCallStatus("error");
        emitter.close();
        setSse(null);
      });
  }, [userId, selectedExpert, navigate, setSessionId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Find Experts
            </h1>
            <p className="text-xs text-slate-500">Connect with professionals instantly</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        <SearchSidebar
          field={field}
          subField={subField}
          onFieldChange={setField}
          onSubFieldChange={setSubField}
          onSearch={handleSearch}
          loading={loading}
          experts={experts}
          selectedExpert={selectedExpert}
          onSelectExpert={(e) => { setSelectedExpert(e); setCallStatus("idle"); }}
        />

        {/* Main panel */}
        <div className="flex-1">
          {searchError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {searchError}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl h-full min-h-[400px] overflow-hidden">
            {selectedExpert ? (
              <ExpertDetail
                expert={selectedExpert}
                callStatus={callStatus}
                onCall={() => startCall(selectedExpert.expertId)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center py-20">
                <div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Select an expert to view their profile
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}