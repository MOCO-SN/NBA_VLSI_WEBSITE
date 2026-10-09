import { useState } from "react";
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  LogOut,
  Mail,
  User,
  Briefcase,
  AlertTriangle
} from "lucide-react";
import { getRegisteredUsers } from "../utils/userDirectory";

export default function PendingAccess({ user, onLogout, onRefreshStatus, onBackHome }) {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");

  const handleCheck = async () => {
    setChecking(true);
    setCheckMessage("");

    try {
      if (onRefreshStatus) {
        const approved = await onRefreshStatus();
        if (!approved) {
          setCheckMessage("Verified with Firestore: Your role has not yet been assigned by an Administrator. Please check back shortly.");
        }
      }
    } catch {
      setCheckMessage("Could not verify status. Please try again.");
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        background: "var(--bg)"
      }}
    >
      <div
        className="panel"
        style={{
          width: "min(560px, 100%)",
          padding: "36px 30px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          borderRadius: "16px"
        }}
      >
        {/* Lock Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "#fef3c7",
            color: "#d97706",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 20px"
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: "22px", marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Access Restricted: Role Assignment Required
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.6", marginBottom: "24px" }}>
          Your account is registered, but an <strong>Administrator</strong> has not yet assigned or approved your role. You do not have access to the workspace dashboard until an official role is granted.
        </p>

        {/* User Status Card */}
        <div
          style={{
            background: "var(--soft)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "18px",
            textAlign: "left",
            marginBottom: "20px",
            fontSize: "12px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
            <span style={{ fontWeight: "700", color: "var(--muted)", fontSize: "10px", letterSpacing: "0.5px" }}>
              ACCOUNT IDENTIFICATION
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "3px 8px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <AlertTriangle size={11} /> Access Blocked
            </span>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={15} color="var(--muted)" />
              <span style={{ color: "var(--muted)", width: "105px" }}>Full Name:</span>
              <strong style={{ color: "var(--text)" }}>{user?.displayName || "New User"}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mail size={15} color="var(--muted)" />
              <span style={{ color: "var(--muted)", width: "105px" }}>Email:</span>
              <strong style={{ color: "var(--text)" }}>{user?.email}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={15} color="var(--muted)" />
              <span style={{ color: "var(--muted)", width: "105px" }}>Requested Role:</span>
              <span
                style={{
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontWeight: "600",
                  fontSize: "11px"
                }}
              >
                {user?.requestedRole || "Developer"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={15} color="var(--muted)" />
              <span style={{ color: "var(--muted)", width: "105px" }}>Assigned Role:</span>
              <strong style={{ color: "#d97706" }}>None (Pending Admin Review)</strong>
            </div>
          </div>
        </div>

        {checkMessage && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#fffbeb",
              color: "#92400e",
              border: "1px solid #fde68a",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textAlign: "left"
            }}
          >
            <Clock size={15} />
            <span>{checkMessage}</span>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary-button compact"
            onClick={handleCheck}
            disabled={checking}
            style={{ minWidth: "180px" }}
          >
            <RefreshCw size={15} className={checking ? "spin-icon" : ""} />
            {checking ? "Verifying..." : "Check Approval Status"}
          </button>

          <button
            type="button"
            className="outline-button"
            onClick={onLogout}
            style={{ minWidth: "100px" }}
          >
            <LogOut size={15} /> Sign Out
          </button>

          {onBackHome && (
            <button
              type="button"
              className="outline-button"
              onClick={onBackHome}
              style={{ minWidth: "120px" }}
            >
              Public Home →
            </button>
          )}
        </div>

        {/* Admin contact note */}
        <div
          style={{
            marginTop: "26px",
            paddingTop: "18px",
            borderTop: "1px solid var(--border)",
            fontSize: "11px",
            color: "var(--muted)",
            lineHeight: "1.6"
          }}
        >
          {(() => {
            const admin = getRegisteredUsers().find((u) => u.role === "Admin");
            if (admin) {
              return (
                <span>
                  Workspace Administrator: <strong>{admin.name}</strong> {admin.email && <code>({admin.email})</code>}
                </span>
              );
            }
            return (
              <span>
                Workspace Administrator: <strong>Designated in Firestore</strong>
              </span>
            );
          })()}
          <br />
          <small style={{ color: "#94a3b8" }}>
            Please contact the administrator to assign a role to your account. Once assigned, click &quot;Check Approval Status&quot; above to access the dashboard.
          </small>
        </div>
      </div>
    </main>
  );
}
