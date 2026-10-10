import { useState, useMemo, useEffect } from "react";
import {
  Bot,
  Cpu,
  Search,
  Layers,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit3,
  X,
  Mail,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Radio,
  Activity,
  ExternalLink,
  ClipboardList,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Tag,
  Phone,
  Sparkles
} from "lucide-react";
import { Github, Linkedin } from "../components/SocialIcons";
import { TEAM_DOMAINS } from "../data/teamData";
import { getRegisteredUsers } from "../utils/userDirectory";

const EQUIPMENT_KEY = "mocosn_hardware_bench";
function loadEquipment() {
  try { return JSON.parse(localStorage.getItem(EQUIPMENT_KEY) || "[]"); } catch { return []; }
}
function saveEquipment(data) {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(data));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "U") {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";
}

const PRIORITY_STYLES = {
  High:   { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
  Medium: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Low:    { bg: "#d0f0ff", color: "#0078a8", dot: "#00a8d4" }
};

const STATUS_STYLES = {
  "To Do":       { bg: "#f1f5f9", color: "#475569", icon: Square },
  "In Progress": { bg: "#fef3c7", color: "#92400e", icon: Clock },
  "Done":        { bg: "#dcfce7", color: "#15803d", icon: CheckCircle2 },
  "Blocked":     { bg: "#fee2e2", color: "#b91c1c", icon: AlertCircle }
};

const CAT_ICONS = {
  "Microcontrollers & Compute Engines": Cpu,
  "Communication & Wireless Protocols": Radio,
  "Test, Measurement & EDA Infrastructure": Activity
};

const TASKS_KEY = "mocosn_dev_tasks";
function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"); } catch { return []; }
}
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

const emptyTask = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  assignee: "",
  tags: ""
};

export default function RoboticsTeam({ user: _user }) {
  const [activeTab, setActiveTab] = useState("roster");

  // Roster state
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMember, setActiveMember] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  function handleCopyEmail(email) {
    if (!email) return;
    navigator.clipboard?.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  }

  // Dev Tasks state
  const [tasks, setTasks] = useState(loadTasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskFilter, setTaskFilter] = useState("All");
  const [taskSearch, setTaskSearch] = useState("");

  // Bench state
  const [equipment, setEquipment] = useState(loadEquipment);
  const [selectedCatIdx, setSelectedCatIdx] = useState(0);
  const isAdmin = _user?.role === "Admin";

  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const [showItemForm, setShowItemForm] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemSpecs, setItemSpecs] = useState("");
  const [itemUseCase, setItemUseCase] = useState("");

  // ── Team Members ────────────────────────────────────────────────────────────
  const teamMembers = useMemo(() => {
    const list = getRegisteredUsers().filter(u => Boolean(u.role));
    if (list.length === 0 && _user?.role) {
      return [{
        id: _user.uid || "usr-current",
        name: _user.displayName || "Workspace Administrator",
        email: _user.email || "",
        role: _user.role,
        status: "Active in Lab",
        joinedDate: "2026",
        avatar: _user.photoURL || "",
        bio: "Workspace Administrator overseeing robotics research, hardware builds, and development pipelines.",
        skills: [
          { name: "System Architecture", level: 95 },
          { name: "Embedded Hardware", level: 90 },
          { name: "Hardware Bench Governance", level: 88 }
        ],
        hardwareTools: ["Lab Workstation", "Hardware Bench", "Logic Analyzer"]
      }];
    }
    return list.map(u => {
      const isCurrent = _user?.uid && u.id === _user.uid;
      let localInterests = null;
      let localTools = null;
      if (isCurrent) {
        try { localInterests = JSON.parse(localStorage.getItem(`mocosn_interests_${_user.uid}`) || "null"); } catch {}
        try { localTools = JSON.parse(localStorage.getItem(`mocosn_hardwareTools_${_user.uid}`) || "null"); } catch {}
      }
      const localBio = isCurrent ? localStorage.getItem("mocosn_bio") : null;
      const localGithub = isCurrent ? localStorage.getItem(`mocosn_github_${_user.uid}`) : null;
      const localLinkedin = isCurrent ? localStorage.getItem(`mocosn_linkedin_${_user.uid}`) : null;
      const localPhone = isCurrent ? localStorage.getItem(`mocosn_phone_${_user.uid}`) : null;

      const userInterests = (localInterests && localInterests.length)
        ? localInterests
        : (u.interests && u.interests.length)
          ? u.interests
          : (u.role === "Admin" ? ["System Architecture", "Hardware Governance", "Quality Assurance"] : ["FPGA Synthesis", "ROS 2 & Kinematics", "Embedded C / RTOS"]);

      const userTools = (localTools && localTools.length)
        ? localTools
        : (u.hardwareTools && u.hardwareTools.length)
          ? u.hardwareTools
          : (u.role === "Admin" ? ["Admin Workstation", "Digital Storage Oscilloscope", "Hardware Logic Analyzer"] : ["FPGA Dev Bench", "CAN Bus Analyzer", "Digital Multimeter", "JTAG Debugger"]);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status === "Active" ? "Active in Lab" : "Pending Approval",
        joinedDate: u.joinedDate || "2026",
        avatar: u.avatar || "",
        bio: (isCurrent && localBio) ? localBio : (u.bio || `${u.name} is a verified workspace ${u.role} in the Department of Electrical & Electronics Engineering, focused on VLSI architectures, micro-robotics, and autonomous systems.`),
        interests: userInterests,
        hardwareTools: userTools,
        github: (isCurrent && localGithub) ? localGithub : (u.github || ""),
        linkedin: (isCurrent && localLinkedin) ? localLinkedin : (u.linkedin || ""),
        phone: (isCurrent && localPhone) ? localPhone : (u.phone || ""),
        skills: u.skills || (u.role === "Admin" ? [
          { name: "System Architecture & Review", level: 95 },
          { name: "Resource Governance", level: 92 },
          { name: "Bench Quality Assurance", level: 90 }
        ] : [
          { name: "RTL Design & Verilog / VHDL", level: 92 },
          { name: "ROS 2 & Robotics Firmware", level: 88 },
          { name: "Hardware Integration & Testing", level: 86 }
        ])
      };
    });
  }, [_user]);

  const filteredMembers = useMemo(() => teamMembers.filter(m => {
    const matchDomain = selectedDomain === "all" || m.role === selectedDomain;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
    return matchDomain && matchSearch;
  }), [teamMembers, selectedDomain, searchQuery]);

  // Handle member active state reset on filter change
  useEffect(() => {
    if (activeMember && !filteredMembers.find(m => m.id === activeMember.id)) {
      setActiveMember(null);
    }
  }, [filteredMembers, activeMember]);


  // ── Dev Tasks CRUD ──────────────────────────────────────────────────────────
  function saveTask() {
    if (!taskForm.title.trim()) return;
    const now = new Date().toISOString();
    if (editingTaskId) {
      const updated = tasks.map(t => t.id === editingTaskId ? { ...t, ...taskForm, updatedAt: now } : t);
      setTasks(updated); saveTasks(updated);
    } else {
      const next = [{ id: `task_${Date.now()}`, ...taskForm, createdAt: now, updatedAt: now }, ...tasks];
      setTasks(next); saveTasks(next);
    }
    setTaskForm(emptyTask); setEditingTaskId(null); setShowTaskForm(false);
  }

  function deleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    const next = tasks.filter(t => t.id !== id);
    setTasks(next); saveTasks(next);
  }

  function editTask(task) {
    setTaskForm({ title: task.title, description: task.description || "", status: task.status, priority: task.priority, assignee: task.assignee || "", tags: task.tags || "" });
    setEditingTaskId(task.id); setShowTaskForm(true);
  }

  function cycleStatus(task) {
    const order = ["To Do", "In Progress", "Done", "Blocked"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    const updated = tasks.map(t => t.id === task.id ? { ...t, status: next, updatedAt: new Date().toISOString() } : t);
    setTasks(updated); saveTasks(updated);
  }

  const filteredTasks = useMemo(() => tasks.filter(t => {
    const matchFilter = taskFilter === "All" || t.status === taskFilter;
    const q = taskSearch.toLowerCase();
    const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.assignee?.toLowerCase().includes(q) || t.tags?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  }), [tasks, taskFilter, taskSearch]);

  const taskCounts = useMemo(() => ({
    todo:  tasks.filter(t => t.status === "To Do").length,
    progress: tasks.filter(t => t.status === "In Progress").length,
    done: tasks.filter(t => t.status === "Done").length,
    blocked: tasks.filter(t => t.status === "Blocked").length
  }), [tasks]);

  // ── Hardware Bench CRUD ───────────────────────────────────────────────────────
  function saveCategory() {
    if (!catName.trim()) return;
    const next = [...equipment, { category: catName, description: catDesc, items: [] }];
    setEquipment(next); saveEquipment(next);
    setCatName(""); setCatDesc(""); setShowCatForm(false);
  }

  function saveItem() {
    if (!itemName.trim() || selectedCatIdx >= equipment.length) return;
    const next = [...equipment];
    next[selectedCatIdx].items.push({ name: itemName, specs: itemSpecs, useCase: itemUseCase });
    setEquipment(next); saveEquipment(next);
    setItemName(""); setItemSpecs(""); setItemUseCase(""); setShowItemForm(false);
  }

  function deleteCategory(idx) {
    if(!window.confirm("Delete this entire category and all its items?")) return;
    const next = equipment.filter((_, i) => i !== idx);
    setEquipment(next); saveEquipment(next);
    setSelectedCatIdx(0);
  }

  function deleteItem(catIdx, itemIdx) {
    if(!window.confirm("Delete this equipment item?")) return;
    const next = [...equipment];
    next[catIdx].items = next[catIdx].items.filter((_, i) => i !== itemIdx);
    setEquipment(next); saveEquipment(next);
  }

  const workspaceProjects = useMemo(() => {
    try {
      const listRaw = localStorage.getItem(`mocosn_projects_list_${_user?.uid || "guest"}`);
      if (listRaw) {
        const list = JSON.parse(listRaw);
        if (Array.isArray(list) && list.length > 0) return list;
      }
    } catch {}
    return [];
  }, [_user]);

  const STATUS_PROJ = {
    Active:      { bg: "#d0f0ff", color: "#0078a8" },
    Development: { bg: "#fef3c7", color: "#92400e" },
    Calibrating: { bg: "#ede9fe", color: "#7c3aed" },
    Archived:    { bg: "#f1f5f9", color: "#64748b" }
  };

  const tabs = [
    { id: "roster",   label: "Team Roster",     icon: Bot },
    { id: "devtasks", label: "Dev Projects",    icon: Layers },
    { id: "bench",    label: "Hardware Bench",  icon: Cpu }
  ];

  return (
    <div>
      {/* ── Page Heading ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DEPARTMENT OF ELECTRICAL & ELECTRONICS ENGINEERING</div>
          <h1>Robotics & IoT Developer Squad</h1>
          <p>Team roster, development project board, and lab hardware bench catalogue.</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={active ? "primary-button compact" : "outline-button"}
                style={active ? {} : { background: "var(--card)" }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-grid" style={{ marginBottom: "22px" }}>
        {[
          { label: "Active Engineers",   value: `${teamMembers.length}`,  sub: "Verified workspace members", icon: Bot,       iconBg: "#d0f0ff", iconColor: "#0078a8" },
          { label: "Dev Tasks",          value: `${tasks.length}`,        sub: `${taskCounts.progress} in progress`, icon: Layers,    iconBg: "#fef3c7", iconColor: "#b45309" },
          { label: "Projects Uploaded",  value: `${workspaceProjects.length}`, sub: "From Projects workspace", icon: CheckSquare, iconBg: "#dcfce7", iconColor: "#15803d" },
          { label: "Hardware Bench",     value: "Equipped",               sub: "Oscilloscopes & Logic Pro",  icon: Cpu,       iconBg: "#ede9fe", iconColor: "#7c3aed" }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>
                <Icon size={18} />
              </div>
              <div>
                <span>{s.label.toUpperCase()}</span>
                <strong style={{ fontFamily: "DM Mono", fontSize: "22px" }}>{s.value}</strong>
                <small style={{ display: "block", fontSize: "10px", color: "var(--muted)", marginTop: "3px" }}>{s.sub}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════
          TAB 1: TEAM ROSTER
      ════════════════════════════════════════════════════ */}
      {activeTab === "roster" && (
        <div className="projects-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "18px", alignItems: "start" }}>
          
          {/* LEFT: Members List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="panel" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                <div className="search-box" style={{ flex: 1, height: "38px" }}>
                  <Search size={14} />
                  <input
                    placeholder="Search name, email or role..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} style={{ border: 0, background: "none", color: "var(--muted)", cursor: "pointer" }}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                {TEAM_DOMAINS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d.id)}
                    style={{
                      padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", cursor: "pointer",
                      border: selectedDomain === d.id ? "1px solid var(--navy)" : "1px solid var(--border)",
                      background: selectedDomain === d.id ? "var(--navy)" : "var(--card)",
                      color: selectedDomain === d.id ? "#fff" : "var(--muted)"
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="project-recycler" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>
              {filteredMembers.length === 0 ? (
                <div className="panel" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Bot size={36} style={{ color: "var(--muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <strong style={{ display: "block", fontSize: "14px" }}>No members found</strong>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>Adjust filters or search query.</p>
                </div>
              ) : (
                filteredMembers.map(member => {
                  const isActive = activeMember?.id === member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => setActiveMember(member)}
                      style={{
                        background: isActive ? "var(--soft)" : "var(--card)",
                        border: `1.5px solid ${isActive ? "var(--blue)" : "var(--border)"}`,
                        borderRadius: "12px", padding: "14px", cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isActive ? "0 0 0 3px rgba(26,127,212,0.1)" : "none",
                        display: "flex", alignItems: "center", gap: "14px"
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} style={{
                            width: "46px", height: "46px", borderRadius: "12px",
                            objectFit: "cover", background: "var(--soft)"
                          }} />
                        ) : (
                          <div className="avatar small" style={{
                            width: "46px", height: "46px", borderRadius: "12px",
                            fontSize: "15px", fontWeight: "700"
                          }}>
                            {getInitials(member.name)}
                          </div>
                        )}
                        <div style={{
                          position: "absolute", bottom: "-3px", right: "-3px",
                          width: "12px", height: "12px", borderRadius: "50%",
                          background: member.status === "Pending Approval" ? "#f59e0b" : "#10b981",
                          border: "2px solid var(--card)"
                        }} title={member.status} />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: "14px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--text)" }}>
                          {member.name}
                        </strong>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "3px" }}>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {member.role}
                          </span>
                          {member.role === "Admin" && (
                            <span style={{ fontSize: "9px", background: "var(--blue)", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                        {member.interests?.length > 0 && (
                          <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                            {member.interests.slice(0, 2).map((it, idx) => (
                              <span key={idx} style={{
                                fontSize: "9px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: "var(--soft)",
                                color: "var(--blue)",
                                border: "1px solid var(--border)",
                                whiteSpace: "nowrap"
                              }}>
                                {it}
                              </span>
                            ))}
                            {member.interests.length > 2 && (
                              <span style={{ fontSize: "9px", color: "var(--muted)", alignSelf: "center" }}>+{member.interests.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Member Dossier */}
          <div style={{ position: "sticky", top: "18px" }}>
            {activeMember ? (
              <div className="panel" style={{ padding: 0, overflow: "hidden", border: "1.5px solid var(--border)", boxShadow: "var(--shadow)" }}>
                {/* Tech Banner */}
                <div style={{
                  height: "85px",
                  background: "linear-gradient(135deg, #071527 0%, #0d2948 55%, #134673 100%)",
                  position: "relative",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      background: "rgba(0, 200, 255, 0.15)",
                      border: "1px solid rgba(0, 200, 255, 0.35)",
                      color: "#00c8ff",
                      fontSize: "9px",
                      fontWeight: "700",
                      fontFamily: "DM Mono",
                      letterSpacing: "0.8px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase"
                    }}>
                      LAB DOSSIER • EEE DEPT
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveMember(null)}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: 0,
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      color: "#fff",
                      transition: "background 0.15s"
                    }}
                    title="Close Dossier"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ padding: "0 20px 22px" }}>
                  {/* Avatar & Identity Row */}
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-end", marginTop: "-30px", marginBottom: "16px" }}>
                    <div style={{ position: "relative" }}>
                      {activeMember.avatar ? (
                        <img
                          src={activeMember.avatar}
                          alt={activeMember.name}
                          style={{
                            width: "66px",
                            height: "66px",
                            borderRadius: "14px",
                            objectFit: "cover",
                            border: "3.5px solid var(--card)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            background: "var(--card)"
                          }}
                        />
                      ) : (
                        <div
                          className="avatar small"
                          style={{
                            width: "66px",
                            height: "66px",
                            borderRadius: "14px",
                            border: "3.5px solid var(--card)",
                            fontSize: "22px",
                            fontWeight: "700",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                          }}
                        >
                          {getInitials(activeMember.name)}
                        </div>
                      )}
                      <span
                        style={{
                          position: "absolute",
                          bottom: "2px",
                          right: "2px",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: "#10b981",
                          border: "2px solid var(--card)"
                        }}
                        title="Active Status"
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0, paddingBottom: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, lineHeight: 1.2 }}>
                          {activeMember.name}
                        </h2>
                        <span style={{
                          fontSize: "9px",
                          fontWeight: "700",
                          fontFamily: "DM Mono",
                          letterSpacing: "0.5px",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: activeMember.role === "Admin" ? "rgba(220, 38, 38, 0.12)" : "rgba(26, 127, 212, 0.12)",
                          color: activeMember.role === "Admin" ? "#dc2626" : "var(--blue)",
                          border: `1px solid ${activeMember.role === "Admin" ? "rgba(220, 38, 38, 0.25)" : "rgba(26, 127, 212, 0.25)"}`
                        }}>
                          {activeMember.role?.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", margin: 0 }}>
                        Electrical & Electronics Engineering · Robotics Lab
                      </p>
                    </div>
                  </div>

                  {/* Quick Meta Stats Ribbon */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "var(--soft)",
                    border: "1px solid var(--border)",
                    marginBottom: "16px"
                  }}>
                    <div>
                      <span style={{ display: "block", fontSize: "8px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px" }}>LAB STATUS</span>
                      <strong style={{ fontSize: "11px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        ● Active
                      </strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "8px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px" }}>SPECIALTY</span>
                      <strong style={{ fontSize: "11px", color: "var(--text)", marginTop: "2px", display: "block" }}>
                        {activeMember.role === "Admin" ? "Governance" : "VLSI & ROS 2"}
                      </strong>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "8px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px" }}>TENURE</span>
                      <strong style={{ fontSize: "11px", color: "var(--text)", marginTop: "2px", display: "block" }}>
                        Since {activeMember.joinedDate || "2026"}
                      </strong>
                    </div>
                  </div>

                  {/* Research Interests & Specializations */}
                  {activeMember.interests?.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                        <Sparkles size={13} color="var(--blue)" />
                        <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase" }}>
                          Research Interests & Specializations
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {activeMember.interests.map((it, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              background: "var(--soft)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <Tag size={10} color="var(--blue)" />
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Background / Bio */}
                  <div style={{ marginBottom: "16px" }}>
                    <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Professional Background
                    </span>
                    <div style={{ padding: "11px 13px", borderRadius: "9px", background: "var(--card)", border: "1px solid var(--border)", fontSize: "12px", lineHeight: "1.55", color: "var(--text)" }}>
                      {activeMember.bio}
                    </div>
                  </div>

                  {/* Core Proficiencies */}
                  {activeMember.skills?.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                        Core Proficiencies & Technical Mastery
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {activeMember.skills.map((s, i) => (
                          <div key={i} style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--soft)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "5px" }}>
                              <span style={{ fontWeight: "600", color: "var(--text)" }}>{s.name}</span>
                              <strong style={{ fontFamily: "DM Mono", color: "var(--blue)", fontSize: "11px" }}>{s.level}%</strong>
                            </div>
                            <div style={{ height: "5px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${s.level}%`, background: "linear-gradient(90deg, #1a7fd4, #00c8ff)", borderRadius: "4px" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hardware Tools */}
                  {activeMember.hardwareTools?.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <span style={{ fontSize: "9px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                        Primary Hardware & Instrumentation
                      </span>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {activeMember.hardwareTools.map((t, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "10px",
                              padding: "4px 10px",
                              borderRadius: "7px",
                              background: "var(--soft)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px"
                            }}
                          >
                            <Cpu size={12} color="var(--blue)" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DIRECT CONTACT & COMMUNICATION CARD */}
                  <div style={{
                    borderRadius: "12px",
                    background: "var(--soft)",
                    border: "1px solid var(--border)",
                    padding: "14px 16px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <Mail size={14} color="var(--blue)" />
                      <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: "0.6px", textTransform: "uppercase", color: "var(--muted)" }}>
                        Direct Lab Communication
                      </span>
                    </div>

                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      marginBottom: "12px",
                      fontSize: "12px"
                    }}>
                      <span style={{ fontFamily: "DM Mono", color: "var(--text)", wordBreak: "break-all" }}>
                        {activeMember.email || `${activeMember.name?.toLowerCase().replace(/\s+/g, "")}@mocosn.in`}
                      </span>
                      <button
                        onClick={() => handleCopyEmail(activeMember.email || `${activeMember.name?.toLowerCase().replace(/\s+/g, "")}@mocosn.in`)}
                        style={{
                          background: "none",
                          border: 0,
                          color: copiedEmail ? "#10b981" : "var(--muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "2px 6px"
                        }}
                        title="Copy email to clipboard"
                      >
                        {copiedEmail ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        {copiedEmail ? "Copied" : "Copy"}
                      </button>
                    </div>

                    {/* Phone / Lab Room if present */}
                    {activeMember.phone && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        marginBottom: "12px",
                        fontSize: "11px",
                        color: "var(--text)"
                      }}>
                        <Phone size={13} color="var(--blue)" />
                        <span>{activeMember.phone}</span>
                      </div>
                    )}

                    {/* Social links (GitHub, LinkedIn) if configured */}
                    {(activeMember.github || activeMember.linkedin) && (
                      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                        {activeMember.github && (
                          <a
                            href={activeMember.github.startsWith("http") ? activeMember.github : `https://${activeMember.github}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "var(--text)",
                              textDecoration: "none"
                            }}
                          >
                            <Github size={13} /> GitHub <ExternalLink size={11} color="var(--muted)" />
                          </a>
                        )}
                        {activeMember.linkedin && (
                          <a
                            href={activeMember.linkedin.startsWith("http") ? activeMember.linkedin : `https://${activeMember.linkedin}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "7px 12px",
                              borderRadius: "8px",
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#0a66c2",
                              textDecoration: "none"
                            }}
                          >
                            <Linkedin size={13} /> LinkedIn <ExternalLink size={11} color="var(--muted)" />
                          </a>
                        )}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <a
                        href={`mailto:${activeMember.email || `${activeMember.name?.toLowerCase().replace(/\s+/g, "")}@mocosn.in`}`}
                        style={{
                          flex: 1,
                          height: "36px",
                          borderRadius: "8px",
                          background: "var(--blue)",
                          color: "#fff",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          boxShadow: "0 2px 8px rgba(26,127,212,0.25)"
                        }}
                      >
                        <Send size={13} /> Send Email
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="panel" style={{ padding: "60px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", border: "2px dashed var(--border)" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--soft)", color: "var(--muted)", display: "grid", placeItems: "center", marginBottom: "16px" }}>
                  <Bot size={32} />
                </div>
                <h3 style={{ fontSize: "16px", marginBottom: "6px" }}>Select a Team Member</h3>
                <p style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "260px", lineHeight: "1.5" }}>
                  Click on an engineer in the roster to view their full dossier, skill proficiencies, and contact information.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB 2: DEV PROJECTS TASK BOARD
      ════════════════════════════════════════════════════ */}
      {activeTab === "devtasks" && (
        <div className="projects-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "18px", alignItems: "start" }}>
          
          {/* LEFT: Task List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="panel" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ClipboardList size={15} /> Development Tasks
                </h2>
                <button
                  className="primary-button compact"
                  onClick={() => { setTaskForm(emptyTask); setEditingTaskId(null); setShowTaskForm(true); }}
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
              
              <div className="search-box" style={{ width: "100%", height: "36px", marginBottom: "12px" }}>
                <Search size={14} />
                <input value={taskSearch} onChange={e => setTaskSearch(e.target.value)} placeholder="Search tasks..." />
                {taskSearch && <button onClick={() => setTaskSearch("")} style={{ border: 0, background: "none", color: "var(--muted)", cursor: "pointer" }}><X size={13} /></button>}
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {["All", "To Do", "In Progress", "Done", "Blocked"].map(f => {
                  const count = f === "All" ? tasks.length : tasks.filter(t => t.status === f).length;
                  return (
                    <button key={f} onClick={() => setTaskFilter(f)}
                      style={{
                        padding: "4px 10px", borderRadius: "16px", fontSize: "10px", fontWeight: "600", cursor: "pointer",
                        border: taskFilter === f ? "1px solid var(--navy)" : "1px solid var(--border)",
                        background: taskFilter === f ? "var(--navy)" : "var(--card)",
                        color: taskFilter === f ? "#fff" : "var(--muted)"
                      }}>
                      {f} {count > 0 && <span style={{ marginLeft: "3px", opacity: 0.7 }}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="project-recycler" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>
              {filteredTasks.length === 0 ? (
                <div className="panel" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Layers size={36} style={{ color: "var(--muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <strong style={{ display: "block", fontSize: "14px" }}>No tasks found</strong>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>Create a task or adjust filters.</p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const st = STATUS_STYLES[task.status] || STATUS_STYLES["To Do"];
                  const pr = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
                  const StIcon = st.icon;
                  const tags = task.tags ? task.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
                  const isActive = editingTaskId === task.id && showTaskForm;
                  
                  return (
                    <div key={task.id} style={{
                      background: isActive ? "var(--soft)" : "var(--card)",
                      border: `1.5px solid ${isActive ? "var(--blue)" : "var(--border)"}`,
                      borderRadius: "12px", padding: "16px",
                      boxShadow: isActive ? "0 0 0 3px rgba(26,127,212,0.1)" : "var(--shadow)",
                      transition: "all 0.15s ease"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <button onClick={() => cycleStatus(task)} style={{ border: "none", background: "none", cursor: "pointer", color: st.color, flexShrink: 0, marginTop: "2px" }} title="Cycle Status">
                          <StIcon size={17} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                            <strong style={{
                              fontSize: "13px", flex: 1,
                              textDecoration: task.status === "Done" ? "line-through" : "none",
                              color: task.status === "Done" ? "var(--muted)" : "var(--text)"
                            }}>{task.title}</strong>
                            <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "9px", fontWeight: "700", background: pr.bg, color: pr.color, display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: pr.dot }} /> {task.priority}
                            </span>
                          </div>
                          
                          {task.description && (
                            <p style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {task.description}
                            </p>
                          )}
                          
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            {task.assignee && (
                              <span style={{ fontSize: "10px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "3px" }}>
                                <Bot size={11} /> {task.assignee}
                              </span>
                            )}
                            {tags.map(t => (
                              <span key={t} style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "8px", background: "#d0f0ff", color: "#0078a8", fontFamily: "DM Mono" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                          {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                        </span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => editTask(task)} style={{ border: "1px solid var(--border)", background: "var(--card)", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }} title="Edit"><Edit3 size={12} /> Edit</button>
                          <button onClick={() => deleteTask(task.id)} style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }} title="Delete"><Trash2 size={12} /> Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Workspace Projects OR Task Form */}
          <div style={{ position: "sticky", top: "18px" }}>
            {showTaskForm ? (
              <div className="panel" style={{ padding: "20px", border: "1.5px solid var(--blue)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <ClipboardList size={16} color="var(--blue)" />
                    {editingTaskId ? "Edit Task" : "New Task"}
                  </h3>
                  <button onClick={() => { setShowTaskForm(false); setEditingTaskId(null); setTaskForm(emptyTask); }} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)" }}>
                    <X size={16} />
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <label className="field">
                    <span>Task Title <span style={{ color: "var(--danger)" }}>*</span></span>
                    <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Implement CAN Bus handler" />
                  </label>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <label className="field">
                      <span>Status</span>
                      <select value={taskForm.status} onChange={e => setTaskForm(f => ({ ...f, status: e.target.value }))}>
                        {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Priority</span>
                      <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}>
                        {Object.keys(PRIORITY_STYLES).map(p => <option key={p}>{p}</option>)}
                      </select>
                    </label>
                  </div>
                  
                  <label className="field">
                    <span>Assigned To</span>
                    <input value={taskForm.assignee} onChange={e => setTaskForm(f => ({ ...f, assignee: e.target.value }))} placeholder="Engineer name" />
                  </label>
                  
                  <label className="field">
                    <span>Tags (comma-separated)</span>
                    <input value={taskForm.tags} onChange={e => setTaskForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. firmware, motor" />
                  </label>
                  
                  <label className="field">
                    <span>Description</span>
                    <textarea rows={4} value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details, acceptance criteria..." />
                  </label>
                </div>
                
                <button className="primary-button compact" style={{ width: "100%", justifyContent: "center" }} onClick={saveTask} disabled={!taskForm.title.trim()}>
                  <CheckCircle2 size={14} /> {editingTaskId ? "Update Task" : "Create Task"}
                </button>
              </div>
            ) : (
              <div className="panel" style={{ padding: "20px" }}>
                <h2 style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <Layers size={16} color="var(--blue)" /> Linked Workspace Projects
                </h2>
                
                {workspaceProjects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 10px" }}>
                    <Layers size={32} style={{ color: "var(--muted)", margin: "0 auto 12px", opacity: 0.5 }} />
                    <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: "1.5" }}>No hardware builds published yet. Go to the Projects workspace to add one.</p>
                  </div>
                ) : (
                  <div className="project-recycler" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "55vh", overflowY: "auto", paddingRight: "4px" }}>
                    {workspaceProjects.map(proj => {
                      const st = STATUS_PROJ[proj.status] || STATUS_PROJ.Development;
                      return (
                        <div key={proj.id} style={{ padding: "14px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--soft)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                            <strong style={{ fontSize: "13px", lineHeight: "1.3" }}>{proj.name}</strong>
                            <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "9px", fontWeight: "700", background: st.bg, color: st.color, flexShrink: 0 }}>{proj.status}</span>
                          </div>
                          {proj.github && (
                            <a href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
                              target="_blank" rel="noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "var(--blue)" }}
                            >
                              <ExternalLink size={11} /> GitHub Repo
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          TAB 3: HARDWARE BENCH
      ════════════════════════════════════════════════════ */}
      {activeTab === "bench" && (
        <div className="projects-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "18px", alignItems: "start" }}>
          
          {/* LEFT: Categories List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="panel" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#d0f0ff", color: "#0078a8", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Wrench size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "13px", display: "block" }}>Equipment Catalogue</strong>
                    <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Select a category to view items.</p>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={() => { setShowCatForm(true); setShowItemForm(false); }} className="primary-button compact" title="Add Category">
                    <Plus size={14} /> Add Category
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {equipment.length === 0 ? (
                <div className="panel" style={{ padding: "40px 20px", textAlign: "center" }}>
                  <Wrench size={36} style={{ color: "var(--muted)", marginBottom: "12px", opacity: 0.5 }} />
                  <strong style={{ display: "block", fontSize: "14px" }}>No categories found</strong>
                  <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>{isAdmin ? "Click 'Add Category' to get started." : "Waiting for admin to add equipment."}</p>
                </div>
              ) : (
                equipment.map((cat, idx) => {
                  const CatIcon = CAT_ICONS[cat.category] || Cpu;
                  const isActive = selectedCatIdx === idx && !showCatForm && !showItemForm;
                  return (
                    <div
                      key={idx}
                      onClick={() => { setSelectedCatIdx(idx); setShowCatForm(false); setShowItemForm(false); }}
                      className="panel"
                      style={{
                        padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.15s ease",
                        background: isActive ? "var(--soft)" : "var(--card)",
                        border: `1.5px solid ${isActive ? "var(--blue)" : "var(--border)"}`,
                        boxShadow: isActive ? "0 0 0 3px rgba(26,127,212,0.1)" : "var(--shadow)"
                      }}
                    >
                      <div style={{ width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0, background: isActive ? "var(--blue)" : "var(--soft)", color: isActive ? "#fff" : "var(--navy)", display: "grid", placeItems: "center" }}>
                        <CatIcon size={17} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: "13px", display: "block" }}>{cat.category}</strong>
                        <span style={{ fontSize: "10px", color: "var(--muted)" }}>{cat.items?.length || 0} items available</span>
                      </div>
                      <ChevronRight size={16} color={isActive ? "var(--blue)" : "var(--muted)"} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Category Items or Forms */}
          <div style={{ position: "sticky", top: "18px" }}>
            {showCatForm ? (
              <div className="panel" style={{ padding: "20px", border: "1.5px solid var(--blue)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Plus size={16} color="var(--blue)" /> Add New Category
                  </h3>
                  <button onClick={() => setShowCatForm(false)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)" }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <label className="field">
                    <span>Category Name <span style={{ color: "var(--danger)" }}>*</span></span>
                    <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. 3D Printers" />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <textarea rows={3} value={catDesc} onChange={e => setCatDesc(e.target.value)} placeholder="What kind of equipment goes here?" />
                  </label>
                </div>
                <button className="primary-button compact" style={{ width: "100%", justifyContent: "center" }} onClick={saveCategory} disabled={!catName.trim()}>
                  <CheckCircle2 size={14} /> Save Category
                </button>
              </div>
            ) : showItemForm ? (
              <div className="panel" style={{ padding: "20px", border: "1.5px solid var(--blue)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Plus size={16} color="var(--blue)" /> Add Equipment Item
                  </h3>
                  <button onClick={() => setShowItemForm(false)} style={{ border: 0, background: "none", cursor: "pointer", color: "var(--muted)" }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <label className="field">
                    <span>Item Name <span style={{ color: "var(--danger)" }}>*</span></span>
                    <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Prusa i3 MK3S+" />
                  </label>
                  <label className="field">
                    <span>Specifications</span>
                    <input value={itemSpecs} onChange={e => setItemSpecs(e.target.value)} placeholder="e.g. 210x210x250mm, PLA/PETG" />
                  </label>
                  <label className="field">
                    <span>Use Case</span>
                    <textarea rows={3} value={itemUseCase} onChange={e => setItemUseCase(e.target.value)} placeholder="e.g. Rapid prototyping for rover chassis" />
                  </label>
                </div>
                <button className="primary-button compact" style={{ width: "100%", justifyContent: "center" }} onClick={saveItem} disabled={!itemName.trim()}>
                  <CheckCircle2 size={14} /> Save Item
                </button>
              </div>
            ) : equipment.length > 0 && selectedCatIdx < equipment.length ? (
              <div className="panel" style={{ padding: "20px", border: "1.5px solid var(--border)" }}>
                {(() => {
                  const cat = equipment[selectedCatIdx];
                  const CatIcon = CAT_ICONS[cat.category] || Cpu;
                  return (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border)", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #0c2340, #1a7fd4)", color: "#00c8ff", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <CatIcon size={20} />
                          </div>
                          <div>
                            <h2 style={{ fontSize: "15px", marginBottom: "4px" }}>{cat.category}</h2>
                            <p style={{ fontSize: "11px", color: "var(--muted)" }}>{cat.description}</p>
                          </div>
                        </div>
                        {isAdmin && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => setShowItemForm(true)} className="primary-button compact" style={{ padding: "6px 10px", fontSize: "11px" }}>
                              <Plus size={12} /> Add Item
                            </button>
                            <button onClick={() => deleteCategory(selectedCatIdx)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {(!cat.items || cat.items.length === 0) ? (
                        <div style={{ textAlign: "center", padding: "40px 10px" }}>
                          <Activity size={32} style={{ color: "var(--muted)", margin: "0 auto 12px", opacity: 0.5 }} />
                          <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: "1.5" }}>No equipment added to this category yet.</p>
                        </div>
                      ) : (
                        <div className="project-recycler" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                          {cat.items.map((item, i) => (
                            <div key={i} style={{ padding: "14px", borderRadius: "12px", background: "var(--soft)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
                                <strong style={{ fontSize: "12px", lineHeight: "1.4" }}>{item.name}</strong>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0, marginTop: "2px" }} title="Available" />
                                  {isAdmin && (
                                    <button onClick={() => deleteItem(selectedCatIdx, i)} style={{ border: 0, background: "none", color: "var(--danger)", cursor: "pointer", padding: "2px", opacity: 0.7 }} title="Delete item">
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: "10px", color: "var(--blue)", fontFamily: "DM Mono", lineHeight: "1.4", display: "block" }}>
                                {item.specs}
                              </span>
                              <div style={{ marginTop: "4px", padding: "8px 10px", borderRadius: "8px", background: "var(--card)", border: "1px solid var(--border)" }}>
                                <span style={{ fontSize: "9px", color: "var(--muted)", display: "block", marginBottom: "3px", letterSpacing: "0.3px", textTransform: "uppercase", fontWeight: "700" }}>
                                  Use Case
                                </span>
                                <span style={{ fontSize: "10px", color: "var(--text)", lineHeight: "1.4" }}>{item.useCase}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
