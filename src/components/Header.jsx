import { Menu, CircleUserRound, LogOut, Globe } from "lucide-react";

export default function Header({ page, user, onMenu, onLogout, onViewLanding }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenu} aria-label="Toggle navigation menu">
          <Menu size={21} />
        </button>
        <div className="page-pill">{page}</div>
        <span className="online-dot" />
      </div>

      <div className="topbar-right">
        {onViewLanding && (
          <button className="outline-button" onClick={onViewLanding} aria-label="Public Portal" title="View Public Lab Portal">
            <Globe size={14} />
            Public Portal
          </button>
        )}
        <div className="top-user">
          <CircleUserRound size={17} />
          <span>{user?.displayName || "User"}</span>
          {user?.role && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "10px",
                background: user.role === "Admin" ? "#fee2e2" : "#f1f5f9",
                color: user.role === "Admin" ? "#b91c1c" : "var(--muted)"
              }}
            >
              {user.role}
            </span>
          )}
        </div>
        <button className="outline-button" onClick={onLogout} aria-label="Logout">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}