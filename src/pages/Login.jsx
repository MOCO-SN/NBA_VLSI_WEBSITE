import { useState } from "react";
import {
  Cpu,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  Activity,
  Code2,
  Bot
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

// ── Landy Design System Tokens (matching Landing.jsx) ─────────────────────────
const theme = {
  primary: "#18216d",       // Deep Landy navy blue
  secondary: "#ff825c",     // Vibrant Landy orange accent
  bg: "#ffffff",
  text: "#18216d",
  textSecondary: "#7a869a",
  grayBg: "#f5f7fa",
  border: "#eaeaea"
};

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
      let cleanEmail = email.trim().toLowerCase();

      if (mode === "register") {
        // Convert any email domain (like @gmail.com) to the official lab domain
        cleanEmail = cleanEmail.replace(/@.*/, "@mocosn.in");
      }

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
          setError("Please enter your full name.");
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

          window.alert(
            `Registration Successful!\n\n` +
            `Your official lab credentials have been generated:\n` +
            `Email: ${cleanEmail}\n` +
            `Password: (The password you just entered)\n\n` +
            `Please use these credentials for all future logins.`
          );

          if (onAuthSuccess) onAuthSuccess(userObj);
        } else {
          const assignedRole = null;
          saveRegisteredUser({
            id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`,
            name: name.trim(),
            email: cleanEmail,
            role: assignedRole,
            requestedRole,
            status: "Pending Approval"
          });

          logActivity({
            category: "AUTH",
            event: "New Registration",
            details: `Registered ${name.trim()} (${cleanEmail}). Requested role: '${requestedRole}'. Awaiting Admin Approval.`,
            actor: name.trim(),
            role: "Pending"
          });

          window.alert(
            `Registration Successful!\n\n` +
            `Your official lab credentials have been generated:\n` +
            `Email: ${cleanEmail}\n` +
            `Password: (The password you just entered)\n\n` +
            `Please use these credentials for all future logins.`
          );

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
          details: `${res.user.displayName || cleanEmail} authenticated with Google. Role: ${role || "None (Pending)"}.`,
          actor: res.user.displayName || cleanEmail,
          role: role || "Pending"
        });

        if (onAuthSuccess) onAuthSuccess(userObj);
      } else {
        const demoEmail = "engineer@mocosn.in";
        if (onDemoLogin) {
          onDemoLogin("Demo Engineer", demoEmail, "Developer");
        }
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
    <div style={{
      minHeight: "100vh",
      background: theme.grayBg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* ── Top Header Navigation ── */}
      <header style={{
        padding: "20px 32px",
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); if (onBack) onBack(); }}
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
        >
          <Cpu size={26} color={theme.primary} />
          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: theme.primary, letterSpacing: "-0.5px" }}>
            NBA VLSI
          </span>
        </a>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff",
              border: `1px solid ${theme.border}`,
              padding: "8px 18px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: 500,
              color: theme.text,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.primary;
              e.currentTarget.style.color = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.color = theme.text;
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        )}
      </header>

      {/* ── Main Dual-Panel Container ── */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "1020px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "36px",
          alignItems: "center"
        }}>

          {/* ════ LEFT: Landy Showcase Panel ════ */}
          <div style={{
            background: theme.bg,
            borderRadius: "24px",
            border: `1px solid ${theme.border}`,
            padding: "48px 40px",
            boxShadow: "0 10px 30px rgba(24, 33, 109, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            {/* Pill Tag */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "30px",
              background: "rgba(255, 130, 92, 0.12)",
              color: theme.secondary,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.6px",
              marginBottom: "24px",
              width: "fit-content"
            }}>
              <span>●</span> NBA ACCREDITED · ADVANCED RESEARCH
            </div>

            <h1 style={{
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 800,
              color: theme.text,
              lineHeight: 1.25,
              letterSpacing: "-0.8px",
              marginBottom: "18px"
            }}>
              The premier platform for VLSI & Robotics.
            </h1>

            <p style={{
              fontSize: "15px",
              color: theme.textSecondary,
              lineHeight: 1.65,
              marginBottom: "32px"
            }}>
              Turbocharge your engineering workflow with unified ASIC simulation,
              FPGA bitstream compilation, and live ROS 2 telemetry in one workspace.
            </p>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "36px" }}>
              {[
                { icon: Code2, title: "Silicon Design & FPGA Synthesis", desc: "RTL Verilog / VHDL logic verification" },
                { icon: Bot, title: "Autonomous Robotics & Kinematics", desc: "Edge compute & real-time ROS 2 integration" },
                { icon: Activity, title: "Official @mocosn.in Credentials", desc: "Direct OBE governance & attendance log" }
              ].map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(24, 33, 109, 0.06)",
                      color: theme.primary,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong style={{ fontSize: "13px", color: theme.text, display: "block" }}>{feat.title}</strong>
                      <span style={{ fontSize: "12px", color: theme.textSecondary }}>{feat.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: theme.grayBg,
              border: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <Cpu size={20} color={theme.secondary} />
              <span style={{ fontSize: "12px", color: theme.text, fontWeight: 500 }}>
                ECE & EEE Department • Hardware Research Laboratory
              </span>
            </div>
          </div>

          {/* ════ RIGHT: Form Card ════ */}
          <div style={{
            background: theme.bg,
            borderRadius: "24px",
            border: `1px solid ${theme.border}`,
            padding: "40px 36px",
            boxShadow: "0 15px 35px rgba(24, 33, 109, 0.06)"
          }}>
            {/* Pill Switcher */}
            <div style={{
              display: "flex",
              background: theme.grayBg,
              padding: "4px",
              borderRadius: "30px",
              marginBottom: "28px",
              border: `1px solid ${theme.border}`
            }}>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: "25px",
                  border: 0,
                  background: mode === "login" ? theme.primary : "transparent",
                  color: mode === "login" ? "#fff" : theme.textSecondary,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); setMessage(""); }}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: "25px",
                  border: 0,
                  background: mode === "register" ? theme.primary : "transparent",
                  color: mode === "register" ? "#fff" : theme.textSecondary,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Create Account
              </button>
            </div>

            {/* Heading */}
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: theme.text, margin: "0 0 6px" }}>
                {mode === "login" && "Welcome Back"}
                {mode === "register" && "Join Lab Workspace"}
                {mode === "forgot" && "Reset Password"}
              </h2>
              <p style={{ fontSize: "13px", color: theme.textSecondary, margin: 0 }}>
                {mode === "login" && "Enter your official lab credentials to continue."}
                {mode === "register" && "Register to obtain your verified @mocosn.in credentials."}
                {mode === "forgot" && "Enter your email to receive a password reset link."}
              </p>
            </div>

            {/* Social Google Sign-In */}
            {mode !== "forgot" && (
              <div style={{ marginBottom: "22px" }}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={busy}
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "30px",
                    border: `1.5px solid ${theme.border}`,
                    background: "#fff",
                    color: theme.text,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#c5c8d0";
                    e.currentTarget.style.background = "#fafbfd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0 0",
                  gap: "12px",
                  color: theme.textSecondary,
                  fontSize: "12px"
                }}>
                  <div style={{ flex: 1, height: "1px", background: theme.border }} />
                  <span>or with email</span>
                  <div style={{ flex: 1, height: "1px", background: theme.border }} />
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {mode === "register" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.text, marginBottom: "6px" }}>
                      Full Name
                    </label>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: theme.grayBg,
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: "12px",
                      padding: "0 14px",
                      height: "46px"
                    }}>
                      <User size={17} color={theme.textSecondary} />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        style={{
                          border: 0,
                          background: "transparent",
                          outline: 0,
                          width: "100%",
                          fontSize: "13px",
                          color: theme.text
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.text, marginBottom: "6px" }}>
                      Requested Specialization / Role
                    </label>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: theme.grayBg,
                      border: `1.5px solid ${theme.border}`,
                      borderRadius: "12px",
                      padding: "0 14px",
                      height: "46px"
                    }}>
                      <Briefcase size={17} color={theme.textSecondary} />
                      <select
                        value={requestedRole}
                        onChange={(e) => setRequestedRole(e.target.value)}
                        style={{
                          border: 0,
                          outline: 0,
                          background: "transparent",
                          width: "100%",
                          fontSize: "13px",
                          color: theme.text,
                          cursor: "pointer"
                        }}
                      >
                        {AVAILABLE_ROLES.filter((r) => r !== "Admin").map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <p style={{
                      fontSize: "11px",
                      color: "#b45309",
                      background: "#fef3c7",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      marginTop: "6px",
                      lineHeight: "1.4"
                    }}>
                      ⚠️ <strong>Access Gate Policy:</strong> Roles require Administrator verification before full workspace access.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: theme.text, marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: theme.grayBg,
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: "12px",
                  padding: "0 14px",
                  height: "46px"
                }}>
                  <Mail size={17} color={theme.textSecondary} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode === "register" ? "yourname@gmail.com" : "engineer@mocosn.in"}
                    required
                    style={{
                      border: 0,
                      background: "transparent",
                      outline: 0,
                      width: "100%",
                      fontSize: "13px",
                      color: theme.text
                    }}
                  />
                </div>
                {mode === "register" && (
                  <span style={{ fontSize: "11px", color: theme.textSecondary, marginTop: "4px", display: "block" }}>
                    ℹ️ Any email will automatically be converted to your official <strong>@mocosn.in</strong> lab login.
                  </span>
                )}
              </div>

              {mode !== "forgot" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: theme.text }}>Password</label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                        style={{
                          border: 0,
                          background: "transparent",
                          color: theme.primary,
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: theme.grayBg,
                    border: `1.5px solid ${theme.border}`,
                    borderRadius: "12px",
                    padding: "0 14px",
                    height: "46px"
                  }}>
                    <Lock size={17} color={theme.textSecondary} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        border: 0,
                        background: "transparent",
                        outline: 0,
                        width: "100%",
                        fontSize: "13px",
                        color: theme.text
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      style={{ border: 0, background: "none", color: theme.textSecondary, cursor: "pointer", padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Success message */}
              {message && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#ecfdf5",
                  color: "#059669",
                  border: "1px solid #a7f3d0",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <CheckCircle2 size={15} />
                  <span>{message}</span>
                </div>
              )}

              {/* Main Submit Button (Landy Pill Style) */}
              <button
                type="submit"
                disabled={busy}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "30px",
                  border: 0,
                  background: theme.secondary,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(255, 130, 92, 0.35)",
                  transition: "all 0.2s ease",
                  marginTop: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!busy) e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {busy ? "Please wait..." : mode === "login" ? "Sign In to Workspace" : mode === "register" ? "Create Account & Request Role" : "Send Reset Email"}
                {!busy && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Switchers */}
            <div style={{ textAlign: "center", marginTop: "22px", fontSize: "12px", color: theme.textSecondary }}>
              {mode === "login" && (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => { setError(""); setMessage(""); setMode("register"); }}
                    style={{ border: 0, background: "transparent", color: theme.secondary, fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Create one here
                  </button>
                </>
              )}
              {mode === "register" && (
                <>
                  Already registered with an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setError(""); setMessage(""); setMode("login"); }}
                    style={{ border: 0, background: "transparent", color: theme.secondary, fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Sign in here
                  </button>
                </>
              )}
              {mode === "forgot" && (
                <>
                  Remembered your password?{" "}
                  <button
                    type="button"
                    onClick={() => { setError(""); setMessage(""); setMode("login"); }}
                    style={{ border: 0, background: "transparent", color: theme.secondary, fontWeight: 700, cursor: "pointer", padding: 0 }}
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        padding: "20px 24px",
        textAlign: "center",
        borderTop: `1px solid ${theme.border}`,
        background: theme.bg,
        fontSize: "12px",
        color: theme.textSecondary
      }}>
        © 2026 NBA VLSI & Robotics Lab · All Rights Reserved
      </footer>
    </div>
  );
}