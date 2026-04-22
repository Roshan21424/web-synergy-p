import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/ContextProvider";
import api from "../service/api";
import { Loader2, ArrowLeft, Phone, PhoneOff, Wifi, WifiOff } from "lucide-react";
import { EXPERT_FIELDS, getSubFields } from "./ExpertFields";

// ── Field selector sub-component ─────────────────────────────────────────────

function FieldSelector({ field, subField, onFieldChange, onSubFieldChange }) {
  const subFields = getSubFields(field);

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Field
        </label>
        <select
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          value={field}
          onChange={(e) => { onFieldChange(e.target.value); onSubFieldChange(""); }}
        >
          <option value="">Select your primary field</option>
          {EXPERT_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Specialization
        </label>
        <select
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          value={subField}
          onChange={(e) => onSubFieldChange(e.target.value)}
          disabled={!field}
        >
          <option value="">Select your specialization</option>
          {subFields.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </>
  );
}

// ── Incoming call banner ──────────────────────────────────────────────────────

function IncomingCallBanner({ call, onAccept, onReject, loading }) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Phone size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Incoming Call</p>
          <p className="text-xs text-slate-500">User ID: {call.fromUser}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
          Accept
        </button>
        <button
          onClick={onReject}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <PhoneOff size={16} />
          Decline
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Expert() {
  const [incomingCall, setIncomingCall]   = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [connected, setConnected]         = useState(false);
  const [sse, setSse]                     = useState(null);
  const [callLoading, setCallLoading]     = useState(false);
  const [field, setField]                 = useState("");
  const [subField, setSubField]           = useState("");
  const [sseError, setSseError]           = useState(null);

  const navigate   = useNavigate();
  const { user, sessionId, setSessionId } = useMyContext();
  const expertId   = user?.id;
  const token      = localStorage.getItem("JWT_TOKEN");

  // Clean up SSE on unmount or when it changes
  useEffect(() => {
    return () => { sse?.close(); };
  }, [sse]);

  const connectExpert = useCallback(() => {
    if (!field || !subField) return;
    setSseError(null);

    const url = new URL(`${process.env.REACT_APP_SERVER_URL}/api/call/sse/expert`);
    url.searchParams.set("expertId", expertId);
    url.searchParams.set("field", field);
    url.searchParams.set("subField", subField);
    url.searchParams.set("token", token);

    const emitter = new EventSource(url.toString(), { withCredentials: true });
    setSse(emitter);
    setConnected(true);

    emitter.addEventListener("INIT",          (e) => setStatusMessage(e.data));
    emitter.addEventListener("heartbeat",     ()  => {}); // keep-alive, no UI action needed
    emitter.addEventListener("incoming-call", (e) => setIncomingCall({ fromUser: e.data }));

    emitter.addEventListener("call-accepted", (e) => {
      setSessionId(e.data);
      setStatusMessage("Call accepted");
      navigate(`/expert_session/${e.data.replace("session-", "")}`);
    });

    emitter.addEventListener("call-rejected", (e) => {
      setStatusMessage(`Call declined (${e.data})`);
      setIncomingCall(null);
    });

    emitter.onerror = () => {
      setSseError("Connection lost. Please reconnect.");
      emitter.close();
      setConnected(false);
      setSse(null);
    };
  }, [field, subField, expertId, token, navigate, setSessionId]);

  const acceptCall = async () => {
    if (!incomingCall) return;
    setCallLoading(true);
    try {
      await api.post(`/api/call/accept?expertId=${expertId}&userId=${incomingCall.fromUser}`);
      setIncomingCall(null);
    } catch {
      setStatusMessage("Failed to accept call. Please try again.");
    } finally {
      setCallLoading(false);
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;
    try {
      await api.post(`/api/call/reject?expertId=${expertId}&userId=${incomingCall.fromUser}`);
    } catch {
      // best-effort
    } finally {
      setIncomingCall(null);
    }
  };

  const disconnect = () => {
    sse?.close();
    setSse(null);
    setConnected(false);
    setIncomingCall(null);
    setStatusMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
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
              Expert Portal
            </h1>
            <p className="text-xs text-slate-500">
              Connect with users seeking your expertise
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                {connected ? "You're Online" : "Setup Your Profile"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {connected
                  ? "Waiting for incoming calls"
                  : "Configure your specialization to start receiving calls"}
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 text-xs font-medium ${
                connected ? "text-green-600" : "text-slate-400"
              }`}
            >
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "Online" : "Offline"}
            </div>
          </div>

          <div className="p-6">
            {sseError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {sseError}
              </div>
            )}

            {!connected ? (
              <div className="space-y-5">
                <FieldSelector
                  field={field}
                  subField={subField}
                  onFieldChange={setField}
                  onSubFieldChange={setSubField}
                />
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
                {/* Status strip */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-800">
                        Connected &amp; Ready
                      </span>
                    </div>
                    <button
                      onClick={disconnect}
                      className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                    >
                      Go offline
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    <span className="font-medium">Specialization:</span> {field} — {subField}
                  </p>
                </div>

                {/* Incoming call */}
                {incomingCall && !sessionId && (
                  <IncomingCallBanner
                    call={incomingCall}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                    loading={callLoading}
                  />
                )}

                {statusMessage && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                    <p className="text-sm text-slate-700">{statusMessage}</p>
                    {sessionId && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Session: {sessionId}
                      </p>
                    )}
                  </div>
                )}

                {!incomingCall && !statusMessage && (
                  <div className="text-center py-10 text-slate-400">
                    <Phone size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Waiting for calls…</p>
                    <p className="text-xs mt-1">
                      You'll be notified when someone requests your expertise
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}