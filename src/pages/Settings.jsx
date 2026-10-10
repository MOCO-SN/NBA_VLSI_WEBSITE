import { useState } from "react";
import { Save, Bell, Moon, Shield, Trash2, CheckCircle2 } from "lucide-react";
import { auth, firebaseEnabled, resetPassword } from "../firebase";
import { deleteUser } from "firebase/auth";

export default function Settings({ user, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem("mocosn_theme") || "Light");
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem("mocosn_notif_email") !== "false";
  });
  const [projectNotifications, setProjectNotifications] = useState(() => {
    return localStorage.getItem("mocosn_notif_project") !== "false";
  });
  const [saved, setSaved] = useState(false);
  const [secMessage, setSecMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    document.documentElement.dataset.theme = newTheme.toLowerCase();
    localStorage.setItem("mocosn_theme", newTheme);
  }

  function handleEmailNotifToggle() {
    const next = !emailNotifications;
    setEmailNotifications(next);
    localStorage.setItem("mocosn_notif_email", String(next));
  }

  function handleProjectNotifToggle() {
    const next = !projectNotifications;
    setProjectNotifications(next);
    localStorage.setItem("mocosn_notif_project", String(next));
  }

  async function handlePasswordReset() {
    setSecMessage("");
    setBusy(true);
    try {
      if (firebaseEnabled && user?.email && auth?.currentUser) {
        await resetPassword(user.email);
        setSecMessage(`Password reset link sent to ${user.email}. Check your inbox!`);
      } else {
        setSecMessage(`Password reset link simulated for ${user?.email || "your account"}.`);
      }
      setTimeout(() => setSecMessage(""), 5000);
    } catch (err) {
      alert(err.message || "Could not send password reset email.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? All uploaded files, settings, and workspace data will be removed. This cannot be undone."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      if (firebaseEnabled && auth?.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (err) {
          if (err.code === "auth/requires-recent-login") {
            alert("For security, please log out and sign back in before deleting your account.");
            return;
          }
          throw err;
        }
      }

      // Clear local storage workspace keys
      if (user?.uid) {
        localStorage.removeItem(`mocosn_files_${user.uid}`);
        localStorage.removeItem(`mocosn_project_${user.uid}`);
      }
      localStorage.removeItem("mocosn_username");
      localStorage.removeItem("mocosn_bio");
      localStorage.removeItem("mocosn_avatar");

      alert("Account and workspace data have been deleted.");
      if (onLogout) {
        await onLogout();
      }
    } catch (err) {
      alert(err.message || "Failed to delete account.");
    } finally {
      setBusy(false);
    }
  }

  function save() {
    localStorage.setItem("mocosn_theme", theme);
    localStorage.setItem("mocosn_notif_email", String(emailNotifications));
    localStorage.setItem("mocosn_notif_project", String(projectNotifications));
    document.documentElement.dataset.theme = theme.toLowerCase();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Settings</h1>
          <p>Control your dashboard theme, security, and notification preferences.</p>
        </div>
      </div>

      <div className="settings-list">
        <SettingSection icon={Moon} title="Appearance" description="Customize how the dashboard looks.">
          <div className="setting-row">
            <div><strong>Theme</strong><span>Choose your dashboard theme.</span></div>
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
        </SettingSection>

        <SettingSection icon={Bell} title="Notifications" description="Choose what notifications you receive.">
          <ToggleRow
            title="Email notifications"
            text="Receive account notifications by email."
            checked={emailNotifications}
            onToggle={handleEmailNotifToggle}
          />
          <ToggleRow
            title="Project notifications"
            text="Receive updates about your uploaded code."
            checked={projectNotifications}
            onToggle={handleProjectNotifToggle}
          />
        </SettingSection>

        <SettingSection icon={Shield} title="Security" description="Manage account security options.">
          <div className="setting-row">
            <div>
              <strong>Password Reset</strong>
              <span>Send a secure password reset email to {user?.email || "your email"}.</span>
            </div>
            <button
              className="outline-button"
              type="button"
              onClick={handlePasswordReset}
              disabled={busy}
            >
              Send Reset Link
            </button>
          </div>
          {secMessage && (
            <div style={{ marginTop: "12px", padding: "8px 12px", background: "#edf9f3", color: "#1e7952", border: "1px solid #c2ebd5", borderRadius: "8px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={15} />
              <span>{secMessage}</span>
            </div>
          )}
        </SettingSection>

        <section className="danger-panel">
          <div>
            <Trash2 size={20} />
            <div>
              <h2>Danger Zone</h2>
              <p>Deleting your account permanently removes your workspace, files, and profile credentials.</p>
            </div>
            <button
              className="danger-button"
              type="button"
              onClick={handleDeleteAccount}
              disabled={busy}
            >
              Delete Account
            </button>
          </div>
        </section>

        <div className="form-actions settings-save">
          {saved && <span className="save-success">Settings saved successfully.</span>}
          <button className="primary-button compact" onClick={save}>
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </>
  );
}

function SettingSection({ icon: Icon, title, description, children }) {
  return (
    <section className="panel settings-section">
      <div className="settings-title">
        <div className="settings-icon"><Icon size={18} /></div>
        <div><h2>{title}</h2><p>{description}</p></div>
      </div>
      <div className="settings-content">{children}</div>
    </section>
  );
}

function ToggleRow({ title, text, checked, onToggle }) {
  return (
    <div
      className="setting-row"
      style={{
        cursor: "pointer",
        userSelect: "none",
        padding: "14px 0",
        transition: "background 0.15s ease"
      }}
      onClick={onToggle}
    >
      <div style={{ flex: 1, paddingRight: "16px" }}>
        <strong style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", display: "block" }}>
          {title}
        </strong>
        <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px", display: "block", lineHeight: "1.4" }}>
          {text}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? "on" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={`Toggle ${title}`}
        style={{
          width: "46px",
          height: "26px",
          borderRadius: "20px",
          border: 0,
          background: checked ? "var(--blue)" : "#cbd5e1",
          cursor: "pointer",
          padding: "3px",
          transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "inline-flex",
          alignItems: "center",
          flexShrink: 0,
          outline: "none",
          boxShadow: checked ? "0 2px 8px rgba(26,127,212,0.25)" : "inset 0 1px 2px rgba(0,0,0,0.06)"
        }}
      >
        <span
          style={{
            display: "block",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            transform: checked ? "translateX(20px)" : "translateX(0px)",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      </button>
    </div>
  );
}