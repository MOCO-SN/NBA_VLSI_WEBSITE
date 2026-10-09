import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Users,
  Activity,
  Search,
  UserCog,
  CheckCircle2,
  Trash2,
  Download,
  ShieldAlert,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import {
  getRegisteredUsers,
  fetchUsersFromFirestore,
  assignUserRole,
  toggleUserStatus,
  removeUserFromDirectory,
  AVAILABLE_ROLES
} from "../utils/userDirectory";
import {
  getActivityLogs,
  clearActivityLogs
} from "../utils/activityLogger";

export default function AdminDashboard({ user }) {
  const isAdmin = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState("users"); // "users" | "logs"
  const [users, setUsers] = useState(getRegisteredUsers);
  const [logs, setLogs] = useState(getActivityLogs);

  // Sync users live from Firestore /admins and /users on mount
  useEffect(() => {
    fetchUsersFromFirestore().then((fresh) => {
      if (fresh && fresh.length > 0) setUsers(fresh);
    });
  }, []);

  // User filters
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Selected role draft for each user: { [userId]: newRole }
  const [roleDrafts, setRoleDrafts] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  // Log filters
  const [logSearch, setLogSearch] = useState("");
  const [logCategory, setLogCategory] = useState("ALL");

  const showFeedback = (msg, type = "success") => {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Handle role assignment
  const handleAssignRole = async (targetUser) => {
    const newRole = roleDrafts[targetUser.id] || targetUser.role;
    if (newRole === targetUser.role) {
      showFeedback(`User ${targetUser.name} already holds the '${newRole}' role.`, "info");
      return;
    }

    try {
      const updated = await assignUserRole({
        userId: targetUser.id,
        newRole,
        adminUser: user
      });
      setUsers(updated);
      setLogs(getActivityLogs());
      showFeedback(`Successfully assigned '${newRole}' role to ${targetUser.name}!`);
    } catch (err) {
      showFeedback(err.message || "Failed to assign role.", "error");
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId) => {
    try {
      const updated = await toggleUserStatus({ userId, adminUser: user });
      setUsers(updated);
      setLogs(getActivityLogs());
      showFeedback("User status updated successfully.");
    } catch (err) {
      showFeedback(err.message || "Action failed.", "error");
    }
  };

  // Remove user
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user.uid || targetUser.email === user.email) {
      alert("You cannot delete your own Administrator account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${targetUser.name} from the workspace?`)) {
      return;
    }
    try {
      const updated = await removeUserFromDirectory({ userId: targetUser.id, adminUser: user });
      setUsers(updated);
      setLogs(getActivityLogs());
      showFeedback(`User ${targetUser.name} removed from workspace.`);
    } catch (err) {
      showFeedback(err.message || "Failed to remove user.", "error");
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
      clearActivityLogs();
      setLogs([]);
      showFeedback("Activity logs cleared.");
    }
  };

  // Export logs to JSON
  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `activity_logs_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.role && u.role.toLowerCase().includes(userSearch.toLowerCase()));

      let matchesRole = true;
      if (roleFilter === "UNASSIGNED") {
        matchesRole = !u.role;
      } else if (roleFilter !== "All") {
        matchesRole = u.role === roleFilter;
      }

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesCategory = logCategory === "ALL" || log.category === logCategory;
      const q = logSearch.toLowerCase();
      const matchesSearch =
        !q ||
        log.event?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.actor?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [logs, logSearch, logCategory]);

  // Counts
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const leadCount = users.filter((u) => u.role === "Robotics Lead" || u.role === "Hardware Engineer").length;
  const devCount = users.filter((u) => u.role === "Developer").length;
  const unassignedCount = users.filter((u) => !u.role).length;

  if (!isAdmin) {
    return (
      <div className="panel" style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#fee2e2", color: "#dc2626", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <ShieldAlert size={28} />
        </div>
        <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Administrator Access Required</h2>
        <p style={{ color: "var(--muted)", fontSize: "13px", lineHeight: "1.6" }}>
          Only authorized workspace administrators can access the User Directory, assign roles, and review system audit logs. Your current role is <strong>{user?.role || "Member"}</strong>.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRATIVE GOVERNANCE</div>
          <h1>Admin Console</h1>
          <p>Manage registered users, assign roles, and audit workspace security & activity logs.</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveTab("users")}
            className={`primary-button compact ${activeTab === "users" ? "" : "outline-button"}`}
            style={activeTab === "users" ? {} : { background: "#fff", color: "var(--navy)" }}
          >
            <Users size={16} /> Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`primary-button compact ${activeTab === "logs" ? "" : "outline-button"}`}
            style={activeTab === "logs" ? {} : { background: "#fff", color: "var(--navy)" }}
          >
            <Activity size={16} /> Activity Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stat-grid" style={{ marginBottom: "22px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
            <Users size={19} />
          </div>
          <div>
            <span>REGISTERED USERS</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <ShieldCheck size={19} />
          </div>
          <div>
            <span>ADMINISTRATORS</span>
            <strong>{adminCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ede9fe", color: "#7c3aed" }}>
            <UserCog size={19} />
          </div>
          <div>
            <span>SPECIALIZED LEADS</span>
            <strong>{leadCount}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{
              background: unassignedCount > 0 ? "#fef3c7" : "#dcfce7",
              color: unassignedCount > 0 ? "#b45309" : "#16a34a"
            }}
          >
            <Sparkles size={19} />
          </div>
          <div>
            <span>{unassignedCount > 0 ? "AWAITING ROLE" : "DEVELOPERS"}</span>
            <strong style={unassignedCount > 0 ? { color: "#b45309" } : {}}>
              {unassignedCount > 0 ? unassignedCount : devCount}
            </strong>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "10px",
            background: feedbackType === "error" ? "#fef2f2" : "#edf9f3",
            color: feedbackType === "error" ? "#dc2626" : "#166534",
            border: `1px solid ${feedbackType === "error" ? "#fecaca" : "#bbf7d0"}`,
            fontSize: "12px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS & ROLE ASSIGNMENT */}
      {activeTab === "users" && (
        <section className="panel" style={{ padding: "20px" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
            <div className="search-box" style={{ width: "min(340px, 100%)" }}>
              <Search size={16} />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, or role..."
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "600" }}>Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  fontSize: "12px",
                  color: "var(--text)"
                }}
              >
                <option value="All">All Roles ({users.length})</option>
                {unassignedCount > 0 && (
                  <option value="UNASSIGNED">⚠️ Awaiting Role Approval ({unassignedCount})</option>
                )}
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "10px", letterSpacing: "0.5px" }}>
                  <th style={{ padding: "12px 10px" }}>USER</th>
                  <th style={{ padding: "12px 10px" }}>REQUESTED ROLE</th>
                  <th style={{ padding: "12px 10px" }}>CURRENT ROLE</th>
                  <th style={{ padding: "12px 10px" }}>STATUS</th>
                  <th style={{ padding: "12px 10px" }}>ASSIGN ROLE (ADMIN ONLY)</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const currentDraftRole = roleDrafts[u.id] || u.role || "Developer";
                  const hasDraftChange = currentDraftRole !== u.role;
                  const initials = (u.name || "User")
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: !u.role
                          ? "rgba(254, 243, 199, 0.25)"
                          : hasDraftChange
                          ? "rgba(97, 214, 161, 0.05)"
                          : "transparent"
                      }}
                    >
                      {/* User Info */}
                      <td style={{ padding: "14px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              style={{ width: "34px", height: "34px", borderRadius: "9px", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="avatar small" style={{ width: "34px", height: "34px" }}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <strong style={{ display: "block", color: "var(--text)" }}>{u.name}</strong>
                            <span style={{ fontSize: "11px", color: "var(--muted)" }}>{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Requested Role */}
                      <td style={{ padding: "14px 10px", color: "var(--muted)" }}>
                        <span style={{ fontSize: "11px", background: "var(--soft)", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)" }}>
                          {u.requestedRole || "Developer"}
                        </span>
                      </td>

                      {/* Current Role Badge */}
                      <td style={{ padding: "14px 10px" }}>
                        {u.role ? (
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background:
                                u.role === "Admin"
                                  ? "#fee2e2"
                                  : u.role === "Robotics Lead"
                                  ? "#ede9fe"
                                  : u.role === "Hardware Engineer"
                                  ? "#e0f2fe"
                                  : "#dcfce7",
                              color:
                                u.role === "Admin"
                                  ? "#b91c1c"
                                  : u.role === "Robotics Lead"
                                  ? "#6d28d9"
                                  : u.role === "Hardware Engineer"
                                  ? "#0369a1"
                                  : "#15803d"
                            }}
                          >
                            {u.role}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "10px",
                              fontWeight: "700",
                              background: "#fef3c7",
                              color: "#b45309",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            ⚠️ No Role (Blocked)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 10px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: !u.role ? "#b45309" : u.status === "Active" ? "#16a34a" : "#dc2626"
                          }}
                        >
                          ● {!u.role ? "Pending Approval" : u.status || "Active"}
                        </span>
                      </td>

                      {/* Role Assignment Selector & Confirm */}
                      <td style={{ padding: "14px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <select
                            value={currentDraftRole}
                            onChange={(e) =>
                              setRoleDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))
                            }
                            style={{
                              height: "32px",
                              padding: "0 8px",
                              borderRadius: "7px",
                              border: hasDraftChange ? "1px solid #16a34a" : "1px solid var(--border)",
                              background: "#fff",
                              fontSize: "11px",
                              color: "var(--text)"
                            }}
                          >
                            {AVAILABLE_ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>

                          {hasDraftChange && (
                            <button
                              className="primary-button compact"
                              style={{ height: "32px", padding: "0 10px", fontSize: "11px", background: "#16a34a" }}
                              onClick={() => handleAssignRole(u)}
                              title="Commit role assignment"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 10px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            style={{
                              border: "1px solid var(--border)",
                              background: "#fff",
                              borderRadius: "6px",
                              padding: "5px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              color: "var(--muted)"
                            }}
                            title="Toggle user active status"
                          >
                            {u.status === "Active" ? <ToggleRight size={14} color="#16a34a" /> : <ToggleLeft size={14} color="#dc2626" />}
                            {u.status === "Active" ? "Suspend" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            style={{
                              border: "1px solid #fee2e2",
                              background: "#fef2f2",
                              borderRadius: "6px",
                              padding: "5px 8px",
                              cursor: "pointer",
                              color: "#dc2626"
                            }}
                            title="Remove user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: AUDIT & ACTIVITY LOGS */}
      {activeTab === "logs" && (
        <section className="panel" style={{ padding: "20px" }}>
          {/* Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
            <div className="search-box" style={{ width: "min(340px, 100%)" }}>
              <Search size={16} />
              <input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit logs..."
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={logCategory}
                onChange={(e) => setLogCategory(e.target.value)}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "#fff",
                  fontSize: "12px"
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">Authentication (AUTH)</option>
                <option value="ROLE">Role Governance (ROLE)</option>
                <option value="WORKSPACE">Workspace (WORKSPACE)</option>
                <option value="TELEMETRY">Telemetry (TELEMETRY)</option>
                <option value="SYSTEM">System (SYSTEM)</option>
              </select>

              <button
                type="button"
                className="outline-button"
                style={{ height: "36px", fontSize: "11px" }}
                onClick={handleExportLogs}
              >
                <Download size={14} /> Export JSON
              </button>

              <button
                type="button"
                style={{
                  height: "36px",
                  padding: "0 12px",
                  border: "1px solid #fee2e2",
                  background: "#fef2f2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={handleClearLogs}
              >
                <Trash2 size={14} /> Clear Logs
              </button>
            </div>
          </div>

          {/* Log List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredLogs.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                <Clock size={32} style={{ marginBottom: "8px" }} />
                <p>No activity logs found matching your filter criteria.</p>
              </div>
            )}

            {filteredLogs.map((log) => {
              const categoryColor =
                log.category === "AUTH"
                  ? { bg: "#e0f2fe", text: "#0369a1" }
                  : log.category === "ROLE"
                  ? { bg: "#f3e8ff", text: "#7e22ce" }
                  : log.category === "WORKSPACE"
                  ? { bg: "#dcfce7", text: "#15803d" }
                  : log.category === "TELEMETRY"
                  ? { bg: "#ffedd5", text: "#c2410c" }
                  : { bg: "#f1f5f9", text: "#475569" };

              const formattedTime = new Date(log.timestamp).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              });

              return (
                <div
                  key={log.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1, minWidth: "260px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "9px",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        background: categoryColor.bg,
                        color: categoryColor.text,
                        marginTop: "2px"
                      }}
                    >
                      {log.category}
                    </span>
                    <div>
                      <strong style={{ fontSize: "13px", display: "block", color: "var(--text)" }}>
                        {log.event}
                      </strong>
                      <p style={{ fontSize: "12px", color: "var(--muted)", margin: "3px 0 0" }}>
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "11px", color: "var(--muted)" }}>
                    <div>
                      Actor: <strong style={{ color: "var(--text)" }}>{log.actor}</strong> ({log.role || "User"})
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
