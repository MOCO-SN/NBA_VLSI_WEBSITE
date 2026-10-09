import { useState } from "react";
import {
  Cpu,
  Bot,
  Radio,
  ShieldCheck,
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
  GitBranch,
  Workflow,
} from "lucide-react";

/* ─── tiny inline style helpers ────────────────────────────────────── */
const flex = (extra = {}) => ({ display: "flex", alignItems: "center", ...extra });
const grid = (cols, gap = 20) => ({ display: "grid", gridTemplateColumns: cols, gap });

export default function Landing({ onGetStarted, onSignIn, user }) {
  const [activeTab, setActiveTab] = useState("vlsi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0d14",
        color: "#e2e8f0",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ═══════════ NAVBAR ═══════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,13,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            ...flex({ justifyContent: "space-between" }),
          }}
        >
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ ...flex({ gap: 10 }), textDecoration: "none" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                ...flex({ justifyContent: "center" }),
              }}
            >
              <Cpu size={16} color="#fff" />
            </div>
            <div>
              <strong style={{ fontSize: 13, color: "#fff", display: "block", letterSpacing: 0.2 }}>
                NBA • VLSI LAB
              </strong>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
                EEE DEPT
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav style={{ ...flex({ gap: 4 }) }} className="landing-nav-desktop">
            {[
              { label: "Research", href: "#domains" },
              { label: "Lab Architecture", href: "#showcase" },
              { label: "NBA Accreditation", href: "#nba-outcomes" },
              { label: "Equipment", href: "#specs" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.55)",
                  transition: "color 0.15s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.55)")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div style={flex({ gap: 10 })}>
            <div className="landing-actions-desktop" style={flex({ gap: 10 })}>
              {user ? (
                <button
                  onClick={onGetStarted}
                  style={{
                    ...flex({ gap: 6 }),
                    height: 36,
                    padding: "0 16px",
                    borderRadius: 8,
                    border: 0,
                    background: "#fff",
                    color: "#0a0d14",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Enter Workspace <ArrowRight size={13} />
                </button>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    style={{
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "transparent",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onGetStarted}
                    style={{
                      ...flex({ gap: 6 }),
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 8,
                      border: 0,
                      background: "#fff",
                      color: "#0a0d14",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Request Access <ChevronRight size={13} />
                  </button>
                </>
              )}
            </div>
            {/* Mobile hamburger */}
            <button
              className="landing-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#fff",
                width: 36,
                height: 36,
                borderRadius: 8,
                ...flex({ justifyContent: "center" }),
                cursor: "pointer",
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
            />
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#111827",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                padding: "16px 24px",
                zIndex: 50,
              }}
            >
              {[
                { label: "Research Domains", href: "#domains", icon: Sparkles },
                { label: "Lab Architecture", href: "#showcase", icon: Terminal },
                { label: "NBA Accreditation", href: "#nba-outcomes", icon: Award },
                { label: "Equipment Bench", href: "#specs", icon: Cpu },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      ...flex({ gap: 10 }),
                      padding: "12px 0",
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: 14,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon size={15} color="rgba(255,255,255,0.4)" />
                    {item.label}
                  </a>
                );
              })}
              <div style={{ ...flex({ gap: 10 }), marginTop: 16 }}>
                <button
                  onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                  style={{ flex: 1, height: 40, borderRadius: 8, border: 0, background: "#fff", color: "#0a0d14", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Access Lab
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      {/* ═══════════ HERO ═══════════ */}
      <section style={{ padding: "80px 24px 0", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            borderRadius: 99,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: "#a5b4fc", letterSpacing: 0.5 }}>
            NBA ACCREDITED · ADVANCED RESEARCH FACILITY
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: "clamp(34px, 6vw, 58px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: "#fff",
            maxWidth: 820,
            margin: "0 auto 20px",
          }}
        >
          The <em style={{ fontStyle: "italic", fontWeight: 800, color: "#818cf8" }}>premier platform</em> for
          <br />VLSI, Robotics &amp; Silicon Labs
        </h1>

        <p
          style={{
            fontSize: "clamp(14px, 1.8vw, 17px)",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
            maxWidth: 640,
            margin: "0 auto 36px",
          }}
        >
          Turbocharge your engineering prowess with a unified design platform — ASIC architecture, FPGA synthesis, ROS 2 robotics telemetry, and NBA-compliant OBE governance, all in one workspace.
        </p>

        {/* CTAs */}
        <div style={{ ...flex({ justifyContent: "center", gap: 12, flexWrap: "wrap" }), marginBottom: 60 }}>
          <button
            onClick={onGetStarted}
            style={{
              ...flex({ gap: 8 }),
              height: 48,
              padding: "0 24px",
              borderRadius: 10,
              border: 0,
              background: "#fff",
              color: "#0a0d14",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,255,255,0.1)",
            }}
          >
            {user ? "Resume Workspace" : "Enter Laboratory Workspace"} <ArrowRight size={15} />
          </button>
          <a
            href="#domains"
            style={{
              ...flex({ gap: 8 }),
              height: 48,
              padding: "0 24px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Explore Research Domains
          </a>
        </div>

        {/* ─── DASHBOARD MOCKUP ─── */}
        <div
          style={{
            position: "relative",
            borderRadius: "16px 16px 0 0",
            border: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "none",
            background: "#111827",
            overflow: "hidden",
            boxShadow: "0 -8px 80px rgba(99,102,241,0.08), 0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              ...flex({ gap: 6 }),
              padding: "10px 16px",
              background: "#1f2937",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
            <div
              style={{
                flex: 1,
                margin: "0 16px",
                height: 22,
                borderRadius: 5,
                background: "#0a0d14",
                ...flex({ justifyContent: "center" }),
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}>
                vlsi-lab.workspace / dashboard
              </span>
            </div>
          </div>

          {/* Mock content area */}
          <div style={{ display: "flex", height: 340 }}>
            {/* Sidebar panel */}
            <div style={{ width: 160, background: "#0d1117", borderRight: "1px solid rgba(255,255,255,0.05)", padding: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>WORKSPACE</div>
              {["VLSI Projects", "Robotics Telemetry", "Code Repository", "NBA Reports", "Equipment"].map((s, i) => (
                <div
                  key={s}
                  style={{
                    padding: "7px 8px",
                    borderRadius: 5,
                    fontSize: 10,
                    color: i === 0 ? "#fff" : "rgba(255,255,255,0.35)",
                    background: i === 0 ? "rgba(99,102,241,0.2)" : "transparent",
                    marginBottom: 2,
                  }}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Main panel */}
            <div style={{ flex: 1, padding: 20, overflow: "hidden", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Code editor area */}
              <div style={{ flex: 1, background: "#0a0d14", borderRadius: 8, padding: 14, fontFamily: "'DM Mono', monospace", fontSize: 10.5, lineHeight: 1.8, overflowY: "hidden", position: "relative" }}>
                <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>// alu_pipeline_core.v — Verilog RTL Synthesis</div>
                <div><span style={{ color: "#f472b6" }}>module</span><span style={{ color: "#c4b5fd" }}> alu_pipeline_core</span> <span style={{ color: "#fff" }}>(</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>input</span>&nbsp;&nbsp;<span style={{ color: "#6edca8" }}>clk, rst_n,</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>input</span>&nbsp;&nbsp;<span style={{ color: "#fbbf24" }}>[31:0]</span>&nbsp;<span style={{ color: "#6edca8" }}>operand_a, operand_b,</span></div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>output reg</span>&nbsp;<span style={{ color: "#fbbf24" }}>[31:0]</span>&nbsp;<span style={{ color: "#6edca8" }}>alu_result</span></div>
                <div><span style={{ color: "#fff" }}>);</span></div>
                <div style={{ color: "rgba(255,255,255,0.2)" }}>&nbsp;&nbsp;// Synthesis Target: Xilinx Artix-7 FPGA</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>always @</span><span style={{ color: "#fff" }}>(</span><span style={{ color: "#f472b6" }}>posedge</span> clk<span style={{ color: "#f472b6" }}> or negedge</span> rst_n<span style={{ color: "#fff" }}>)</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>if</span> (!rst_n) alu_result &lt;= 32&apos;h0;</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>else</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alu_result &lt;= operand_a + operand_b;</div>
                <div><span style={{ color: "#f472b6" }}>endmodule</span></div>
                {/* cursor blink */}
                <span style={{ display: "inline-block", width: 7, height: 14, background: "#818cf8", verticalAlign: "middle", marginLeft: 2, borderRadius: 1, animation: "blink 1.2s step-end infinite" }} />
              </div>

              {/* Bottom status bar */}
              <div
                style={{
                  ...flex({ gap: 20 }),
                  padding: "8px 14px",
                  background: "#1f2937",
                  borderRadius: 8,
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <span style={{ ...flex({ gap: 5 }), color: "#22c55e" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                  50 Hz ONLINE
                </span>
                <span>RTL Synthesis: PASS</span>
                <span>NBA Criterion 4 ✓</span>
                <span style={{ marginLeft: "auto", color: "#a5b4fc" }}>Artix-7 · 0.18µm</span>
              </div>
            </div>

            {/* Right panel */}
            <div style={{ width: 140, background: "#0d1117", borderLeft: "1px solid rgba(255,255,255,0.05)", padding: 12, flexShrink: 0 }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>TELEMETRY</div>
              {[
                { label: "BMS V", val: "24.2V", color: "#22c55e" },
                { label: "FOC A", val: "1.8 A", color: "#f59e0b" },
                { label: "LiDAR", val: "1.42m", color: "#38bdf8" },
                { label: "IMU°", val: "44.8°", color: "#a78bfa" },
              ].map((s) => (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: s.color }}>{s.val}</div>
                </div>
              ))}
              {/* Mini chart */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginBottom: 4 }}>LOAD</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 30 }}>
                  {[40, 60, 45, 80, 55, 70, 65, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", background: "rgba(99,102,241,0.6)", height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "36px 24px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
          }}
        >
          {[
            { value: "100%", label: "NBA Compliant", sub: "OBE Outcome Mapping" },
            { value: "50 Hz", label: "Telemetry Bus", sub: "CAN 2.0B + MQTT + LoRa" },
            { value: "28nm", label: "ASIC Process Node", sub: "Verilog RTL Synthesis" },
            { value: "4+", label: "Research Pillars", sub: "VLSI · Robotics · IoT · NBA" },
          ].map((s) => (
            <div key={s.value} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURE SECTION ═══════════ */}
      <section id="domains" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: "#818cf8",
              letterSpacing: 2,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            RESEARCH &amp; CURRICULUM DOMAINS
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", maxWidth: 600, margin: "0 auto 14px" }}>
            Go further than the speed of thought
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", maxWidth: 520, margin: "0 auto" }}>
            It reads and understands your designs, and with nothing more than a line of feedback, perform complex actions autonomously.
          </p>
        </div>

        {/* Feature cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 20 }}>
          {[
            {
              icon: Cpu,
              color: "#22c55e",
              bg: "rgba(34,197,94,0.08)",
              border: "rgba(34,197,94,0.15)",
              title: "VLSI & ASIC Design",
              desc: "Verilog/VHDL HDL synthesis, RTL verification, CMOS logic optimization, timing analysis, and FPGA bitstream compilation.",
              tags: ["Verilog RTL", "FPGA Xilinx", "Synthesis"],
            },
            {
              icon: Bot,
              color: "#3b82f6",
              bg: "rgba(59,130,246,0.08)",
              border: "rgba(59,130,246,0.15)",
              title: "Autonomous Robotics",
              desc: "Differential & omnidirectional ROS 2 robots, 360° LiDAR SLAM, 9-DOF IMU navigation, and emergency stop interlocks.",
              tags: ["ROS 2", "LiDAR 360°", "FOC Inverter"],
            },
            {
              icon: Radio,
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.08)",
              border: "rgba(245,158,11,0.15)",
              title: "IoT & Sensor Telemetry",
              desc: "High-frequency CAN 2.0B, real-time MQTT brokers, 868MHz LoRa long-range telemetry, and battery BMS cell balancing.",
              tags: ["CAN Bus", "MQTT 50Hz", "BMS 8S"],
            },
            {
              icon: Award,
              color: "#a78bfa",
              bg: "rgba(167,139,250,0.08)",
              border: "rgba(167,139,250,0.15)",
              title: "NBA Criterion Compliance",
              desc: "OBE documentation, PO/PSO attainment mapping, audited activity logging, and role-based access for accreditation.",
              tags: ["Criterion 4 & 5", "OBE Mapping", "Audit Trail"],
            },
            {
              icon: Code2,
              color: "#38bdf8",
              bg: "rgba(56,189,248,0.08)",
              border: "rgba(56,189,248,0.15)",
              title: "Creation Mode",
              desc: "Describe changes in natural language — from simple edits to complex RTL modifications in the HDL project tree.",
              tags: ["Natural Language", "Auto-Edit", "Smart Diff"],
            },
            {
              icon: Layers,
              color: "#f472b6",
              bg: "rgba(244,114,182,0.08)",
              border: "rgba(244,114,182,0.15)",
              title: "Powerful Plugins",
              desc: "Extend with a growing ecosystem of lab tools — timing analyzers, schematic viewers, and synthesis dashboards.",
              tags: ["Timing Analyzer", "Schematic", "Plugin API"],
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                style={{
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.025)",
                  border: `1px solid ${card.border}`,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 32px ${card.bg}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: card.bg,
                    border: `1px solid ${card.border}`,
                    ...flex({ justifyContent: "center" }),
                    color: card.color,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{card.title}</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{card.desc}</p>
                </div>
                <div style={{ ...flex({ gap: 5, flexWrap: "wrap" }), marginTop: "auto" }}>
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 9,
                        fontFamily: "'DM Mono', monospace",
                        padding: "3px 7px",
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ INTERACTIVE SHOWCASE ═══════════ */}
      <section
        id="showcase"
        style={{
          padding: "80px 24px",
          background: "rgba(255,255,255,0.015)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header row */}
          <div style={{ ...flex({ justifyContent: "space-between", flexWrap: "wrap", gap: 20 }), marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#818cf8", letterSpacing: 2, marginBottom: 8 }}>
                WORKSTATION INTEGRATION
              </div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.6px" }}>
                Integrated Laboratory Capabilities
              </h2>
            </div>
            {/* Tab switcher */}
            <div
              style={{
                ...flex({ gap: 4 }),
                background: "rgba(255,255,255,0.04)",
                padding: 4,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {[
                { id: "vlsi", label: "Silicon / HDL" },
                { id: "robotics", label: "Robotics" },
                { id: "nba", label: "Security & Roles" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 7,
                    border: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: activeTab === tab.id ? "#fff" : "transparent",
                    color: activeTab === tab.id ? "#0a0d14" : "rgba(255,255,255,0.4)",
                    transition: "all 0.15s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* VLSI Panel */}
          {activeTab === "vlsi" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div
                style={{
                  background: "#0a0d14",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#6edca8",
                  borderRadius: 14,
                  padding: "20px 22px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: 8 }}>// 32-Bit ALU &amp; Pipeline Register — Verilog HDL</div>
                <div><span style={{ color: "#f472b6" }}>module</span> alu_pipeline_core (</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>input</span> clk, rst_n,</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>input</span> <span style={{ color: "#fbbf24" }}>[31:0]</span> operand_a, operand_b,</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#38bdf8" }}>output reg</span> <span style={{ color: "#fbbf24" }}>[31:0]</span> alu_result</div>
                <div>);</div>
                <div style={{ color: "rgba(255,255,255,0.2)" }}>&nbsp;&nbsp;// Synthesis Target: Xilinx Artix-7 / CMOS 45nm</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>always @</span>(<span style={{ color: "#f472b6" }}>posedge</span> clk <span style={{ color: "#f472b6" }}>or negedge</span> rst_n) <span style={{ color: "#f472b6" }}>begin</span></div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>if</span> (!rst_n) alu_result &lt;= 32&apos;h0;</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>else</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alu_result &lt;= operand_a + operand_b;</div>
                <div>&nbsp;&nbsp;<span style={{ color: "#f472b6" }}>end</span></div>
                <div><span style={{ color: "#f472b6" }}>endmodule</span></div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Real-Time HDL &amp; Verilog Workspace</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 20 }}>
                  Design, debug, and synthesize electronic circuits directly inside the browser. Build synchronous digital counters, FSMs, and pipeline processors with instant validation.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {[
                    "Syntax-highlighted code editor for Verilog & VHDL",
                    "Instant code-snippet cloning to personal workspace",
                    "NBA student laboratory session verification",
                  ].map((point) => (
                    <li key={point} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Robotics Panel */}
          {activeTab === "robotics" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ background: "#0a0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ ...flex({ justifyContent: "space-between" }), marginBottom: 14 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
                    TELEMETRY BUS · ROBO-EEE-V2
                  </span>
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 6, background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 600 }}>
                    ONLINE 50Hz
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "BMS PACK VOLTAGE", val: "24.2 V", color: "#22c55e" },
                    { label: "DRIVE CURRENT (FOC)", val: "1.8 A", color: "#f59e0b" },
                    { label: "LiDAR RANGE", val: "1.42 m", color: "#38bdf8" },
                    { label: "IMU HEADING (YAW)", val: "44.8°", color: "#a78bfa" },
                  ].map((m) => (
                    <div key={m.label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>{m.label}</div>
                      <strong style={{ fontSize: 18, fontFamily: "'DM Mono', monospace", color: m.color }}>{m.val}</strong>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(0,0,0,0.4)", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6edca8" }}>
                  [CAN0] Inverter Heartbeat 0x180: OK | [MQTT] Teleop Ready
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Real-Time Autonomous Teleoperation</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 20 }}>
                  Inspect real-time telemetry from lab hardware bots. Includes E-STOP hardware interlocks, FOC vector motor control, and sensor fusion feeds.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {[
                    "Live sensor streaming (LiDAR, IMU, BMS Battery)",
                    "Interactive teleoperation controls with speed sliders",
                    "Team dossier profiles for lab engineers & leads",
                  ].map((point) => (
                    <li key={point} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* NBA / Security Panel */}
          {activeTab === "nba" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ background: "#0a0d14", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ ...flex({ gap: 10 }), marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(239,68,68,0.12)", ...flex({ justifyContent: "center" }), color: "#ef4444" }}>
                    <Lock size={16} />
                  </div>
                  <div>
                    <strong style={{ fontSize: 13, color: "#fff", display: "block" }}>Firestore-Governed Role Hierarchy</strong>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>No client-side role hardcoding</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { role: "Admin", access: "Full lab governance, user approvals & role assignments", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                    { role: "Robotics Lead", access: "Autonomous vehicle firmware & telemetry controls", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                    { role: "Hardware Engineer", access: "Circuit synthesis & laboratory equipment bench", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                    { role: "Developer / Researcher", access: "HDL simulation & project repository publishing", color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.04)" },
                  ].map((r) => (
                    <div key={r.role} style={{ ...flex({ gap: 10 }), padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: r.bg, color: r.color, flexShrink: 0 }}>
                        {r.role}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.access}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Audited Laboratory Governance</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 20 }}>
                  Every laboratory access attempt and administrative role change is verified via Cloud Firestore. Unapproved accounts are held in pending status until reviewed.
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", padding: 0 }}>
                  {[
                    "Firestore /admins collection defines administrators",
                    "Real-time status sync via Firestore snapshot listeners",
                    "Complete immutable audit trail for NBA review visits",
                  ].map((point) => (
                    <li key={point} style={{ ...flex({ gap: 10 }), fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      <CheckCircle2 size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ EQUIPMENT SPECS ═══════════ */}
      <section id="specs" style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#818cf8", letterSpacing: 2, marginBottom: 10 }}>
            BENCHTOP INSTRUMENTATION
          </div>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.6px" }}>
            Hardware Engineering Bench Specifications
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 500, margin: "12px auto 0" }}>
            Precision instrumentation installed in the laboratory for advanced embedded development.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {[
            { title: "Digital Storage Oscilloscope", spec: "4-Ch · 200MHz · 2 GSa/s", use: "Signal Integrity & CAN Bus Debugging", icon: Activity, color: "#22c55e" },
            { title: "FPGA Development Platforms", spec: "Artix-7 & Zynq-7000 SoC", use: "Hardware Accelerated RTL Synthesis", icon: Cpu, color: "#3b82f6" },
            { title: "16-Channel Logic Analyzer", spec: "500 MSa/s USB Logic Pro", use: "SPI, I2C & UART Protocol Decoding", icon: Terminal, color: "#f59e0b" },
            { title: "Programmable DC Power Supply", spec: "0-30V · 5A · Triple Output", use: "Low-Noise Isolated Power Supply", icon: Zap, color: "#a78bfa" },
          ].map((bench, idx) => {
            const Icon = bench.icon;
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: 20,
                }}
              >
                <div style={{ ...flex({ gap: 10 }), marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.05)", ...flex({ justifyContent: "center" }), color: bench.color }}>
                    <Icon size={17} />
                  </div>
                  <strong style={{ fontSize: 13, color: "#fff" }}>{bench.title}</strong>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: bench.color, fontWeight: 600, marginBottom: 6 }}>
                  {bench.spec}
                </div>
                <small style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{bench.use}</small>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section
        id="nba-outcomes"
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          borderTop: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 99,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: "#a5b4fc",
              marginBottom: 20,
            }}
          >
            <Sparkles size={11} />
            ACCELERATE YOUR HARDWARE RESEARCH
          </div>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
            Ready to access the<br />Laboratory Workspace?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
            Sign in with your department credentials to simulate Verilog code, operate the robotics teleoperation testbed, and submit laboratory projects.
          </p>
          <div style={{ ...flex({ justifyContent: "center", gap: 12, flexWrap: "wrap" }) }}>
            <button
              onClick={onGetStarted}
              style={{
                ...flex({ gap: 8 }),
                height: 50,
                padding: "0 28px",
                borderRadius: 10,
                border: 0,
                background: "#fff",
                color: "#0a0d14",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(255,255,255,0.1)",
              }}
            >
              {user ? "Go to Workspace Dashboard" : "Sign In to Access Laboratory"} <ArrowRight size={15} />
            </button>
            <button
              onClick={onSignIn}
              style={{
                height: 50,
                padding: "0 24px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer
        style={{
          background: "#060810",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "36px 24px",
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            ...flex({ justifyContent: "space-between", flexWrap: "wrap", gap: 20 }),
          }}
        >
          <div style={flex({ gap: 12 })}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                ...flex({ justifyContent: "center" }),
              }}
            >
              <Cpu size={15} color="#fff" />
            </div>
            <div>
              <strong style={{ color: "rgba(255,255,255,0.7)", display: "block", fontSize: 12 }}>
                Dept. of Electrical &amp; Electronics Engineering
              </strong>
              <span style={{ fontSize: 10 }}>NBA Accredited · Outcome-Based Education Lab Facility</span>
            </div>
          </div>
          <div style={flex({ gap: 20 })}>
            <span style={flex({ gap: 5 })}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
              System Online [50Hz]
            </span>
            <span>·</span>
            <span>© 2026 NBA VLSI &amp; Robotics Laboratory</span>
          </div>
        </div>
      </footer>

      {/* ─── blink keyframe ─── */}
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .landing-nav-desktop { display: flex; }
        .landing-menu-toggle { display: none; }
        .landing-actions-desktop { display: flex; }
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
