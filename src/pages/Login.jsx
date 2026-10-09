import { useState } from "react";
import {
  Code2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from "lucide-react";
import {
  firebaseEnabled,
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  resetPassword
} from "../firebase";
import {
  saveRegisteredUser,
  getRegisteredUsers,
  AVAILABLE_ROLES,
  checkEmailRoleFromFirestore
} from "../utils/userDirectory";
import { logActivity } from "../utils/activityLogger";

export default function Login({ onDemoLogin, onAuthSuccess, onBack }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requestedRole, setRequestedRole] = useState("Developer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      try {
        setBusy(true);
        if (firebaseEnabled) {
          await resetPassword(email.trim());
          setMessage(`Password reset email sent to ${email}. Check your inbox!`);
        } else {
          setMessage(`[Demo Mode] Reset link simulated for ${email}.`);
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setBusy(false);
      }
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setBusy(true);
      const cleanEmail = email.trim().toLowerCase();
      const userList = getRegisteredUsers();
      const existingUser = userList.find((u) => u.email.toLowerCase() === cleanEmail);

      if (mode === "login") {
        if (firebaseEnabled) {
          const res = await loginWithEmail(cleanEmail, password);
          // Query role directly from Firestore (/admins and /users collections)
          const fsData = await checkEmailRoleFromFirestore(cleanEmail, res.user.uid);
          const role = fsData ? fsData.role : (existingUser?.role || null);
          const status = fsData?.status || (role ? "Active" : "Pending Approval");

          const userObj = {
            ...res.user,
            role,
            requestedRole: fsData?.requestedRole || existingUser?.requestedRole || "Developer",
            status
          };

          saveRegisteredUser({
            id: res.user.uid,
            name: res.user.displayName || cleanEmail.split("@")[0],
            email: res.user.email,
            role,
            status
          });

          logActivity({
            category: "AUTH",
            event: "User Login",
            details: `${res.user.displayName || cleanEmail} logged in. Role: ${role || "None (Pending)"}.`,
            actor: res.user.displayName || cleanEmail,
            role: role || "Pending"
          });

          if (onAuthSuccess) onAuthSuccess(userObj);
        } else {
          // Local simulation login
          const resolvedRole = existingUser ? existingUser.role : null;
          const displayName = existingUser?.name || cleanEmail.split("@")[0];

          if (onDemoLogin) {
            onDemoLogin(displayName, cleanEmail, resolvedRole);
          }
        }
      } else {
        // Register mode: Check if already registered in Firestore /admins
        if (!name.trim()) {
          setError("Please enter your name.");
          setBusy(false);
          return;
        }

        if (firebaseEnabled) {
          const res = await signupWithEmail(name.trim(), cleanEmail, password);
          // Look up if user is already present in Firestore /admins
          const fsData = await checkEmailRoleFromFirestore(cleanEmail, res.user.uid);
          const assignedRole = fsData ? fsData.role : null;
          const status = assignedRole ? "Active" : "Pending Approval";

          const userObj = {
            ...res.user,
            displayName: name.trim(),
            role: assignedRole,
            requestedRole,
            status
          };

          saveRegisteredUser({
            id: res.user.uid,
            name: name.trim(),
            email: cleanEmail,
            role: assignedRole,
            requestedRole,
            status: assignedRole ? "Active" : "Pending Approval"
          });

          logActivity({
            category: "AUTH",
            event: "New Registration",
            details: `Registered ${name.trim()} (${cleanEmail}). Requested role: '${requestedRole}'. Assigned role: ${assignedRole || "Pending Admin Approval"}.`,
            actor: name.trim(),
            role: assignedRole || "Pending"
          });

          if (onAuthSuccess) onAuthSuccess(userObj);
        } else {
          saveRegisteredUser({
            id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
            name: name.trim(),
            email: cleanEmail,
            role: assignedRole,
            requestedRole,
            status: assignedRole ? "Active" : "Pending Approval"
          });

          logActivity({
            category: "AUTH",
            event: "New Registration",
            details: `Registered ${name.trim()} (${cleanEmail}). Requested role: '${requestedRole}'. Awaiting Admin Approval.`,
            actor: name.trim(),
            role: assignedRole || "Pending"
          });

          if (onDemoLogin) {
            onDemoLogin(name.trim(), cleanEmail, assignedRole);
          }
        }
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setMessage("");
    try {
      setBusy(true);
      if (firebaseEnabled) {
        const res = await loginWithGoogle();
        const cleanEmail = res.user.email?.toLowerCase() || "";
        const userList = getRegisteredUsers();
        const existingUser = userList.find((u) => u.email.toLowerCase() === cleanEmail);
        const fsData = await checkEmailRoleFromFirestore(cleanEmail, res.user.uid);
        const role = fsData ? fsData.role : (existingUser?.role || null);
        const status = fsData?.status || (role ? "Active" : "Pending Approval");

        const userObj = {
          ...res.user,
          role,
          requestedRole: fsData?.requestedRole || existingUser?.requestedRole || "Developer",
          status
        };

        saveRegisteredUser({
          id: res.user.uid,
          name: res.user.displayName || cleanEmail.split("@")[0],
          email: res.user.email,
          role,
          status
        });

        logActivity({
          category: "AUTH",
          event: "Google Sign-In",
          details: `${res.user.displayName || cleanEmail} signed in with Google. Role: ${role || "None (Pending)"}.`,
          actor: res.user.displayName || cleanEmail,
          role: role || "Pending"
        });

        if (onAuthSuccess) onAuthSuccess(userObj);
      } else {
        if (onDemoLogin) onDemoLogin("Workspace User", "user@workspace.local", null);
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setBusy(false);
    }
  }

  function handleAuthError(err) {
    console.error("Auth error:", err);
    const messages = {
      "auth/invalid-credential": "Invalid email or password.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "This email is already registered. Try signing in.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password must contain at least 6 characters.",
      "auth/popup-closed-by-user": "Sign-in popup was closed before finishing.",
      "auth/operation-not-allowed": "This authentication method is not enabled in Firebase Console.",
      "auth/network-request-failed": "Network error. Please check your internet connection."
    };
    setError(messages[err?.code] || err?.message || "An authentication error occurred.");
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <div className="logo-box"><Code2 size={21} /></div>
          <div>
            <strong>MOCOSN</strong>
            <span>ELECTRO-BOTICS LAB</span>
          </div>
        </div>

        <div className="login-copy">
          <span className="eyebrow">Department of Electrical & Electronics Engineering</span>
          <h1>Manage your code.<br /><em>Build better systems.</em></h1>
          <p>
            Hardware builds, ROS 2 robotics telemetry, code repositories,
            and developer workspaces unified in one real-time dashboard.
          </p>
        </div>

        <div className="login-footer">© 2026 NBA VLSI & Robotics Lab · MOCOSN</div>
      </section>

      <section className="login-form-area">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="logo-box"><Code2 size={21} /></div>
            <strong>MOCOSN</strong>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "transparent",
                border: 0,
                fontSize: "12px",
                color: "var(--muted)",
                cursor: "pointer",
                marginBottom: "16px",
                padding: 0
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Laboratory Home</span>
            </button>
          )}

          <div className="form-heading">
            <h2>
              {mode === "login" && "Welcome back"}
              {mode === "register" && "Create account"}
              {mode === "forgot" && "Reset password"}
            </h2>
            <p>
              {mode === "login" && "Sign in with your workspace credentials."}
              {mode === "register" && "Select your requested role to request workspace access."}
              {mode === "forgot" && "Enter your email to receive a password reset link."}
            </p>
          </div>

          {/* Social Sign-In */}
          {mode !== "forgot" && (
            <div style={{ marginBottom: "18px" }}>
              <button
                type="button"
                className="google-sign-button"
                onClick={handleGoogleSignIn}
                disabled={busy}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="login-divider">
                <span>or continue with email</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label className="field">
                  <span>Full Name</span>
                  <div className="input-box">
                    <Code2 size={17} />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </label>

                {/* ROLE TYPE OPTION IN REGISTRATION */}
                <label className="field">
                  <span>Requested Role / Specialization</span>
                  <div className="input-box" style={{ padding: "0 8px" }}>
                    <Briefcase size={17} style={{ marginLeft: "4px" }} />
                    <select
                      value={requestedRole}
                      onChange={(e) => setRequestedRole(e.target.value)}
                      style={{
                        border: 0,
                        outline: 0,
                        background: "transparent",
                        width: "100%",
                        fontSize: "12px",
                        color: "var(--text)",
                        cursor: "pointer"
                      }}
                    >
                      {AVAILABLE_ROLES.filter((r) => r !== "Admin").map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#b45309",
                      background: "#fef3c7",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      marginTop: "6px",
                      lineHeight: "1.4"
                    }}
                  >
                    ⚠️ <strong>Access Gate Policy:</strong> If a role is not assigned by an Administrator, you will not have access to the dashboard.
                  </div>
                </label>
              </>
            )}

            <label className="field">
              <span>Email Address</span>
              <div className="input-box">
                <Mail size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  required
                />
              </div>
            </label>

            {mode !== "forgot" && (
              <label className="field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Password</span>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                      style={{ border: 0, background: "transparent", color: "#579cf5", fontSize: "10px", cursor: "pointer", fontWeight: "600" }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="input-box">
                  <Lock size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}

            {error && (
              <div className="form-error">
                <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {error}
              </div>
            )}

            {message && (
              <div style={{ padding: "10px 12px", background: "#edf9f3", color: "#1e7952", border: "1px solid #c2ebd5", borderRadius: "8px", fontSize: "10px", marginBottom: "14px" }}>
                <CheckCircle2 size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {message}
              </div>
            )}

            <button className="primary-button" style={{ width: "100%", height: "46px" }} disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign In" : mode === "register" ? "Create Account & Request Role" : "Send Reset Email"}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Form switchers */}
          <div className="form-switch">
            {mode === "login" && (
              <>
                Don&apos;t have an account?
                <button type="button" onClick={() => { setError(""); setMessage(""); setMode("register"); }}>
                  Create one
                </button>
              </>
            )}
            {mode === "register" && (
              <>
                Already have an account?
                <button type="button" onClick={() => { setError(""); setMessage(""); setMode("login"); }}>
                  Sign in
                </button>
              </>
            )}
            {mode === "forgot" && (
              <>
                Remember your password?
                <button type="button" onClick={() => { setError(""); setMessage(""); setMode("login"); }}>
                  Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}