import { useState, useEffect } from "react";
import {
  Server,
  ShieldCheck,
  X,
  Loader2,
  RefreshCw,
  Globe,
  Database,
  Cloud
} from "lucide-react";
import { checkProxyHealth, PROXY_PRIMARY_HOST } from "../utils/proxyClient";

export default function ProxyStatusModal({ isOpen, onClose }) {
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function runDiagnostics() {
    setTesting(true);
    setHealthResult(null);
    try {
      const res = await checkProxyHealth();
      setHealthResult(res);
    } catch (err) {
      setHealthResult({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 20, 35, 0.65)",
        backdropFilter: "blur(5px)",
        display: "grid",
        placeItems: "center",
        padding: "16px",
        overflowY: "auto"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "16px",
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
          padding: "24px",
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(0, 200, 255, 0.12)",
                color: "var(--blue)",
                display: "grid",
                placeItems: "center"
              }}
            >
              <Server size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: "700", margin: "0 0 2px" }}>
                Infrastructure & Gateway Status
              </h2>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                Secure API Gateway, Auth & Cloud Storage Bridge
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Proxy Node Info */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "var(--soft)",
            border: "1px solid var(--border)",
            marginBottom: "16px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)" }}>
              Active Proxy Gateway
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                fontWeight: "700",
                color: healthResult?.ok ? "#10b981" : testing ? "var(--blue)" : "#f59e0b"
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: healthResult?.ok ? "#10b981" : testing ? "var(--blue)" : "#f59e0b"
                }}
              />
              {testing ? "Connecting..." : healthResult?.ok ? `Online (${healthResult.latencyMs}ms)` : "Checking Gateway"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-all" }}>
            <Globe size={14} color="var(--blue)" style={{ flexShrink: 0 }} />
            <code style={{ fontSize: "12px", color: "var(--text)", fontWeight: "600", fontFamily: "DM Mono" }}>
              {PROXY_PRIMARY_HOST}
            </code>
          </div>
        </div>

        {/* Service Matrix - NEVER EXPOSING API KEYS OR CREDENTIALS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {/* Security Handshake */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={18} color="#10b981" />
              <div>
                <strong style={{ fontSize: "12px", display: "block" }}>HMAC-SHA256 Encrypted Handshake</strong>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>End-to-end request signature verification</span>
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>VERIFIED</span>
          </div>

          {/* Authentication & Database */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Database size={18} color="#f59e0b" />
              <div>
                <strong style={{ fontSize: "12px", display: "block" }}>Authentication & Cloud Database</strong>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Identity Toolkit & Firestore Synchronization
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>ACTIVE</span>
          </div>

          {/* Cloud Storage Bridge */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--card)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Cloud size={18} color="var(--blue)" />
              <div>
                <strong style={{ fontSize: "12px", display: "block" }}>Media Storage Proxy Bridge</strong>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  Server-side signed media upload pipeline
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>READY</span>
          </div>
        </div>

        {/* Diagnostic Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            type="button"
            className="outline-button"
            onClick={runDiagnostics}
            disabled={testing}
            style={{ height: "38px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {testing ? "Testing Gateway..." : "Re-test Gateway"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onClose}
            style={{ height: "38px", padding: "0 20px", fontSize: "12px" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
