import { useState } from "react";
import {
  Cpu,
  Bot,
  Radio,
  Menu,
  X,
  Code2,
  Activity,
  CheckCircle2,
  Moon,
  Sun,
  Send,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck
} from "lucide-react";
import { saveContactMessage } from "../utils/contactMessages";

const Container = ({ children }) => (
  <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
    {children}
  </div>
);

export default function Landing({ onGetStarted, onSignIn, user }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.dataset.theme || "light";
    }
    return "light";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function toggleTheme() {
    const next = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("mocosn_theme", next === "dark" ? "Dark" : "Light");
  }

  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Research", href: "#mission" },
    { label: "Telemetry", href: "#product" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: "background 0.25s ease, color 0.25s ease"
      }}
    >
      {/* ── Top Header Bar ── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          {/* Brand Logo */}
          <a href="#" className="landing-brand">
            <div className="landing-brand-logo">
              <Cpu size={22} />
            </div>
            <div className="landing-brand-text">
              <span className="landing-brand-title">DEVELOPMENT CLUB</span>
              <span className="landing-brand-sub">RESEARCH & ROBOTICS LAB</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-desktop">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons & Theme Switcher */}
          <div className="landing-header-right">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--text)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              title={currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {currentTheme === "dark" ? <Sun size={17} color="#ffc83b" /> : <Moon size={17} color="var(--blue)" />}
            </button>

            {/* Desktop Account / Access Buttons */}
            <div className="landing-actions-desktop">
              {user ? (
                <button
                  className="primary-button compact"
                  onClick={onGetStarted}
                  style={{ height: "38px", padding: "0 18px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Activity size={14} /> Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    className="outline-button compact landing-signin-btn"
                    onClick={onSignIn}
                    style={{ height: "38px", padding: "0 16px", fontSize: "12px", background: "var(--card)" }}
                  >
                    Sign In
                  </button>
                  <button
                    className="primary-button compact landing-access-btn"
                    onClick={onGetStarted}
                    style={{ height: "38px", padding: "0 18px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    Get Started <ArrowRight size={13} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              className="landing-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <>
            <div className="landing-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />
            <div className="landing-mobile-dropdown">
              <div className="landing-mobile-links">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="landing-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="landing-mobile-actions" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {user ? (
                  <button
                    className="primary-button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onGetStarted();
                    }}
                    style={{ width: "100%", height: "42px", justifyContent: "center" }}
                  >
                    Open Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      className="outline-button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSignIn();
                      }}
                      style={{ width: "100%", height: "40px", justifyContent: "center", background: "var(--card)" }}
                    >
                      Sign In
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onGetStarted();
                      }}
                      style={{ width: "100%", height: "40px", justifyContent: "center" }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section style={{ padding: "90px 0 80px", position: "relative", overflow: "hidden" }}>
        <Container>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "60px",
              flexWrap: "wrap"
            }}
          >
            {/* Left Column: Heading & Description */}
            <div style={{ flex: "1 1 480px" }}>
              <div
                className="eyebrow"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  background: "var(--soft)",
                  padding: "5px 14px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  marginBottom: "18px",
                  color: "var(--blue)",
                  fontWeight: 600
                }}
              >
                <Sparkles size={13} color="var(--blue)" />
                DEVELOPMENT CLUB · RESEARCH ECOSYSTEM
              </div>

              <h1
                style={{
                  fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-1.2px",
                  marginBottom: "20px",
                  color: "var(--text)"
                }}
              >
                Advanced Silicon &{" "}
                <span style={{ color: "var(--blue)" }}>Robotics Engineering</span> Platform
              </h1>

              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  marginBottom: "32px",
                  maxWidth: "540px"
                }}
              >
                A unified deep-tech environment connecting FPGA synthesis, custom ASIC architectures, ROS 2 autonomous robotics telemetry, and Outcome-Based Education (OBE) metrics.
              </p>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className="primary-button"
                  onClick={onGetStarted}
                  style={{
                    height: "46px",
                    padding: "0 28px",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {user ? "Enter Workspace" : "Get Started Now"} <ArrowRight size={16} />
                </button>

                {!user && (
                  <button
                    className="outline-button"
                    onClick={onSignIn}
                    style={{
                      height: "46px",
                      padding: "0 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      background: "var(--card)",
                      borderColor: "var(--border)"
                    }}
                  >
                    Member Sign In
                  </button>
                )}
              </div>

              {/* Badges / Tech Strip */}
              <div style={{ display: "flex", gap: "16px", marginTop: "40px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--muted)", fontWeight: 500 }}>
                  <ShieldCheck size={16} color="#10b981" /> Verified OBE Outcomes
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: "var(--muted)", fontWeight: 500 }}>
                  <Layers size={16} color="var(--blue)" /> ROS 2 & ASIC Kinematics
                </div>
              </div>
            </div>

            {/* Right Column: High-Tech Illustration Frame */}
            <div style={{ flex: "1 1 420px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  borderRadius: "20px",
                  background: "var(--card)",
                  border: "1.5px solid var(--border)",
                  boxShadow: "0 20px 48px rgba(10, 30, 60, 0.12)",
                  padding: "36px 30px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  overflow: "hidden"
                }}
              >
                {/* Radial Glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)",
                    pointerEvents: "none"
                  }}
                />

                <div
                  style={{
                    width: "110px",
                    height: "110px",
                    borderRadius: "28px",
                    background: "var(--soft)",
                    border: "1px solid var(--border)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 10px 25px rgba(26, 127, 212, 0.15)"
                  }}
                >
                  <Activity size={54} color="var(--blue)" strokeWidth={1.8} />
                </div>

                <div style={{ textAlign: "center", zIndex: 1 }}>
                  <span style={{ fontSize: "11px", fontFamily: "DM Mono", color: "var(--blue)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    TELEMETRY & HARDWARE BUS
                  </span>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "6px 0 4px", color: "var(--text)" }}>
                    Real-Time Lab Bench Stream
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, maxWidth: "300px" }}>
                    Continuous logic analysis, CAN Bus protocol frames, and ROS 2 autonomy nodes.
                  </p>
                </div>

                {/* Floating Metric Pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}>
                  <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "12px", background: "var(--soft)", border: "1px solid var(--border)", fontWeight: 600, color: "var(--text)" }}>
                    FPGA Vivado 2026
                  </span>
                  <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "12px", background: "var(--soft)", border: "1px solid var(--border)", fontWeight: 600, color: "var(--text)" }}>
                    RISC-V 64-bit
                  </span>
                  <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "12px", background: "var(--soft)", border: "1px solid var(--border)", fontWeight: 600, color: "var(--blue)" }}>
                    CAN-Bus Telemetry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── MIDDLE BANNER: ACCREDITATION & OBE STANDARDS ── */}
      <section
        style={{
          padding: "70px 0",
          background: "var(--soft)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          textAlign: "center"
        }}
      >
        <Container>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <span
              style={{
                fontFamily: "DM Mono",
                fontSize: "11px",
                color: "var(--blue)",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase"
              }}
            >
              OUTCOME-BASED EDUCATION · OBE ALIGNMENT
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.6px",
                margin: "12px 0 16px",
                color: "var(--text)"
              }}
            >
              Rigorous Engineering Evaluation & Governance
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "32px" }}>
              Our laboratory workspace aligns microelectronics curricula, firmware repositories, and kinematics algorithms directly with Program Outcomes (POs) and Course Outcomes (COs).
            </p>
            <button
              className="outline-button"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                height: "40px",
                padding: "0 22px",
                fontSize: "13px",
                background: "var(--card)",
                borderColor: "var(--border)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Explore Lab Capabilities <ArrowRight size={14} />
            </button>
          </div>
        </Container>
      </section>

      {/* ── SECTION 1: SILICON DESIGN & FPGA SYNTHESIS ── */}
      <section id="about" style={{ padding: "90px 0", background: "var(--bg)" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: "60px", flexWrap: "wrap" }}>
            {/* Left Graphic */}
            <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "18px",
                  background: "var(--card)",
                  border: "1.5px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  padding: "36px",
                  display: "grid",
                  placeItems: "center",
                  position: "relative"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(26, 127, 212, 0.08) 0%, transparent 70%)"
                  }}
                />
                <Code2 size={100} color="var(--blue)" strokeWidth={1.5} />
              </div>
            </div>

            {/* Right Text */}
            <div style={{ flex: "1 1 420px" }}>
              <div className="eyebrow" style={{ color: "var(--blue)" }}>MICROELECTRONICS & ASIC</div>
              <h2 style={{ fontSize: "2.3rem", fontWeight: 800, color: "var(--text)", margin: "8px 0 16px", letterSpacing: "-0.8px" }}>
                Silicon Design & FPGA Synthesis
              </h2>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "24px" }}>
                From register-transfer level (RTL) logic in Verilog and SystemVerilog to full custom ASIC layouts and high-speed multi-layer PCB design. Equipped with industry-standard EDA tooling and Xilinx Artix-7 hardware testbenches.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ Verilog & VHDL Synthesis
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ JTAG Hardware Debugging
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ Logic Analyzer Benches
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ RISC-V Microarchitecture
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 2: AUTONOMOUS ROBOTICS ── */}
      <section id="mission" style={{ padding: "90px 0", background: "var(--card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: "60px", flexWrap: "wrap", flexDirection: "row-reverse" }}>
            {/* Right Graphic */}
            <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "18px",
                  background: "var(--soft)",
                  border: "1.5px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  padding: "36px",
                  display: "grid",
                  placeItems: "center",
                  position: "relative"
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(0, 200, 255, 0.1) 0%, transparent 70%)"
                  }}
                />
                <Bot size={100} color="var(--blue)" strokeWidth={1.5} />
              </div>
            </div>

            {/* Left Text */}
            <div style={{ flex: "1 1 420px" }}>
              <div className="eyebrow" style={{ color: "var(--blue)" }}>KINEMATICS & CONTROL</div>
              <h2 style={{ fontSize: "2.3rem", fontWeight: 800, color: "var(--text)", margin: "8px 0 16px", letterSpacing: "-0.8px" }}>
                Autonomous Robotics & Edge Kinematics
              </h2>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "24px" }}>
                Real-time edge compute, SLAM mapping, sensor fusion, and closed-loop motor control powered by ROS 2 Humble. Seamlessly bridge hardware bus peripherals to high-level trajectory planners.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--card)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ ROS 2 Node Architecture
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--card)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ LiDAR & Depth SLAM
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--card)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ Jetson Edge Acceleration
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--card)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ CAN Bus Motor Nodes
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 3: WIRELESS TELEMETRY & IOT ── */}
      <section id="product" style={{ padding: "90px 0", background: "var(--bg)" }}>
        <Container>
          <div style={{ display: "flex", alignItems: "center", gap: "60px", flexWrap: "wrap" }}>
            {/* Left Graphic */}
            <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  borderRadius: "18px",
                  background: "var(--card)",
                  border: "1.5px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  padding: "36px",
                  display: "grid",
                  placeItems: "center",
                  position: "relative"
                }}
              >
                <Radio size={100} color="var(--blue)" strokeWidth={1.5} />
              </div>
            </div>

            {/* Right Text */}
            <div style={{ flex: "1 1 420px" }}>
              <div className="eyebrow" style={{ color: "var(--blue)" }}>IOT & COMMUNICATIONS</div>
              <h2 style={{ fontSize: "2.3rem", fontWeight: 800, color: "var(--text)", margin: "8px 0 16px", letterSpacing: "-0.8px" }}>
                High-Frequency Wireless Telemetry
              </h2>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.65, marginBottom: "24px" }}>
                Stream real-time sensor packets from field rovers and bench instruments via CAN, LoRaWAN, and MQTT architectures. Ingest raw frames into secure database pipelines with zero latency.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ LoRaWAN Long-Range Nodes
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ MQTT Cloud Ingestion
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ Oscilloscope Capture
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 600 }}>
                  ✓ Spectrum Analyzers
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── CONTACT & INQUIRY FORM ── */}
      <ContactSection />

      {/* ── FOOTER ── */}
      <footer style={{ padding: "40px 0", background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="landing-brand-logo" style={{ width: "32px", height: "32px", borderRadius: "8px" }}>
                <Cpu size={18} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
                DEVELOPMENT CLUB
              </span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
              © 2026 Development Club & Robotics Research Lab. All Rights Reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setBusy(true);
    try {
      await saveContactMessage({ name, email, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Failed to submit contact:", err);
      alert("Failed to submit message. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" style={{ padding: "90px 0", background: "var(--soft)", borderTop: "1px solid var(--border)" }}>
      <Container>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "flex-start" }}>
          {/* Left Info */}
          <div style={{ flex: "1 1 360px" }}>
            <div className="eyebrow" style={{ color: "var(--blue)" }}>GET IN TOUCH</div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 800, color: "var(--text)", margin: "8px 0 16px", letterSpacing: "-0.8px" }}>
              Connect with Lab Leads
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.65 }}>
              Interested in joining our Outcome-Based engineering research or collaborating on sponsored semiconductor / robotics projects? Reach out to our faculty and administrative team.
            </p>
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: "var(--muted)" }}>
              <div>📍 Department of Electrical & Electronics Engineering</div>
              <div>⚡ Outcome-Based Education (OBE) Research Wing</div>
              <div>✉️ Direct inquiries routed to Admin Governance Console</div>
            </div>
          </div>

          {/* Right Form Card */}
          <div style={{ flex: "1 1 420px" }}>
            <div
              style={{
                background: "var(--card)",
                borderRadius: "18px",
                border: "1.5px solid var(--border)",
                padding: "32px",
                boxShadow: "var(--shadow)"
              }}
            >
              {submitted && (
                <div
                  style={{
                    padding: "14px 18px",
                    background: "#ecfdf5",
                    color: "#059669",
                    borderRadius: "10px",
                    border: "1px solid #a7f3d0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "20px",
                    fontSize: "13px",
                    fontWeight: 600
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Thank you! Your message has been routed to the Admin Console.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      borderRadius: "9px",
                      border: "1px solid var(--border)",
                      background: "var(--soft)",
                      fontSize: "13px",
                      outline: "none",
                      color: "var(--text)"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@university.edu"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 14px",
                      borderRadius: "9px",
                      border: "1px solid var(--border)",
                      background: "var(--soft)",
                      fontSize: "13px",
                      outline: "none",
                      color: "var(--text)"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
                    Inquiry Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your research collaboration proposal or student application..."
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "9px",
                      border: "1px solid var(--border)",
                      background: "var(--soft)",
                      fontSize: "13px",
                      outline: "none",
                      color: "var(--text)",
                      resize: "vertical"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="primary-button"
                  style={{
                    height: "44px",
                    width: "100%",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <Send size={15} /> {busy ? "Sending Inquiry..." : "Submit Inquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
