import {
  Code2,
  FolderKanban,
  UserRound,
  Settings,
  LogOut,
  X,
  Bot,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";

export default function Sidebar({ page, setPage, onLogout, mobileOpen, onClose, user }) {
  const isAdmin = user?.role === "Admin";

  const items = [
    ["Overview", LayoutDashboard],
    ...(isAdmin ? [["Admin Console", ShieldCheck]] : []),
    ["Codes", Code2],
    ["Project", FolderKanban],
    ["Robotics Team", Bot],
    ["Profile", UserRound],
    ["Settings", Settings]
  ];

  const displayName = user?.displayName || "Developer";
  const initials = displayName
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "D";

  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-top">
        <div
          className="brand"
          style={{ cursor: "pointer" }}
          onClick={() => setPage("Overview")}
          title="Go to Overview"
        >
          <div className="brand-logo"><Code2 size={18} /></div>
          <div>
            <strong>MOCOSN</strong>
            <span>{isAdmin ? "ADMIN CONSOLE" : "ELECTRO-BOTICS"}</span>
          </div>
        </div>
        <button className="close-sidebar" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-label">WORKSPACE</div>

      <nav>
        {items.map(([name, Icon]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => setPage(name)}
            style={
              name === "Admin Console"
                ? {
                    color: page === name ? "#fff" : "#b91c1c",
                    background: page === name ? "#b91c1c" : "rgba(239, 68, 68, 0.08)",
                    fontWeight: "600",
                    marginBottom: "6px"
                  }
                : {}
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-user">
        <div
          className="avatar small"
          style={isAdmin ? { background: "#fee2e2", color: "#b91c1c" } : {}}
        >
          {initials}
        </div>
        <div className="user-mini">
          <strong>{displayName}</strong>
          <span style={isAdmin ? { color: "#b91c1c", fontWeight: "600" } : {}}>
            {isAdmin ? "Administrator" : user?.role || "Developer"}
          </span>
        </div>
        <button className="logout-icon" onClick={onLogout} title="Sign Out" aria-label="Sign Out">
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}