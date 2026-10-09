import { useMemo } from "react";
import {
  Files,
  FolderKanban,
  HardDrive,
  Activity,
  Upload,
  ArrowRight,
  FileCode2
} from "lucide-react";

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Overview({ user, files, stats, setPage }) {
  const recent = files.slice(0, 5);
  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "Developer";

  // Load user's real project (if any)
  const projectData = useMemo(() => {
    try {
      const raw = localStorage.getItem(`mocosn_project_${user?.uid || "guest"}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name && parsed.name !== "Electro-Botics Autonomous System") {
          return parsed;
        }
      }
    } catch {}
    return null;
  }, [user]);

  const projectTags = useMemo(() => {
    if (!projectData?.technologies) return [];
    return projectData.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [projectData]);

  // Dynamic storage meter (50MB quota)
  const totalBytes = stats?.totalBytes || 0;
  const quotaBytes = 50 * 1024 * 1024;
  const storagePercent = totalBytes > 0
    ? Math.min(100, (totalBytes / quotaBytes) * 100).toFixed(1)
    : "0.0";

  // Activity bars for 7 days
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityHeights = useMemo(() => {
    if (!files.length) return [0, 0, 0, 0, 0, 0, 0];
    const base = Math.min(100, Math.max(20, files.length * 15));
    return [
      Math.round(base * 0.35),
      Math.round(base * 0.65),
      Math.round(base * 0.5),
      Math.round(base * 0.85),
      Math.round(base * 0.6),
      Math.round(base * 0.75),
      base
    ];
  }, [files.length]);

  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">Overview</div>
          <h1>Welcome back, {firstName} <span>👋</span></h1>
          <p>Manage your uploaded code and project from one workspace.</p>
        </div>
        <button className="primary-button compact" onClick={() => setPage("Codes")}>
          <Upload size={16} /> Upload Code
        </button>
      </div>

      <div className="stat-grid">
        <Stat icon={Files} label="UPLOADED CODES" value={stats.files} />
        <Stat icon={FolderKanban} label="PROJECTS" value={projectData ? 1 : 0} />
        <Stat icon={HardDrive} label="STORAGE USED" value={stats.storage} />
        <Stat icon={Activity} label="ACTIVITY" value={stats.activity} />
      </div>

      <div className="two-column">
        <section className="panel">
          <PanelTitle title="Recently Uploaded" action="View all" onClick={() => setPage("Codes")} />
          <div className="file-list">
            {recent.length === 0 ? (
              <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--muted)" }}>
                <FileCode2 size={28} style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                <strong style={{ display: "block", fontSize: "12px", color: "var(--text)" }}>No files uploaded yet</strong>
                <span style={{ fontSize: "11px" }}>Upload source code files to see them listed here.</span>
              </div>
            ) : (
              recent.map((file) => (
                <div className="file-row" key={file.id}>
                  <div className="file-icon"><FileCode2 size={18} /></div>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{file.language || "Source"} · {formatSize(file.size)}</span>
                  </div>
                  <span className="muted">{file.updatedAt || "Recently"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel project-preview">
          <PanelTitle title="Project" action={projectData ? "Edit" : "Create"} onClick={() => setPage("Project")} />
          {projectData ? (
            <>
              <div className="project-box">
                <div className="project-logo">
                  {(projectData.name || "P")[0].toUpperCase()}
                </div>
                <div>
                  <h3>{projectData.name}</h3>
                  <p>{projectData.status || "Active"}</p>
                  {projectTags.length > 0 && (
                    <div className="tags">
                      {projectTags.map((tag, i) => (
                        <span key={i}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="project-description">
                {projectData.description || "Project specifications configured."}
              </div>
            </>
          ) : (
            <div style={{ padding: "30px 16px", textAlign: "center" }}>
              <FolderKanban size={32} style={{ color: "var(--muted)", margin: "0 auto 8px", opacity: 0.6 }} />
              <strong style={{ display: "block", fontSize: "13px", color: "var(--text)" }}>No project configured yet</strong>
              <p style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 14px", lineHeight: "1.5" }}>
                Add your project specs, firmware stack, and repository links.
              </p>
              <button
                type="button"
                className="outline-button"
                style={{ height: "32px", fontSize: "11px", margin: "0 auto" }}
                onClick={() => setPage("Project")}
              >
                Configure Project
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="two-column lower">
        <section className="panel">
          <PanelTitle title="Code Activity" action="Codes" onClick={() => setPage("Codes")} />
          <div className="activity-chart">
            {activityHeights.map((h, i) => (
              <div className="bar-wrap" key={i}>
                <div
                  className="bar"
                  style={{
                    height: h > 0 ? `${h}%` : "4px",
                    opacity: h > 0 ? 1 : 0.25
                  }}
                />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {weekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelTitle title="Workspace" />
          <div className="workspace-meter">
            <div className="meter-header"><span>Storage</span><strong>{stats.storage} / 50 MB</strong></div>
            <div className="meter">
              <span style={{ width: `${Math.max(Number(storagePercent), totalBytes > 0 ? 3 : 0)}%` }} />
            </div>
            <small>{storagePercent}% of your 50 MB workspace quota used</small>
          </div>
          <div className="quick-links">
            <button onClick={() => setPage("Robotics Team")}>Robotics & IoT Squad <ArrowRight size={15} /></button>
            <button onClick={() => setPage("Profile")}>Update profile <ArrowRight size={15} /></button>
            <button onClick={() => setPage("Settings")}>Workspace settings <ArrowRight size={15} /></button>
          </div>
        </section>
      </div>

      <section className="panel activity-panel">
        <PanelTitle title="Recent Activity" />
        {recent.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
            No recent activity recorded yet. Upload a code file to generate activity.
          </div>
        ) : (
          recent.map((file) => (
            <div className="activity-row" key={file.id}>
              <div className="activity-dot" />
              <div><strong>{file.name}</strong> was uploaded or updated.</div>
              <span>{file.updatedAt || "Recently"}</span>
            </div>
          ))
        )}
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={19} /></div>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function PanelTitle({ title, action, onClick }) {
  return (
    <div className="panel-title">
      <div><h2>{title}</h2><span /></div>
      {action && <button onClick={onClick}>{action}</button>}
    </div>
  );
}