import { useState, useMemo } from "react";
import {
  Bot,
  Cpu,
  Radio,
  Search,
  Zap,
  Layers,
  Activity,
  Compass,
  Battery,
  Gauge,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  X,
  Mail
} from "lucide-react";
import { Github, Linkedin } from "../components/SocialIcons";
import { TEAM_DOMAINS } from "../data/teamData";
import { FEATURED_PROJECTS } from "../data/projectsData";
import { LAB_EQUIPMENT_CATEGORIES } from "../data/equipmentData";
import { getRegisteredUsers } from "../utils/userDirectory";

function getInitials(name = "User") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";
}

export default function RoboticsTeam({ user: _user }) {
  const [activeTab, setActiveTab] = useState("roster"); // roster, telemetry, projects, stack
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMember, setActiveMember] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Live Telemetry simulator state
  const [eStop, setEStop] = useState(false);
  const [motorRpm, setMotorRpm] = useState(120);
  const [motorCurrent, setMotorCurrent] = useState(1.8);
  const [batteryVoltage, setBatteryVoltage] = useState(24.2);
  const [distance, setDistance] = useState(1.42);
  const [imu, setImu] = useState({ roll: 0.2, pitch: -0.4, yaw: 44.8 });
  const [telemetryLogs, setTelemetryLogs] = useState([
    "[CAN0] Inverter Heartbeat 0x180: OK, Temp 34.2C",
    "[MQTT] /robot/state: PUBLISHED 50Hz",
    "[BMS] Pack 24.2V, 8S Balance Delta 4mV",
    "[LIDAR] Scanning 360 sector (Points: 720)"
  ]);

  // Real registered team members
  const teamMembers = useMemo(() => {
    const list = getRegisteredUsers().filter((u) => Boolean(u.role));
    if (list.length === 0 && _user?.role) {
      return [{
        id: _user.uid || "usr-current",
        name: _user.displayName || "Workspace Administrator",
        email: _user.email || "",
        role: _user.role,
        department: "Department of Electrical & Electronics Engineering",
        status: "Active in Lab",
        joinedDate: "2026",
        avatar: _user.photoURL || "",
        bio: "Workspace Administrator overseeing robotics research, hardware builds, and telemetry networks.",
        skills: [
          { name: "System Architecture", level: 95 },
          { name: "Robotics Governance", level: 92 },
          { name: "Embedded Hardware", level: 90 }
        ],
        hardwareTools: ["Lab Workstation", "Hardware Bench"]
      }];
    }
    return list.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: "Department of Electrical & Electronics Engineering",
      status: u.status === "Active" ? "Active in Lab" : "Pending Approval",
      joinedDate: u.joinedDate || "2026",
      avatar: u.avatar || "",
      bio: `${u.name} is a verified workspace ${u.role} in the Department of Electrical & Electronics Engineering.`,
      skills: [
        { name: u.role, level: 92 },
        { name: "ROS 2 & Firmware", level: 88 },
        { name: "Hardware Integration", level: 86 }
      ],
      hardwareTools: ["Lab Bench Instrumentation", "Debugging Interfaces", "Hardware Bus Analyzers"]
    }));
  }, [_user]);

  // Filter members
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesDomain =
        selectedDomain === "all" ||
        member.role === selectedDomain;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name?.toLowerCase().includes(q) ||
        member.role?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q);

      return matchesDomain && matchesSearch;
    });
  }, [teamMembers, selectedDomain, searchQuery]);

  // Real workspace projects
  const publishedProjects = useMemo(() => {
    const list = [...FEATURED_PROJECTS];
    try {
      const raw = localStorage.getItem(`mocosn_project_${_user?.uid || "guest"}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && parsed.name !== "Electro-Botics Autonomous System") {
          list.push({
            id: "user-project",
            title: parsed.name,
            badge: parsed.status || "Active Project",
            description: parsed.description || "Workspace hardware build.",
            firmwareStack: parsed.technologies ? parsed.technologies.split(",").map((t) => t.trim()).filter(Boolean) : ["Firmware"],
            status: parsed.status || "In Development",
            hardware: ["STM32 Microcontroller", "Power Electronics", "Sensor Bus"],
            metrics: {
              status: parsed.status || "Active",
              repo: parsed.github ? "Linked" : "Local"
            }
          });
        }
      }
    } catch {}
    return list;
  }, [_user]);

  const handleRpmChange = (val) => {
    setMotorRpm(val);
    setMotorCurrent(Number((0.3 + (val / 300) * 3.8).toFixed(1)));
    setBatteryVoltage(Number((24.6 - (val / 300) * 0.7).toFixed(1)));
  };

  const handleTeleop = (dir) => {
    if (eStop) return;
    const time = new Date().toTimeString().split(" ")[0];
    let cmd = "";
    if (dir === "fwd") {
      cmd = "[TELEOP] Move Forward: linear.x = 0.5 m/s";
      setDistance((d) => Math.max(0.2, Number((d - 0.15).toFixed(2))));
      setMotorCurrent(3.1);
    }
    if (dir === "back") {
      cmd = "[TELEOP] Move Reverse: linear.x = -0.3 m/s";
      setDistance((d) => Number((d + 0.2).toFixed(2)));
      setMotorCurrent(2.8);
    }
    if (dir === "left") {
      cmd = "[TELEOP] Pivot Left: angular.z = 1.2 rad/s";
      setImu((prev) => ({ ...prev, yaw: Number(((prev.yaw - 15 + 360) % 360).toFixed(1)) }));
      setMotorCurrent(2.2);
    }
    if (dir === "right") {
      cmd = "[TELEOP] Pivot Right: angular.z = -1.2 rad/s";
      setImu((prev) => ({ ...prev, yaw: Number(((prev.yaw + 15) % 360).toFixed(1)) }));
      setMotorCurrent(2.2);
    }
    if (dir === "stop") {
      cmd = "[TELEOP] Halt: linear.x = 0, angular.z = 0";
      setMotorCurrent(0.4);
    }

    setTelemetryLogs((prev) => [...prev.slice(-7), `${time} ${cmd}`]);
  };

  const handleEStopToggle = () => {
    const time = new Date().toTimeString().split(" ")[0];
    if (eStop) {
      setEStop(false);
      setMotorRpm(120);
      setMotorCurrent(2.1);
      setTelemetryLogs((prev) => [...prev.slice(-7), `${time} [SYSTEM] E-STOP Reset. Drivers armed.`]);
    } else {
      setEStop(true);
      setMotorRpm(0);
      setMotorCurrent(0.0);
      setTelemetryLogs((prev) => [...prev.slice(-7), `${time} [EMERGENCY STOP] Relay tripped! Motors disabled.`]);
    }
  };

  return (
    <div className="robotics-page">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DEPARTMENT OF ELECTRICAL & ELECTRONICS ENGINEERING</div>
          <h1>Robotics & IoT Developer Squad</h1>
          <p>
            Autonomous mobile robotics, distributed LoRa telemetry, high-power motor drives, and edge AI compute.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "roster", label: "Team Roster", icon: Bot },
            { id: "telemetry", label: "Live Telemetry", icon: Activity },
            { id: "projects", label: "Hardware Builds", icon: Layers },
            { id: "stack", label: "Silicon & Bench", icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: "38px",
                  padding: "0 15px",
                  borderRadius: "9px",
                  border: active ? "1px solid var(--navy)" : "1px solid var(--border)",
                  background: active ? "var(--navy)" : "#fff",
                  color: active ? "#fff" : "var(--muted)",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px"
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lab Stats Banner */}
      <div className="stat-grid" style={{ marginBottom: "22px" }}>
        {[
          { label: "Active Engineers", value: `${teamMembers.length} Developer${teamMembers.length === 1 ? "" : "s"}`, change: "Verified Workspace Members", icon: Bot },
          { label: "IoT Telemetry Mesh", value: "Online", change: "868MHz & MQTT Mesh", icon: Radio },
          { label: "Hardware Bench", value: "Equipped", change: "Oscilloscopes & Logic Pro", icon: Cpu },
          { label: "Telemetry Stream", value: eStop ? "E-STOP" : "50 Hz", change: eStop ? "Relay Tripped" : "Real-time CAN & Serial", icon: Zap }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon">
                <Icon size={18} />
              </div>
              <div>
                <span>{stat.label.toUpperCase()}</span>
                <strong>{stat.value}</strong>
                <small style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                  {stat.change}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* TAB 1: TEAM ROSTER */}
      {activeTab === "roster" && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "var(--shadow)"
            }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
              {/* Search */}
              <div className="search-box" style={{ maxWidth: "380px" }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by engineer name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ border: 0, background: "none", fontSize: "11px", color: "var(--muted)" }}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Domain Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              {TEAM_DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: selectedDomain === domain.id ? "1px solid var(--navy)" : "1px solid var(--border)",
                    background: selectedDomain === domain.id ? "var(--soft)" : "#fff",
                    color: selectedDomain === domain.id ? "var(--navy)" : "var(--muted)",
                    fontSize: "11px",
                    fontWeight: selectedDomain === domain.id ? "600" : "500"
                  }}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid or Clean Empty State */}
          {filteredMembers.length === 0 ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                boxShadow: "var(--shadow)"
              }}
            >
              <Bot size={40} style={{ color: "var(--muted)", margin: "0 auto 12px", opacity: 0.6 }} />
              <strong style={{ display: "block", fontSize: "15px", color: "var(--text)" }}>
                No team members found
              </strong>
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: "6px auto 0", maxWidth: "420px", lineHeight: "1.5" }}>
                {searchQuery || selectedDomain !== "all"
                  ? "No registered engineers match your selected filters."
                  : "Registered workspace members with assigned roles will appear in the team roster."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "18px"
              }}
            >
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setActiveMember(member)}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    boxShadow: "var(--shadow)",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.15s, box-shadow 0.15s"
                  }}
                >
                  {/* Top Banner & Photo */}
                  <div>
                    <div style={{ height: "70px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "rgba(16, 24, 39, 0.8)",
                          color: "#6edca8",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "9px",
                          fontWeight: "600",
                          fontFamily: "'DM Mono', monospace"
                        }}
                      >
                        {member.role?.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ padding: "0 18px 16px", marginTop: "-30px", position: "relative" }}>
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "12px",
                            objectFit: "cover",
                            border: "3px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                          }}
                        />
                      ) : (
                        <div
                          className="avatar small"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "12px",
                            border: "3px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                            fontSize: "18px",
                            fontWeight: "700"
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                      )}

                      <h3 style={{ fontSize: "16px", fontWeight: "700", marginTop: "10px" }}>{member.name}</h3>
                      <p style={{ fontSize: "11px", color: "var(--navy)", fontWeight: "600", marginTop: "2px" }}>
                        {member.role}
                      </p>
                      <span style={{ fontSize: "10px", color: "var(--muted)", display: "block", marginTop: "1px" }}>
                        {member.email}
                      </span>

                      {/* Status Pill */}
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: "var(--soft)",
                          border: "1px solid var(--border)",
                          fontSize: "10px",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {member.status}
                        </span>
                      </div>

                      {/* Skill Badges */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
                        {member.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: "9px",
                              padding: "3px 7px",
                              borderRadius: "6px",
                              background: "#eef2f6",
                              color: "var(--navy)",
                              fontWeight: "500",
                              fontFamily: "'DM Mono', monospace"
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      padding: "10px 18px",
                      borderTop: "1px solid var(--border)",
                      background: "#fbfcfd",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "11px"
                    }}
                  >
                    <span style={{ color: "var(--navy)", fontWeight: "600" }}>View Dossier →</span>
                    <div style={{ display: "flex", gap: "10px", color: "var(--muted)" }} onClick={(e) => e.stopPropagation()}>
                      <a href={`mailto:${member.email}`} title="Email Engineer" style={{ color: "var(--muted)" }}>
                        <Mail size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE TELEMETRY SIMULATOR */}
      {activeTab === "telemetry" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "18px" }}>
          {/* Main Controls & Gauges */}
          <div className="panel">
            <div className="panel-title">
              <h2>Autonomous Mobile Robot Telemetry (ROBO-EEE-V2)</h2>
              <span
                style={{
                  fontSize: "10px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: eStop ? "#fee2e2" : "#dcfce7",
                  color: eStop ? "#b91c1c" : "#15803d",
                  fontWeight: "600",
                  fontFamily: "'DM Mono', monospace"
                }}
              >
                {eStop ? "ESTOP TRIPPED" : "ONLINE [50Hz]"}
              </span>
            </div>

            {/* Live Gauges Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                margin: "18px 0"
              }}
            >
              <div style={{ padding: "12px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "10px" }}>
                  <span>BATTERY BMS</span>
                  <Battery size={14} color="#10b981" />
                </div>
                <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", fontFamily: "'DM Mono'" }}>
                  {batteryVoltage}V
                </strong>
                <span style={{ fontSize: "9px", color: "#10b981" }}>8S LiFePO4 (92%)</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "10px" }}>
                  <span>DRIVE CURRENT</span>
                  <Zap size={14} color="#f59e0b" />
                </div>
                <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", fontFamily: "'DM Mono'" }}>
                  {eStop ? "0.0" : motorCurrent}A
                </strong>
                <span style={{ fontSize: "9px", color: "#f59e0b" }}>Dual FOC Inverter</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "10px" }}>
                  <span>OBSTACLE PROX</span>
                  <Gauge size={14} color="#3b82f6" />
                </div>
                <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", fontFamily: "'DM Mono'" }}>
                  {distance}m
                </strong>
                <span style={{ fontSize: "9px", color: "#3b82f6" }}>LiDAR 360° Sector</span>
              </div>

              <div style={{ padding: "12px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: "10px" }}>
                  <span>IMU HEADING</span>
                  <Compass size={14} color="#8b5cf6" />
                </div>
                <strong style={{ fontSize: "20px", display: "block", marginTop: "4px", fontFamily: "'DM Mono'" }}>
                  {imu.yaw}°
                </strong>
                <span style={{ fontSize: "9px", color: "#8b5cf6" }}>BNO085 9-DOF</span>
              </div>
            </div>

            {/* Motor RPM Slider */}
            <div style={{ padding: "16px", borderRadius: "10px", background: "var(--soft)", border: "1px solid var(--border)", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px" }}>
                <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sliders size={14} /> Target Motor Velocity (FOC Vector Control):
                </span>
                <strong style={{ fontFamily: "'DM Mono'" }}>{motorRpm} RPM</strong>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={motorRpm}
                disabled={eStop}
                onChange={(e) => handleRpmChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--navy)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--muted)", marginTop: "4px" }}>
                <span>0 RPM (Stationary)</span>
                <span>150 RPM (Cruise)</span>
                <span>300 RPM (Max)</span>
              </div>
            </div>

            {/* Teleoperation Buttons & E-Stop */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => handleTeleop("fwd")}
                  disabled={eStop}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", display: "grid", placeItems: "center" }}
                  title="Forward"
                >
                  <ArrowUp size={16} />
                </button>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => handleTeleop("left")}
                    disabled={eStop}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", display: "grid", placeItems: "center" }}
                    title="Turn Left"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleTeleop("stop")}
                    disabled={eStop}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#dc2626", fontWeight: "700", fontSize: "9px" }}
                    title="Stop"
                  >
                    STOP
                  </button>
                  <button
                    onClick={() => handleTeleop("right")}
                    disabled={eStop}
                    style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", display: "grid", placeItems: "center" }}
                    title="Turn Right"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                <button
                  onClick={() => handleTeleop("back")}
                  disabled={eStop}
                  style={{ width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--border)", background: "#fff", display: "grid", placeItems: "center" }}
                  title="Reverse"
                >
                  <ArrowDown size={16} />
                </button>
              </div>

              <div>
                <button
                  onClick={handleEStopToggle}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    border: "0",
                    background: eStop ? "#16a34a" : "#dc2626",
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  {eStop ? <RefreshCw size={16} /> : <AlertTriangle size={16} />}
                  <span>{eStop ? "Reset Emergency Stop" : "EMERGENCY STOP (E-STOP)"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Packet Terminal */}
          <div className="panel">
            <div className="panel-title">
              <h2 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Terminal size={15} /> Telemetry Bus Feed
              </h2>
              <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "'DM Mono'" }}>CAN & MQTT</span>
            </div>
            <div
              style={{
                marginTop: "12px",
                background: "#0c131f",
                color: "#6edca8",
                borderRadius: "10px",
                padding: "12px",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                minHeight: "280px",
                maxHeight: "360px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              {telemetryLogs.map((log, i) => (
                <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "4px" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HARDWARE BUILDS */}
      {activeTab === "projects" && (
        <div>
          {publishedProjects.length === 0 ? (
            <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "var(--soft)",
                  border: "1px solid var(--border)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px",
                  color: "var(--navy)"
                }}
              >
                <Cpu size={26} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "6px" }}>No Hardware Builds Published Yet</h3>
              <p style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "440px", margin: "0 auto", lineHeight: "1.6" }}>
                Hardware prototypes and robotics engineering builds will appear here once saved from the Projects workspace.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
              {publishedProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className="panel"
                  style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                >
                  <div>
                    {proj.image ? (
                      <img
                        src={proj.image}
                        alt={proj.title}
                        style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", marginBottom: "12px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #0d2137 0%, #1e3a8a 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#93c5fd",
                          marginBottom: "12px"
                        }}
                      >
                        <Cpu size={36} />
                      </div>
                    )}
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "var(--soft)",
                        border: "1px solid var(--border)",
                        fontFamily: "'DM Mono'"
                      }}
                    >
                      {proj.badge}
                    </span>
                    <h3 style={{ fontSize: "15px", fontWeight: "700", marginTop: "8px" }}>{proj.title}</h3>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px", lineHeight: "1.5" }}>
                      {proj.description}
                    </p>

                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                      {proj.firmwareStack?.map((tech, i) => (
                        <span key={i} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: "#f0f4f8" }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      paddingTop: "10px",
                      marginTop: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px"
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>Status: {proj.status}</span>
                    <span style={{ color: "var(--navy)", fontWeight: "600" }}>Inspect Specs →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SILICON & BENCH STACK */}
      {activeTab === "stack" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {LAB_EQUIPMENT_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="panel">
              <div className="panel-title">
                <h2>{cat.category}</h2>
                <span style={{ fontSize: "10px", color: "var(--muted)" }}>{cat.description}</span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "12px",
                  marginTop: "16px"
                }}
              >
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "var(--soft)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <strong style={{ fontSize: "12px", display: "block" }}>{item.name}</strong>
                    <span style={{ fontSize: "10px", color: "var(--navy)", fontFamily: "'DM Mono'", display: "block", marginTop: "2px" }}>
                      {item.specs}
                    </span>
                    <small style={{ fontSize: "9px", color: "var(--muted)", display: "block", marginTop: "4px" }}>
                      {item.useCase}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEMBER DOSSIER MODAL */}
      {activeMember && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px"
          }}
          onClick={() => setActiveMember(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                position: "relative",
                height: "130px",
                background: "linear-gradient(135deg, #0d2137 0%, #1a365d 50%, #2b6cb0 100%)",
                borderRadius: "16px 16px 0 0",
                overflow: "hidden"
              }}
            >
              {activeMember.coverImage ? (
                <img
                  src={activeMember.coverImage}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }}
                />
              ) : null}
              <button
                onClick={() => setActiveMember(null)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(255,255,255,0.9)",
                  border: 0,
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: "0 24px 24px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginTop: "-35px" }}>
                {activeMember.avatar ? (
                  <img
                    src={activeMember.avatar}
                    alt={activeMember.name}
                    style={{ width: "76px", height: "76px", borderRadius: "16px", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}
                  />
                ) : (
                  <div
                    className="avatar small"
                    style={{
                      width: "76px",
                      height: "76px",
                      borderRadius: "16px",
                      border: "4px solid #fff",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                      fontSize: "22px",
                      fontWeight: "700"
                    }}
                  >
                    {getInitials(activeMember.name)}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700" }}>{activeMember.name}</h2>
                  <p style={{ fontSize: "12px", color: "var(--navy)", fontWeight: "600" }}>{activeMember.role}</p>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {activeMember.department || "Department of Electrical & Electronics Engineering"}{activeMember.joinedDate ? ` • Member since ${activeMember.joinedDate}` : ""}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "18px", padding: "14px", borderRadius: "10px", background: "var(--soft)" }}>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "4px" }}>
                  Engineering Mission & Background
                </h4>
                <p style={{ fontSize: "12px", lineHeight: "1.6", color: "#334155" }}>
                  {activeMember.bio || `${activeMember.name} is a member of the Department of Electrical & Electronics Engineering.`}
                </p>
              </div>

              {activeMember.skills && activeMember.skills.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "8px" }}>
                    Core Proficiencies
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {activeMember.skills.map((s, i) => (
                      <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                          <span>{s.name}</span>
                          <strong style={{ fontFamily: "'DM Mono'" }}>{s.level}%</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMember.hardwareTools && activeMember.hardwareTools.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                    Primary Hardware Tools
                  </h4>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {activeMember.hardwareTools.map((t, i) => (
                      <span
                        key={i}
                        style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "6px", background: "#f0f4f8", fontFamily: "'DM Mono'" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  {activeMember.socials?.github && (
                    <a href={activeMember.socials.github} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                      <Github size={14} /> GitHub
                    </a>
                  )}
                  {activeMember.socials?.linkedin && (
                    <a href={activeMember.socials.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                      <Linkedin size={14} /> LinkedIn
                    </a>
                  )}
                  <span style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    Status: <strong style={{ color: "#16a34a" }}>{activeMember.status}</strong>
                  </span>
                </div>
                <a
                  href={`mailto:${activeMember.email || ""}`}
                  className="primary-button compact"
                  style={{ textDecoration: "none" }}
                >
                  <Mail size={14} /> Contact Engineer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT SPEC MODAL */}
      {selectedProject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px"
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>{selectedProject.badge}</span>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginTop: "2px" }}>{selectedProject.title}</h2>
              </div>
              <button onClick={() => setSelectedProject(null)} style={{ border: 0, background: "none" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#475569", marginTop: "12px", lineHeight: "1.6" }}>
              {selectedProject.description}
            </p>

            {selectedProject.hardware && selectedProject.hardware.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
                  Hardware Components
                </h4>
                <ul style={{ fontSize: "11px", paddingLeft: "18px", color: "#334155" }}>
                  {selectedProject.hardware.map((h, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedProject.metrics && Object.keys(selectedProject.metrics).length > 0 && (
              <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {Object.entries(selectedProject.metrics).map(([k, v], i) => (
                  <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--soft)" }}>
                    <span style={{ fontSize: "9px", textTransform: "uppercase", color: "var(--muted)", display: "block" }}>{k}</span>
                    <strong style={{ fontSize: "12px", fontFamily: "'DM Mono'" }}>{v}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button className="primary-button compact" onClick={() => setSelectedProject(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
