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
  ToggleRight,
  Mail,
  Send,
  Inbox,
  Check,
  Server
} from "lucide-react";
import ProxyStatusModal from "../components/ProxyStatusModal";
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
import {
  getContactMessages,
  fetchContactMessagesFromFirestore,
  toggleContactStatus,
  deleteContactMessage
} from "../utils/contactMessages";

export default function AdminDashboard({ user }) {
  const isAdmin = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState("users"); // "users" | "logs" | "contacts"
  const [users, setUsers] = useState(getRegisteredUsers);
  const [logs, setLogs] = useState(getActivityLogs);
  const [contacts, setContacts] = useState(getContactMessages);
  const [showProxyModal, setShowProxyModal] = useState(false);

  // Sync users and contacts live from Firestore on mount
  useEffect(() => {
    fetchUsersFromFirestore().then((fresh) => {
      if (fresh && fresh.length > 0) setUsers(fresh);
    });
    fetchContactMessagesFromFirestore().then((fresh) => {
      if (fresh && fresh.length > 0) setContacts(fresh);
    });
  }, []);

  // Contact filters
  const [contactSearch, setContactSearch] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState("All");

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

  // Handle contact status toggle
  const handleToggleContactStatus = async (id) => {
    try {
      const updated = await toggleContactStatus(id);
      setContacts(updated);
      showFeedback("Contact status updated.");
    } catch (err) {
      showFeedback(err.message || "Failed to update contact status.", "error");
    }
  };

  // Delete contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact inquiry?")) return;
    try {
      const updated = await deleteContactMessage(id);
      setContacts(updated);
      showFeedback("Contact message removed.");
    } catch (err) {
      showFeedback(err.message || "Failed to delete contact.", "error");
    }
  };

  // Export contacts
  const handleExportContacts = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `landing_contacts_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesStatus = contactStatusFilter === "All" || c.status === contactStatusFilter;
      const q = contactSearch.toLowerCase();
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.message?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [contacts, contactSearch, contactStatusFilter]);

  const newContactsCount = contacts.filter((c) => c.status === "New").length;

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
          <p>Manage registered users, assign roles, view landing inquiries, and audit system logs.</p>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tab-switcher">
          <button
            onClick={() => setActiveTab("users")}
            className={`primary-button compact ${activeTab === "users" ? "" : "outline-button"}`}
            style={activeTab === "users" ? {} : { background: "#fff", color: "var(--navy)" }}
          >
            <Users size={16} /> Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`primary-button compact ${activeTab === "contacts" ? "" : "outline-button"}`}
            style={activeTab === "contacts" ? {} : { background: "#fff", color: "var(--navy)" }}
          >
            <Mail size={16} /> Landing Inquiries ({contacts.length})
            {newContactsCount > 0 && (
              <span style={{
                background: "#ff825c",
                color: "#fff",
                fontSize: "10px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "10px",
                marginLeft: "4px"
              }}>
                {newContactsCount} new
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`primary-button compact ${activeTab === "logs" ? "" : "outline-button"}`}
            style={activeTab === "logs" ? {} : { background: "#fff", color: "var(--navy)" }}
          >
            <Activity size={16} /> Activity Logs ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setShowProxyModal(true)}
            className="outline-button compact"
            style={{ background: "#fff", color: "var(--navy)", borderColor: "var(--border)" }}
            title="Inspect Wasmer proxy server and cloud storage status"
          >
            <Server size={15} color="var(--blue)" /> Proxy & Cloud
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="admin-stat-grid">
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
          <div className="stat-icon" style={{ background: "#ffedd5", color: "#ea580c" }}>
            <Mail size={19} />
          </div>
          <div>
            <span>LANDING INQUIRIES</span>
            <strong style={{ color: newContactsCount > 0 ? "#ea580c" : "inherit" }}>
              {contacts.length} {newContactsCount > 0 && `(${newContactsCount} new)`}
            </strong>
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

          {/* User Table (Desktop Layout) */}
          <div className="admin-table-wrap admin-table-desktop">
            <table className="admin-table" style={{ width: "100%", minWidth: "780px", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
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

          {/* User Cards (Mobile & Tablet Layout) */}
          <div className="admin-user-mobile-cards">
            {filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)" }}>
                No users found matching your search.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const currentDraftRole = roleDrafts[u.id] || u.role || "Developer";
                const hasDraftChange = currentDraftRole !== u.role;
                const initials = (u.name || "User")
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={u.id}
                    className={`admin-user-card ${!u.role ? "unassigned" : hasDraftChange ? "has-draft" : ""}`}
                  >
                    {/* Header: Avatar, Name, Email, Role */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            style={{ width: "38px", height: "38px", borderRadius: "10px", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="avatar small" style={{ width: "38px", height: "38px", borderRadius: "10px" }}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <strong style={{ fontSize: "13px", color: "var(--text)", display: "block" }}>{u.name}</strong>
                          <span style={{ fontSize: "11px", color: "var(--muted)", wordBreak: "break-all" }}>{u.email}</span>
                        </div>
                      </div>

                      {/* Current Role Pill */}
                      {u.role ? (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "14px",
                            fontSize: "10px",
                            fontWeight: "700",
                            background: u.role === "Admin" ? "#fee2e2" : u.role === "Robotics Lead" ? "#ede9fe" : u.role === "Hardware Engineer" ? "#e0f2fe" : "#dcfce7",
                            color: u.role === "Admin" ? "#b91c1c" : u.role === "Robotics Lead" ? "#6d28d9" : u.role === "Hardware Engineer" ? "#0369a1" : "#15803d",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {u.role}
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "14px",
                            fontSize: "9px",
                            fontWeight: "700",
                            background: "#fef3c7",
                            color: "#b45309",
                            whiteSpace: "nowrap"
                          }}
                        >
                          ⚠️ Blocked
                        </span>
                      )}
                    </div>

                    {/* Meta: Status & Requested Role */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", background: "var(--soft)", padding: "8px 10px", borderRadius: "8px" }}>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Status: </span>
                        <strong style={{ color: !u.role ? "#b45309" : u.status === "Active" ? "#16a34a" : "#dc2626" }}>
                          ● {!u.role ? "Pending Approval" : u.status || "Active"}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--muted)" }}>Requested: </span>
                        <strong>{u.requestedRole || "Developer"}</strong>
                      </div>
                    </div>

                    {/* Role Assignment Dropdown + Commit Button */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <select
                        value={currentDraftRole}
                        onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        style={{
                          flex: 1,
                          height: "36px",
                          padding: "0 10px",
                          borderRadius: "8px",
                          border: hasDraftChange ? "1px solid #16a34a" : "1px solid var(--border)",
                          background: "var(--card)",
                          fontSize: "12px",
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
                          style={{ height: "36px", padding: "0 14px", fontSize: "11px", background: "#16a34a" }}
                          onClick={() => handleAssignRole(u)}
                        >
                          Assign
                        </button>
                      )}
                    </div>

                    {/* Actions: Toggle Status & Delete */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", paddingTop: "4px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className="outline-button compact"
                        style={{ height: "34px", fontSize: "11px", justifyContent: "center" }}
                      >
                        {u.status === "Active" ? <ToggleRight size={14} color="#16a34a" /> : <ToggleLeft size={14} color="#dc2626" />}
                        {u.status === "Active" ? "Suspend Account" : "Activate Account"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        style={{
                          height: "34px",
                          padding: "0 12px",
                          border: "1px solid #fee2e2",
                          background: "#fef2f2",
                          borderRadius: "8px",
                          color: "#dc2626",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center"
                        }}
                        title="Remove user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3: LANDING PAGE INQUIRIES & CONTACT MESSAGES
          ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "contacts" && (
        <section className="panel" style={{ padding: "20px" }}>
          {/* Controls Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "20px"
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flex: "1 1 320px", maxWidth: "600px", flexWrap: "wrap" }}>
              <div className="search-box" style={{ flex: "1 1 200px", height: "40px" }}>
                <Search size={16} />
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search inquiries by submitter name, email, or message..."
                />
              </div>

              {/* Status Filter */}
              <select
                value={contactStatusFilter}
                onChange={(e) => setContactStatusFilter(e.target.value)}
                style={{
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  color: "var(--text)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <option value="All">All Inquiries ({contacts.length})</option>
                <option value="New">New ({newContactsCount})</option>
                <option value="Resolved">Resolved ({contacts.length - newContactsCount})</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {contacts.length > 0 && (
                <button
                  type="button"
                  className="outline-button"
                  onClick={handleExportContacts}
                  style={{ height: "40px", fontSize: "12px" }}
                  title="Export contact messages as JSON"
                >
                  <Download size={14} /> Export Inquiries
                </button>
              )}
            </div>
          </div>

          {/* List of Contact Inquiries */}
          {filteredContacts.length === 0 ? (
            <div style={{ padding: "50px 20px", textAlign: "center", color: "var(--muted)" }}>
              <Inbox size={42} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
              <strong style={{ display: "block", fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                No Contact Inquiries Found
              </strong>
              <p style={{ fontSize: "12px", margin: 0 }}>
                {contactSearch || contactStatusFilter !== "All"
                  ? "Try adjusting your search query or status filter."
                  : "Messages submitted via the Landing Page contact form will appear here in real time."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredContacts.map((c) => {
                const isNew = c.status === "New";
                const dateStr = new Date(c.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div
                    key={c.id}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "12px",
                      background: "var(--card)",
                      border: `1.5px solid ${isNew ? "var(--blue)" : "var(--border)"}`,
                      boxShadow: isNew ? "0 4px 14px rgba(26,127,212,0.08)" : "var(--shadow)",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {/* Header Row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "12px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          className="avatar small"
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 700
                          }}
                        >
                          {(c.name || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: "14px", color: "var(--text)", display: "block" }}>
                            {c.name}
                          </strong>
                          <a
                            href={`mailto:${c.email}`}
                            style={{
                              fontSize: "12px",
                              color: "var(--blue)",
                              textDecoration: "none",
                              fontFamily: "DM Mono",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Mail size={12} /> {c.email}
                          </a>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: "20px",
                            background: isNew ? "rgba(255, 130, 92, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: isNew ? "#ff825c" : "#10b981",
                            border: `1px solid ${isNew ? "rgba(255, 130, 92, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            letterSpacing: "0.5px"
                          }}
                        >
                          {isNew ? "● NEW INQUIRY" : "✓ RESOLVED"}
                        </span>

                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        background: "var(--soft)",
                        border: "1px solid var(--border)",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        color: "var(--text)",
                        whiteSpace: "pre-wrap",
                        marginBottom: "14px"
                      }}
                    >
                      {c.message}
                    </div>

                    {/* Action Bar */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                        borderTop: "1px solid var(--border)",
                        paddingTop: "12px"
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px" }}>
                        <a
                          href={`mailto:${c.email}?subject=RE: Development Club Inquiry&body=Hi ${encodeURIComponent(c.name)},%0D%0A%0D%0AThank you for reaching out to the Development Club regarding your inquiry.%0D%0A%0D%0A`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
                            borderRadius: "7px",
                            background: "var(--blue)",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          <Send size={12} /> Reply via Email
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggleContactStatus(c.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            borderRadius: "7px",
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {isNew ? <Check size={13} color="#10b981" /> : <Clock size={13} />}
                          {isNew ? "Mark as Resolved" : "Mark as New"}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteContact(c.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 10px",
                          borderRadius: "7px",
                          background: "none",
                          border: 0,
                          color: "#ef4444",
                          fontSize: "11px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                        title="Delete Inquiry"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Proxy & Cloud Infrastructure Diagnostics Modal ── */}
      <ProxyStatusModal
        isOpen={showProxyModal}
        onClose={() => setShowProxyModal(false)}
      />
    </>
  );
}
