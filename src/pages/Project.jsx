import { useEffect, useState, useRef } from "react";
import {
  Globe,
  ExternalLink,
  Plus,
  Trash2,
  FolderKanban,
  GitBranch,
  Cpu,
  Clock,
  CheckCircle2,
  UploadCloud,
  X,
  Edit3,
  Link2,
  Camera,
  Loader2,
  Cloud
} from "lucide-react";
import { Github } from "../components/SocialIcons";
import { db, firebaseEnabled } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { uploadImageToCloud } from "../utils/cloudinary";

// ── Local storage helpers ─────────────────────────────────────────────────────
const PROJ_LIST_KEY = (uid) => `mocosn_projects_list_${uid || "guest"}`;

function loadProjects(uid) {
  try {
    return JSON.parse(localStorage.getItem(PROJ_LIST_KEY(uid)) || "[]");
  } catch {
    return [];
  }
}
function saveProjects(uid, list) {
  localStorage.setItem(PROJ_LIST_KEY(uid), JSON.stringify(list));
}

// ── Status badge styles ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  Active:      { bg: "#d0f0ff", color: "#0078a8" },
  Development: { bg: "#fef3c7", color: "#b45309" },
  Calibrating: { bg: "#ede9fe", color: "#7c3aed" },
  Archived:    { bg: "#f1f5f9", color: "#64748b" }
};

const emptyForm = {
  name: "",
  description: "",
  website: "",
  github: "",
  technologies: "",
  status: "Development",
  imageUrl: ""
};

// ── Colour generator for project avatars ─────────────────────────────────────
const AVATAR_COLORS = [
  ["#0c2340", "#00c8ff"],
  ["#1a3a58", "#38b2e8"],
  ["#0f2a45", "#1a7fd4"],
  ["#0a1e38", "#06b6d4"],
  ["#172554", "#818cf8"]
];
function avatarColors(name) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function Project({ user }) {
  const uid = user?.uid || "guest";

  // ── Projects list ─────────────────────────────────────────────────────────
  const [projects, setProjects] = useState(() => loadProjects(uid));
  const [selected, setSelected] = useState(null);       // id of selected project for detail view

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm]         = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);     // null = new project
  const [busy, setBusy]         = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [saveMsgType, setSaveMsgType] = useState("success");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── Load from Firestore on mount ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!firebaseEnabled || !db || !uid || uid === "guest") return;
      try {
        const q = query(collection(db, "projects_v2"), where("uid", "==", uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setProjects(remote);
          saveProjects(uid, remote);
        }
      } catch (e) {
        console.warn("Could not load remote projects:", e);
      }
    }
    load();
  }, [uid]);

  // ── Show flash message ────────────────────────────────────────────────────
  function flash(msg, type = "success") {
    setSaveMsg(msg);
    setSaveMsgType(type);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // ── Update form field ─────────────────────────────────────────────────────
  function updateForm(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // ── Save / update project ─────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name.trim()) {
      flash("Project name is required.", "error");
      return;
    }
    setBusy(true);
    try {
      const id = editingId || `proj_${Date.now()}`;
      const now = new Date().toISOString();
      const entry = {
        id,
        uid,
        ...form,
        updatedAt: now,
        createdAt: editingId
          ? (projects.find(p => p.id === id)?.createdAt || now)
          : now
      };

      const next = editingId
        ? projects.map(p => (p.id === editingId ? entry : p))
        : [entry, ...projects];

      setProjects(next);
      saveProjects(uid, next);

      // Firestore
      if (firebaseEnabled && db && uid !== "guest") {
        await setDoc(doc(db, "projects_v2", id), {
          ...entry,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      flash(editingId ? "Project updated!" : "Project added!");
      setForm(emptyForm);
      setEditingId(null);
      setSelected(entry.id);
    } catch (e) {
      console.warn("Save error:", e);
      flash("Saved locally (remote sync failed).", "success");
    } finally {
      setBusy(false);
    }
  }

  const [uploadingImage, setUploadingImage] = useState(false);
  const projectImgInputRef = useRef(null);

  async function handleProjectImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadImageToCloud(file, { folder: "nba_vlsi/projects" });
      updateForm("imageUrl", res.url);
      flash(`Project image uploaded to cloud (${res.provider === "cloudinary" ? "Cloudinary" : "Firebase"})!`);
    } catch (err) {
      alert(`Could not upload project image: ${err.message}`);
    } finally {
      setUploadingImage(false);
      if (projectImgInputRef.current) projectImgInputRef.current.value = "";
    }
  }

  // ── Edit a project ────────────────────────────────────────────────────────
  function startEdit(proj) {
    setEditingId(proj.id);
    setForm({
      name:         proj.name         || "",
      description:  proj.description  || "",
      website:      proj.website      || "",
      github:       proj.github       || "",
      technologies: proj.technologies || "",
      status:       proj.status       || "Development",
      imageUrl:     proj.imageUrl     || ""
    });
    setSelected(null);
  }

  // ── Delete a project ──────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    const next = projects.filter(p => p.id !== id);
    setProjects(next);
    saveProjects(uid, next);
    if (selected === id) setSelected(null);
    if (editingId === id) { setEditingId(null); setForm(emptyForm); }
    if (firebaseEnabled && db && uid !== "guest") {
      try { await deleteDoc(doc(db, "projects_v2", id)); } catch {}
    }
    flash("Project deleted.");
  }

  // ── Cancel editing ────────────────────────────────────────────────────────
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = projects.filter(p => {
    const matchQ = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies?.toLowerCase().includes(search.toLowerCase());
    const matchS = statusFilter === "All" || p.status === statusFilter;
    return matchQ && matchS;
  });

  const selectedProj = projects.find(p => p.id === selected);

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Projects</h1>
          <p>Manage your hardware & firmware projects — upload, track, and publish them.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => { setEditingId(null); setForm(emptyForm); setSelected(null); }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* ── Flash message ── */}
      {saveMsg && (
        <div style={{
          padding: "11px 16px", marginBottom: "16px", borderRadius: "10px",
          background: saveMsgType === "error" ? "#fef2f2" : "#e0f7ff",
          color: saveMsgType === "error" ? "#dc2626" : "#0078a8",
          border: `1px solid ${saveMsgType === "error" ? "#fecaca" : "#7dd3fc"}`,
          fontSize: "12px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <CheckCircle2 size={15} />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="projects-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "18px", alignItems: "start" }}>

        {/* ════ LEFT: Project Recycler List ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Search + Filter bar */}
          <div className="panel" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="search-box" style={{ flex: 1, height: "38px" }}>
                <FolderKanban size={15} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search projects..."
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  height: "38px", padding: "0 10px", borderRadius: "8px",
                  border: "1px solid var(--border)", background: "var(--card)",
                  fontSize: "12px", color: "var(--text)", minWidth: "120px"
                }}
              >
                <option value="All">All Status</option>
                <option>Active</option>
                <option>Development</option>
                <option>Calibrating</option>
                <option>Archived</option>
              </select>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "10px" }}>
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              {statusFilter !== "All" ? ` · ${statusFilter}` : ""}
            </div>
          </div>

          {/* Project Cards (Recycler View) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "70vh", overflowY: "auto", paddingRight: "2px" }}>
            {filtered.length === 0 ? (
              <div className="panel" style={{ padding: "40px 20px", textAlign: "center" }}>
                <FolderKanban size={36} style={{ color: "var(--muted)", marginBottom: "12px" }} />
                <strong style={{ display: "block", fontSize: "14px", marginBottom: "6px" }}>
                  {projects.length === 0 ? "No projects yet" : "No matches found"}
                </strong>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {projects.length === 0
                    ? "Use the form on the right to add your first project."
                    : "Try adjusting your search or filter."}
                </span>
              </div>
            ) : (
              filtered.map(proj => {
                const [bg1, bg2] = avatarColors(proj.name);
                const isActive = selected === proj.id;
                const statusStyle = STATUS_STYLES[proj.status] || STATUS_STYLES.Development;
                const tags = proj.technologies
                  ? proj.technologies.split(",").map(t => t.trim()).filter(Boolean).slice(0, 3)
                  : [];

                return (
                  <div
                    key={proj.id}
                    onClick={() => { setSelected(proj.id); setEditingId(null); }}
                    style={{
                      background: isActive ? "var(--soft)" : "var(--card)",
                      border: `1.5px solid ${isActive ? "var(--blue)" : "var(--border)"}`,
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isActive ? "0 0 0 3px rgba(26,127,212,0.1)" : "var(--shadow)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      {/* Avatar */}
                      {proj.imageUrl ? (
                        <img
                          src={proj.imageUrl}
                          alt={proj.name}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid var(--border)"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
                          background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                          color: "#fff", display: "grid", placeItems: "center",
                          fontSize: "18px", fontWeight: "800"
                        }}>
                          {(proj.name || "P")[0].toUpperCase()}
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <strong style={{ fontSize: "13px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {proj.name}
                          </strong>
                          <span style={{
                            padding: "2px 9px", borderRadius: "20px", fontSize: "10px",
                            fontWeight: "700", flexShrink: 0,
                            background: statusStyle.bg, color: statusStyle.color
                          }}>
                            {proj.status}
                          </span>
                        </div>

                        {proj.description && (
                          <p style={{
                            fontSize: "11px", color: "var(--muted)", margin: "4px 0 6px",
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden"
                          }}>
                            {proj.description}
                          </p>
                        )}

                        {/* Tech tags */}
                        {tags.length > 0 && (
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {tags.map(t => (
                              <span key={t} style={{
                                background: "var(--soft)", border: "1px solid var(--border)",
                                borderRadius: "10px", padding: "2px 7px",
                                fontSize: "9px", color: "var(--muted)"
                              }}>
                                {t}
                              </span>
                            ))}
                            {proj.technologies?.split(",").length > 3 && (
                              <span style={{ fontSize: "9px", color: "var(--muted)" }}>+{proj.technologies.split(",").length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row footer: date + actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} />
                        {proj.updatedAt
                          ? new Date(proj.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Just now"}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={e => { e.stopPropagation(); startEdit(proj); }}
                          style={{
                            border: "1px solid var(--border)", background: "var(--card)",
                            borderRadius: "7px", padding: "4px 9px", cursor: "pointer",
                            fontSize: "11px", color: "var(--muted)",
                            display: "flex", alignItems: "center", gap: "4px"
                          }}
                          title="Edit project"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(proj.id); }}
                          style={{
                            border: "1px solid #fecaca", background: "#fef2f2",
                            borderRadius: "7px", padding: "4px 9px", cursor: "pointer",
                            color: "#dc2626", display: "flex", alignItems: "center", gap: "4px"
                          }}
                          title="Delete project"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ════ RIGHT: Detail View or Upload Form ════ */}
        <div>
          {/* ── Detail View (when project is selected) ── */}
          {selectedProj && !editingId ? (
            <div className="panel" style={{ padding: "24px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "20px", paddingBottom: "18px", borderBottom: "1px solid var(--border)" }}>
                {(() => {
                  const [bg1, bg2] = avatarColors(selectedProj.name);
                  const statusStyle = STATUS_STYLES[selectedProj.status] || STATUS_STYLES.Development;
                  return (
                    <>
                      {selectedProj.imageUrl ? (
                        <img
                          src={selectedProj.imageUrl}
                          alt={selectedProj.name}
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid var(--border)"
                          }}
                        />
                      ) : (
                        <div style={{
                          width: "56px", height: "56px", borderRadius: "14px", flexShrink: 0,
                          background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                          color: "#fff", display: "grid", placeItems: "center",
                          fontSize: "22px", fontWeight: "800"
                        }}>
                          {(selectedProj.name || "P")[0].toUpperCase()}
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: "18px", marginBottom: "6px" }}>{selectedProj.name}</h2>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
                            fontWeight: "700", background: statusStyle.bg, color: statusStyle.color
                          }}>
                            {selectedProj.status}
                          </span>
                          {selectedProj.github && (
                            <a href={selectedProj.github.startsWith("http") ? selectedProj.github : `https://${selectedProj.github}`}
                              target="_blank" rel="noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--blue)" }}>
                              <GitBranch size={13} /> GitHub <ExternalLink size={11} />
                            </a>
                          )}
                          {selectedProj.website && (
                            <a href={selectedProj.website.startsWith("http") ? selectedProj.website : `https://${selectedProj.website}`}
                              target="_blank" rel="noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--blue)" }}>
                              <Globe size={13} /> Website <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)" }}
                      >
                        <X size={18} />
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Cover Banner if present */}
              {selectedProj.imageUrl && (
                <div style={{
                  width: "100%",
                  height: "190px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "18px",
                  border: "1px solid var(--border)"
                }}>
                  <img
                    src={selectedProj.imageUrl}
                    alt={selectedProj.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              )}

              {/* Description */}
              {selectedProj.description && (
                <div style={{ marginBottom: "18px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px", marginBottom: "8px" }}>DESCRIPTION</p>
                  <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.7" }}>{selectedProj.description}</p>
                </div>
              )}

              {/* Tech Stack */}
              {selectedProj.technologies && (
                <div style={{ marginBottom: "18px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Cpu size={12} /> TECH STACK
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {selectedProj.technologies.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} style={{
                        background: "#d0f0ff", border: "1px solid #80d4f0",
                        borderRadius: "12px", padding: "4px 10px",
                        fontSize: "11px", color: "#0078a8", fontWeight: "600"
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(selectedProj.github || selectedProj.website) && (
                <div style={{ marginBottom: "18px" }}>
                  <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Link2 size={12} /> LINKS
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedProj.github && (
                      <a href={selectedProj.github.startsWith("http") ? selectedProj.github : `https://${selectedProj.github}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: "12px", color: "var(--blue)", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "var(--soft)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <GitBranch size={14} /> {selectedProj.github}
                      </a>
                    )}
                    {selectedProj.website && (
                      <a href={selectedProj.website.startsWith("http") ? selectedProj.website : `https://${selectedProj.website}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: "12px", color: "var(--blue)", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "var(--soft)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                        <Globe size={14} /> {selectedProj.website}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "11px", color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
                <span>Created: {selectedProj.createdAt ? new Date(selectedProj.createdAt).toLocaleDateString() : "—"}</span>
                <span>Updated: {selectedProj.updatedAt ? new Date(selectedProj.updatedAt).toLocaleDateString() : "—"}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                <button className="primary-button compact" style={{ flex: 1 }} onClick={() => startEdit(selectedProj)}>
                  <Edit3 size={15} /> Edit Project
                </button>
                <button
                  onClick={() => handleDelete(selectedProj.id)}
                  style={{
                    height: "40px", padding: "0 16px", border: "1px solid #fecaca",
                    background: "#fef2f2", borderRadius: "9px", cursor: "pointer",
                    color: "#dc2626", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px"
                  }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ) : (
            /* ── Upload / Edit Form ── */
            <div className="panel" style={{ padding: "24px" }}>
              {/* Form header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #0c2340, #1a7fd4)",
                    color: "#00c8ff", display: "grid", placeItems: "center"
                  }}>
                    <UploadCloud size={19} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "15px" }}>
                      {editingId ? "Edit Project" : "Upload New Project"}
                    </h2>
                    <p style={{ fontSize: "10px", color: "var(--muted)", marginTop: "3px" }}>
                      {editingId ? "Update project details below." : "Fill in the details to add a project."}
                    </p>
                  </div>
                </div>
                {editingId && (
                  <button onClick={cancelEdit} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)" }}>
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Form fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {/* Project Name + Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="field">
                    <span>Project Name <span style={{ color: "#e84545" }}>*</span></span>
                    <input
                      value={form.name}
                      onChange={e => updateForm("name", e.target.value)}
                      placeholder="e.g. Autonomous Mobile Robot"
                    />
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <select value={form.status} onChange={e => updateForm("status", e.target.value)}>
                      <option>Active</option>
                      <option>Development</option>
                      <option>Calibrating</option>
                      <option>Archived</option>
                    </select>
                  </label>
                </div>

                {/* Description */}
                <label className="field">
                  <span>Description</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={e => updateForm("description", e.target.value)}
                    placeholder="Detailed architecture and mission scope..."
                  />
                </label>

                {/* Tech Stack */}
                <label className="field">
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Cpu size={11} /> Hardware & Firmware Technologies
                  </span>
                  <input
                    value={form.technologies}
                    onChange={e => updateForm("technologies", e.target.value)}
                    placeholder="e.g. ROS 2, STM32, CANopen, FreeRTOS (comma-separated)"
                  />
                </label>

                {/* Project Cover Image (Cloudinary) */}
                <div className="field">
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Camera size={11} /> Project Cover / Media (Cloudinary)
                  </span>
                  <input
                    ref={projectImgInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleProjectImageUpload}
                  />
                  {form.imageUrl ? (
                    <div style={{
                      position: "relative",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      marginTop: "4px"
                    }}>
                      <img
                        src={form.imageUrl}
                        alt="Project Cover"
                        style={{ width: "100%", height: "130px", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        display: "flex",
                        gap: "6px"
                      }}>
                        <button
                          type="button"
                          className="outline-button compact"
                          style={{ background: "rgba(255,255,255,0.9)", fontSize: "11px", height: "26px" }}
                          onClick={() => projectImgInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="outline-button compact"
                          style={{ background: "rgba(254,242,242,0.9)", color: "#dc2626", borderColor: "#fecaca", fontSize: "11px", height: "26px" }}
                          onClick={() => updateForm("imageUrl", "")}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploadingImage && projectImgInputRef.current?.click()}
                      style={{
                        border: "2px dashed var(--border)",
                        borderRadius: "10px",
                        padding: "16px",
                        textAlign: "center",
                        cursor: uploadingImage ? "default" : "pointer",
                        background: "var(--soft)",
                        marginTop: "4px"
                      }}
                    >
                      {uploadingImage ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "var(--blue)" }}>
                          <Loader2 size={16} className="animate-spin" />
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <Cloud size={20} color="var(--blue)" />
                          <strong style={{ fontSize: "12px", color: "var(--text)" }}>Upload Cover Image</strong>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>Image stored into the cloud (PNG, JPG, WEBP)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label className="field">
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Globe size={11} /> Website
                    </span>
                    <div className="field-with-icon">
                      <Globe size={15} />
                      <input
                        value={form.website}
                        onChange={e => updateForm("website", e.target.value)}
                        placeholder="https://yourproject.lab"
                      />
                    </div>
                  </label>
                  <label className="field">
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <GitBranch size={11} /> GitHub Repository
                    </span>
                    <div className="field-with-icon">
                      <Github size={15} />
                      <input
                        value={form.github}
                        onChange={e => updateForm("github", e.target.value)}
                        placeholder="https://github.com/user/repo"
                      />
                    </div>
                  </label>
                </div>

                {/* Live Preview badge row */}
                {form.name && (
                  <div style={{
                    padding: "12px 14px", borderRadius: "10px",
                    background: "var(--soft)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: "12px"
                  }}>
                    {(() => {
                      const [bg1, bg2] = avatarColors(form.name);
                      const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.Development;
                      return (
                        <>
                          <div style={{
                            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                            background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                            color: "#fff", display: "grid", placeItems: "center",
                            fontSize: "16px", fontWeight: "800"
                          }}>
                            {(form.name || "P")[0].toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: "13px" }}>{form.name}</strong>
                            <div style={{ marginTop: "4px" }}>
                              <span style={{
                                padding: "2px 8px", borderRadius: "20px", fontSize: "10px",
                                fontWeight: "700", background: statusStyle.bg, color: statusStyle.color
                              }}>
                                {form.status}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--muted)" }}>Preview</span>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "6px", borderTop: "1px solid var(--border)" }}>
                  {editingId && (
                    <button
                      onClick={cancelEdit}
                      style={{
                        height: "40px", padding: "0 16px", border: "1px solid var(--border)",
                        background: "var(--card)", borderRadius: "9px", cursor: "pointer",
                        color: "var(--muted)", fontSize: "12px"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="primary-button compact"
                    onClick={handleSave}
                    disabled={busy || !form.name.trim()}
                    style={{ minWidth: "140px" }}
                  >
                    <UploadCloud size={15} />
                    {busy ? "Saving..." : editingId ? "Update Project" : "Upload Project"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}