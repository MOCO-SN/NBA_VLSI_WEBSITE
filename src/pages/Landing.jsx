import { useState } from "react";
import {
  Cpu,
  Bot,
  Radio,
  Zap,
  ArrowRight,
  Activity,
  Terminal,
  CheckCircle2,
  Award,
  Lock,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Code2,
  Layers,
} from "lucide-react";

/* ─── tiny inline style helpers ────────────────────────────────────── */
const flex = (extra = {}) => ({ display: "flex", alignItems: "center", ...extra });

/* ─── B&W design tokens ─────────────────────────────────────────────── */
const C = {
  bg:          "#F3F5F9",          // near-black page background
  surface:     "#819FA7",          // panel / card background
  surfaceHigh: "#F2F2F0",          // elevated surface
  border:      "rgba(255,255,255,0.08)",
  borderStrong:"rgba(255,255,255,0.14)",
  text:        "#080808",          // primary text
  textMuted:   "rgba(0,0,0,0.45)",
  textDim:     "rgba(255,255,255,0.22)",
  accent:      "#ffffff",          // accent = white
  accentBg:    "rgba(255,255,255,0.06)",
  accentBgHov: "rgba(255,255,255,0.10)",
  mono:        "'DM Mono', monospace",
};

export default function Landing({ onGetStarted, onSignIn, user }) {
  const [activeTab, setActiveTab] = useState("vlsi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: `1px solid ${C.border}`,
          background: "rgba(8,8,8,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, ...flex({ justifyContent: "space-between" }) }}>

          {/* Brand */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ ...flex({ gap: 10 }), textDecoration: "none" }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", ...flex({ justifyContent: "center" }) }}>
              <Cpu size={16} color="#080808" />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "#fff", display: "block", letterSpacing: 0.2 }}>NBA • VLSI LAB</strong>
              <span style={{ fontSize: 9, color: C.textDim, fontFamily: C.mono, letterSpacing: 1 }}>EEE DEPT</span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="landing-nav-desktop" style={flex({ gap: 4 })}>
            {[
              { label: "Research",         href: "#domains" },
              { label: "Lab Architecture", href: "#showcase" },
              { label: "NBA Accreditation",href: "#nba-outcomes" },
              { label: "Equipment",        href: "#specs" },
            ].map((item) => (
              <a key={item.label} href={item.href}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, color: C.textMuted, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = C.textMuted)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div style={flex({ gap: 10 })}>
            <div className="landing-actions-desktop" style={flex({ gap: 10 })}>
              {user ? (
                <button onClick={onGetStarted}
                  style={{ ...flex({ gap: 6 }), height: 36, padding: "0 16px", borderRadius: 8, border: 0, background: "#fff", color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Enter Workspace <ArrowRight size={13} />
                </button>
              ) : (
                <>
                  <button onClick={onSignIn}
                    style={{ height: 36, padding: "0 16px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: "transparent", color: C.textMuted, fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                  >
                    Sign In
                  </button>
                  <button onClick={onGetStarted}
                    style={{ ...flex({ gap: 6 }), height: 36, padding: "0 16px", borderRadius: 8, border: 0, background: "#fff", color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Request Access <ChevronRight size={13} />
                  </button>
                </>
              )}
            </div>
            {/* Hamburger */}
            <button className="landing-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ border: `1px solid ${C.borderStrong}`, background: "transparent", color: "#fff", width: 36, height: 36, borderRadius: 8, ...flex({ justifyContent: "center" }), cursor: "pointer" }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <>
            <div onClick={() => setMobileMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40 }}
            />
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#111", borderBottom: `1px solid ${C.border}`, padding: "16px 24px", zIndex: 50 }}>
              {[
                { label: "Research Domains",  href: "#domains",      icon: Sparkles },
                { label: "Lab Architecture",  href: "#showcase",     icon: Terminal },
                { label: "NBA Accreditation", href: "#nba-outcomes", icon: Award },
                { label: "Equipment Bench",   href: "#specs",        icon: Cpu },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                    style={{ ...flex({ gap: 10 }), padding: "12px 0", color: C.textMuted, textDecoration: "none", fontSize: 14, borderBottom: `1px solid ${C.border}` }}
                  >
                    <Icon size={15} color={C.textDim} />
                    {item.label}
                  </a>
                );
              })}
              <div style={{ ...flex({ gap: 10 }), marginTop: 16 }}>
                <button onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: `1px solid ${C.borderStrong}`, background: "transparent", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Sign In
                </button>
                <button onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: 0, background: "#fff", color: "#080808", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Access Lab
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 24px 0", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, background: C.accentBg, border: `1px solid ${C.borderStrong}`, marginBottom: 28 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: C.mono, color: C.textMuted, letterSpacing: 0.8 }}>
            NBA ACCREDITED · ADVANCED RESEARCH FACILITY
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "clamp(34px, 6vw, 58px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff", maxWidth: 820, margin: "0 auto 20px" }}>
          The <em style={{ fontStyle: "italic", fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>premier platform</em> for
          <br />VLSI, Robotics &amp; Silicon Labs
        </h1>

        <p style={{ fontSize: "clamp(14px, 1.8vw, 17px)", color: C.textMuted, lineHeight: 1.7, maxWidth: 620, margin: "0 auto 36px" }}>
          Turbocharge your engineering prowess with a unified design platform — ASIC architecture, FPGA synthesis, ROS 2 robotics telemetry, and NBA-compliant OBE governance, all in one workspace.
        </p>

        {/* CTAs */}
        <div style={{ ...flex({ justifyContent: "center", gap: 12, flexWrap: "wrap" }), marginBottom: 60 }}>
          <button onClick={onGetStarted}
            style={{ ...flex({ gap: 8 }), height: 48, padding: "0 24px", borderRadius: 10, border: 0, background: "#fff", color: "#080808", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            {user ? "Resume Workspace" : "Enter Laboratory Workspace"} <ArrowRight size={15} />
          </button>
          <a href="#domains"
            style={{ ...flex({ gap: 8 }), height: 48, padding: "0 24px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: "transparent", color: C.textMuted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}
          >
            Explore Research Domains
          </a>
        </div>

        {/* ─── DASHBOARD MOCKUP ─── */}
        <div style={{ position: "relative", borderRadius: "16px 16px 0 0", border: `1px solid ${C.border}`, borderBottom: "none", background: "#111", overflow: "hidden", boxShadow: "0 -8px 80px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.7)" }}>

          {/* Window chrome */}
          <div style={{ ...flex({ gap: 6 }), padding: "10px 16px", background: "#1a1a1a", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.10)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ flex: 1, margin: "0 16px", height: 22, borderRadius: 5, background: C.bg, ...flex({ justifyContent: "center" }) }}>
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: C.mono }}>vlsi-lab.workspace / dashboard</span>
            </div>
          </div>

          {/* Mock content */}
          <div style={{ display: "flex", height: 340 }}>

            {/* Sidebar */}
            <div style={{ width: 160, background: "rgba(0,0,0,0.4)", borderRight: `1px solid ${C.border}`, padding: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: C.textDim, fontFamily: C.mono, letterSpacing: 1, marginBottom: 8 }}>WORKSPACE</div>
              {["VLSI Projects", "Robotics Telemetry", "Code Repository", "NBA Reports", "Equipment"].map((s, i) => (
                <div key={s} style={{ padding: "7px 8px", borderRadius: 5, fontSize: 10, color: i === 0 ? "#fff" : C.textDim, background: i === 0 ? "rgba(255,255,255,0.08)" : "transparent", marginBottom: 2 }}>
                  {s}
                </div>
              ))}
            </div>

            {/* Code area */}
            <div style={{ flex: 1, padding: 20, overflow: "hidden", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ flex: 1, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, padding: 14, fontFamily: C.mono, fontSize: 10.5, lineHeight: 1.8, overflowY: "hidden" }}>
                <div style={{ color: C.textDim, marginBottom: 6 }}>// alu_pipeline_core.v — Verilog RTL Synthesis</div>
                <div><span style={{ color: "rgba(255,255,255,0.7)" }}>module</span><span style={{ color: "#fff" }}> alu_pipeline_core</span> <span style={{ color: C.textMuted }}>(</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>input</span>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.85)" }}>clk, rst_n,</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>input</span>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.5)" }}>[31:0]</span>&nbsp;<span style={{ color: "rgba(255,255,255,0.85)" }}>operand_a, operand_b,</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>output reg</span>&nbsp;<span style={{ color: "rgba(255,255,255,0.5)" }}>[31:0]</span>&nbsp;<span style={{ color: "rgba(255,255,255,0.85)" }}>alu_result</span></div>
                <div><span style={{ color: C.textMuted }}>);</span></div>
                <div style={{ color: C.textDim }}>&nbsp;&nbsp;// Synthesis Target: Xilinx Artix-7 FPGA</div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.7)" }}>always @</span><span style={{ color: C.textMuted }}>(</span><span style={{ color: "rgba(255,255,255,0.7)" }}>posedge</span> clk<span style={{ color: "rgba(255,255,255,0.7)" }}> or negedge</span> rst_n<span style={{ color: C.textMuted }}>)</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.7)" }}>if</span> (!rst_n) alu_result &lt;= 32&apos;h0;</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.7)" }}>else</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alu_result &lt;= operand_a + operand_b;</div>
                <div><span style={{ color: "rgba(255,255,255,0.7)" }}>endmodule</span></div>
                <span style={{ display: "inline-block", width: 7, height: 14, background: "rgba(255,255,255,0.7)", verticalAlign: "middle", marginLeft: 2, borderRadius: 1, animation: "blink 1.2s step-end infinite" }} />
              </div>

              {/* Status bar */}
              <div style={{ ...flex({ gap: 20 }), padding: "8px 14px", background: "#1a1a1a", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 9, fontFamily: C.mono, color: C.textDim }}>
                <span style={{ ...flex({ gap: 5 }), color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
                  50 Hz ONLINE
                </span>
                <span>RTL Synthesis: PASS</span>
                <span>NBA Criterion 4 ✓</span>
                <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)" }}>Artix-7 · 0.18µm</span>
              </div>
            </div>

            {/* Right telemetry */}
            <div style={{ width: 140, background: "rgba(0,0,0,0.4)", borderLeft: `1px solid ${C.border}`, padding: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: C.textDim, fontFamily: C.mono, letterSpacing: 1, marginBottom: 10 }}>TELEMETRY</div>
              {[
                { label: "BMS V",  val: "24.2V" },
                { label: "FOC A",  val: "1.8 A" },
                { label: "LiDAR", val: "1.42m" },
                { label: "IMU°",   val: "44.8°" },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 8, color: C.textDim }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: C.mono, color: "#fff" }}>{s.val}</div>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 8, color: C.textDim, marginBottom: 4 }}>LOAD</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 30 }}>
                  {[40, 60, 45, 80, 55, 70, 65, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: i === 7 ? "#fff" : "rgba(255,255,255,0.2)", height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section style={{ background: "rgba(255,255,255,0.02)", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
          {[
            { value: "100%",  label: "NBA Compliant",     sub: "OBE Outcome Mapping" },
            { value: "50 Hz", label: "Telemetry Bus",     sub: "CAN 2.0B + MQTT + LoRa" },
            { value: "28nm",  label: "ASIC Process Node", sub: "Verilog RTL Synthesis" },
            { value: "4+",    label: "Research Pillars",  sub: "VLSI · Robotics · IoT · NBA" },
          ].map((s) => (
            <div key={s.value} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, fontFamily: C.mono }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURE CARDS
      ══════════════════════════════════════════ */}
      <section id="domains" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 10, fontFamily: C.mono, color: C.textMuted, letterSpacing: 2, fontWeight: 600, marginBottom: 12 }}>
            RESEARCH &amp; CURRICULUM DOMAINS
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", maxWidth: 600, margin: "0 auto 14px" }}>
            Go further than the speed of thought
          </h2>
          <p style={{ fontSize: 15, color: C.textMuted, maxWidth: 520, margin: "0 auto" }}>
            It reads and understands your designs, and with nothing more than a line of feedback, perform complex actions autonomously.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16 }}>
          {[
            { icon: Cpu,      title: "VLSI & ASIC Design",        desc: "Verilog/VHDL HDL synthesis, RTL verification, CMOS logic optimization, timing analysis, and FPGA bitstream compilation.", tags: ["Verilog RTL", "FPGA Xilinx", "Synthesis"] },
            { icon: Bot,      title: "Autonomous Robotics",        desc: "Differential & omnidirectional ROS 2 robots, 360° LiDAR SLAM, 9-DOF IMU navigation, and emergency stop interlocks.",    tags: ["ROS 2", "LiDAR 360°", "FOC Inverter"] },
            { icon: Radio,    title: "IoT & Sensor Telemetry",     desc: "High-frequency CAN 2.0B, real-time MQTT brokers, 868MHz LoRa long-range telemetry, and battery BMS cell balancing.",       tags: ["CAN Bus", "MQTT 50Hz", "BMS 8S"] },
            { icon: Award,    title: "NBA Criterion Compliance",   desc: "OBE documentation, PO/PSO attainment mapping, audited activity logging, and role-based access for accreditation.",          tags: ["Criterion 4 & 5", "OBE Mapping", "Audit Trail"] },
            { icon: Code2,    title: "Creation Mode",              desc: "Describe changes in natural language — from simple edits to complex RTL modifications in the HDL project tree.",           tags: ["Natural Language", "Auto-Edit", "Smart Diff"] },
            { icon: Layers,   title: "Powerful Plugins",           desc: "Extend with a growing ecosystem of lab tools — timing analyzers, schematic viewers, and synthesis dashboards.",             tags: ["Timing Analyzer", "Schematic", "Plugin API"] },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{ borderRadius: 16, background: C.surface, border: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.2s, transform 0.2s", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border;       e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: C.accentBg, border: `1px solid ${C.border}`, ...flex({ justifyContent: "center" }), color: "#fff" }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{card.title}</h3>
                  <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{card.desc}</p>
                </div>
                <div style={{ ...flex({ gap: 5, flexWrap: "wrap" }), marginTop: "auto" }}>
                  {card.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 9, fontFamily: C.mono, padding: "3px 7px", borderRadius: 4, background: C.accentBg, border: `1px solid ${C.border}`, color: C.textDim }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          INTERACTIVE SHOWCASE
      ══════════════════════════════════════════ */}
      <section id="showcase" style={{ padding: "80px 24px", background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Header + tabs */}
          <div style={{ ...flex({ justifyContent: "space-between", flexWrap: "wrap", gap: 20 }), marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: C.mono, color: C.textMuted, letterSpacing: 2, marginBottom: 8 }}>WORKSTATION INTEGRATION</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.6px" }}>Integrated Laboratory Capabilities</h2>
            </div>
            <div style={{ ...flex({ gap: 4 }), background: C.accentBg, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {[
                { id: "vlsi",     label: "Silicon / HDL" },
                { id: "robotics", label: "Robotics" },
                { id: "nba",      label: "Security & Roles" },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding: "8px 16px", borderRadius: 7, border: 0, fontSize: 12, fontWeight: 600, cursor: "pointer", background: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "#080808" : C.textMuted, transition: "all 0.15s" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── VLSI Tab ── */}
          {activeTab === "vlsi" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", fontFamily: C.mono, fontSize: 11, lineHeight: 1.8, color: "rgba(255,255,255,0.8)" }}>
                <div style={{ color: C.textDim, marginBottom: 8 }}>// 32-Bit ALU &amp; Pipeline Register — Verilog HDL</div>
                <div><span style={{ color: "rgba(255,255,255,0.6)" }}>module</span> alu_pipeline_core (</div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.55)" }}>input</span> clk, rst_n,</div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.55)" }}>input</span> <span style={{ color: "rgba(255,255,255,0.4)" }}>[31:0]</span> operand_a, operand_b,</div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.55)" }}>output reg</span> <span style={{ color: "rgba(255,255,255,0.4)" }}>[31:0]</span> alu_result</div>
                <div>);</div>
                <div style={{ color: C.textDim }}>&nbsp;&nbsp;// Synthesis Target: Xilinx Artix-7 / CMOS 45nm</div>
                <div>&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>always @</span>(<span style={{ color: "rgba(255,255,255,0.6)" }}>posedge</span> clk <span style={{ color: "rgba(255,255,255,0.6)" }}>or negedge</span> rst_n) <span style={{ color: "rgba(255,255,255,0.6)" }}>begin</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>if</span> (!rst_n) alu_result &lt;= 32&apos;h0;</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.6)" }}>else</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alu_result &lt;= operand_a + operand_b;</div>
                <div><span style={{ color: "rgba(255,255,255,0.6)" }}>endmodule</span></div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Real-Time HDL &amp; Verilog Workspace</h3>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, marginBottom: 20 }}>
                  Design, debug, and synthesize electronic circuits directly inside the browser. Build synchronous digital counters, FSMs, and pipeline processors with instant validation.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {["Syntax-highlighted editor for Verilog & VHDL", "Instant code-snippet cloning to personal workspace", "NBA student laboratory session verification"].map((pt) => (
                    <li key={pt} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} /> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Robotics Tab ── */}
          {activeTab === "robotics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ ...flex({ justifyContent: "space-between" }), marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: C.mono, color: C.textMuted }}>TELEMETRY BUS · ROBO-EEE-V2</span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>ONLINE 50Hz</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "BMS PACK VOLTAGE",  val: "24.2 V" },
                    { label: "DRIVE CURRENT (FOC)",val: "1.8 A" },
                    { label: "LiDAR RANGE",        val: "1.42 m" },
                    { label: "IMU HEADING (YAW)",  val: "44.8°" },
                  ].map((m) => (
                    <div key={m.label} style={{ padding: "10px 12px", background: C.accentBg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: C.textDim, fontFamily: C.mono, marginBottom: 4 }}>{m.label}</div>
                      <strong style={{ fontSize: 18, fontFamily: C.mono, color: "#fff" }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.5)", fontFamily: C.mono, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                  [CAN0] Inverter Heartbeat 0x180: OK | [MQTT] Teleop Ready
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Real-Time Autonomous Teleoperation</h3>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, marginBottom: 20 }}>
                  Inspect real-time telemetry from lab hardware bots. Includes E-STOP hardware interlocks, FOC vector motor control, and sensor fusion feeds.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {["Live sensor streaming (LiDAR, IMU, BMS Battery)", "Interactive teleoperation controls with speed sliders", "Team dossier profiles for lab engineers & leads"].map((pt) => (
                    <li key={pt} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} /> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── NBA / Security Tab ── */}
          {activeTab === "nba" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ ...flex({ gap: 10 }), marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accentBg, ...flex({ justifyContent: "center" }), color: "rgba(255,255,255,0.6)" }}>
                    <Lock size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>Firestore-Governed Role Hierarchy</strong>
                    <span style={{ fontSize: 10, color: C.textDim }}>No client-side role hardcoding</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { role: "Admin",                access: "Full lab governance, user approvals & role assignments" },
                    { role: "Robotics Lead",         access: "Autonomous vehicle firmware & telemetry controls" },
                    { role: "Hardware Engineer",     access: "Circuit synthesis & laboratory equipment bench" },
                    { role: "Developer / Researcher",access: "HDL simulation & project repository publishing" },
                  ].map((r, idx) => (
                    <div key={r.role} style={{ ...flex({ gap: 10 }), padding: "10px 12px", background: C.accentBg, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: idx === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", color: idx === 0 ? "#fff" : C.textMuted, flexShrink: 0 }}>
                        {r.role}
                      </span>
                      <span style={{ fontSize: 11, color: C.textDim }}>{r.access}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Audited Laboratory Governance</h3>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, marginBottom: 20 }}>
                  Every laboratory access attempt and administrative role change is verified via Cloud Firestore. Unapproved accounts are held in pending status until reviewed.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {["Firestore /admins collection defines administrators", "Real-time status sync via Firestore snapshot listeners", "Complete immutable audit trail for NBA review visits"].map((pt) => (
                    <li key={pt} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} /> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EQUIPMENT SPECS
      ══════════════════════════════════════════ */}
      <section id="specs" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: C.mono, color: C.textMuted, letterSpacing: 2, marginBottom: 10 }}>BENCHTOP INSTRUMENTATION</div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.6px" }}>Hardware Engineering Bench Specifications</h2>
          <p style={{ fontSize: 13, color: C.textDim, maxWidth: 500, margin: "12px auto 0" }}>Precision instrumentation installed in the laboratory for advanced embedded development.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {[
            { title: "Digital Storage Oscilloscope",   spec: "4-Ch · 200MHz · 2 GSa/s",     use: "Signal Integrity & CAN Bus Debugging",   icon: Activity },
            { title: "FPGA Development Platforms",     spec: "Artix-7 & Zynq-7000 SoC",     use: "Hardware Accelerated RTL Synthesis",      icon: Cpu },
            { title: "16-Channel Logic Analyzer",      spec: "500 MSa/s USB Logic Pro",      use: "SPI, I2C & UART Protocol Decoding",       icon: Terminal },
            { title: "Programmable DC Power Supply",   spec: "0-30V · 5A · Triple Output",  use: "Low-Noise Isolated Power Supply",         icon: Zap },
          ].map((bench, idx) => {
            const Icon = bench.icon;
            return (
              <div key={idx} style={{ borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, padding: 20 }}>
                <div style={{ ...flex({ gap: 10 }), marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accentBg, border: `1px solid ${C.border}`, ...flex({ justifyContent: "center" }), color: "rgba(255,255,255,0.6)" }}>
                    <Icon size={17} />
                  </div>
                  <strong style={{ fontSize: 13, color: "#fff" }}>{bench.title}</strong>
                </div>
                <div style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 6 }}>{bench.spec}</div>
                <small style={{ fontSize: 11, color: C.textDim }}>{bench.use}</small>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <section id="nba-outcomes" style={{ padding: "80px 24px", textAlign: "center", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: C.accentBg, border: `1px solid ${C.borderStrong}`, fontSize: 10, fontFamily: C.mono, color: C.textMuted, marginBottom: 20 }}>
            <Sparkles size={11} />
            ACCELERATE YOUR HARDWARE RESEARCH
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to access the<br />Laboratory Workspace?
          </h2>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.65, maxWidth: 560, margin: "0 auto 32px" }}>
            Sign in with your department credentials to simulate Verilog code, operate the robotics teleoperation testbed, and submit laboratory projects.
          </p>
          <div style={{ ...flex({ justifyContent: "center", gap: 12, flexWrap: "wrap" }) }}>
            <button onClick={onGetStarted}
              style={{ ...flex({ gap: 8 }), height: 50, padding: "0 28px", borderRadius: 10, border: 0, background: "#fff", color: "#080808", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              {user ? "Go to Workspace Dashboard" : "Sign In to Access Laboratory"} <ArrowRight size={15} />
            </button>
            <button onClick={onSignIn}
              style={{ height: 50, padding: "0 24px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: "transparent", color: C.textMuted, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: "#040404", borderTop: `1px solid ${C.border}`, padding: "32px 24px", fontSize: 12, color: C.textDim }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", ...flex({ justifyContent: "space-between", flexWrap: "wrap", gap: 20 }) }}>
          <div style={flex({ gap: 12 })}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", ...flex({ justifyContent: "center" }) }}>
              <Cpu size={15} color="#080808" />
            </div>
            <div>
              <strong style={{ color: "rgba(255,255,255,0.6)", display: "block", fontSize: 12 }}>Dept. of Electrical &amp; Electronics Engineering</strong>
              <span style={{ fontSize: 10 }}>NBA Accredited · Outcome-Based Education Lab Facility</span>
            </div>
          </div>
          <div style={flex({ gap: 20 })}>
            <span style={flex({ gap: 5 })}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
              System Online [50Hz]
            </span>
            <span>·</span>
            <span>© 2026 NBA VLSI &amp; Robotics Laboratory</span>
          </div>
        </div>
      </footer>

      {/* ─── keyframe + responsive overrides ─── */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .landing-nav-desktop { display: flex !important; }
        .landing-menu-toggle { display: none !important; }
        .landing-actions-desktop { display: flex !important; }
        @media (max-width: 768px) {
          .landing-nav-desktop { display: none !important; }
          .landing-menu-toggle { display: flex !important; }
        }
        @media (max-width: 640px) {
          .landing-actions-desktop { display: none !important; }
          .landing-menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
