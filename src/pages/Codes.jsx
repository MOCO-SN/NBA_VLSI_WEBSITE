import { useRef, useState } from "react";
import {
  Upload,
  Search,
  FileCode2,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  FileText,
  Clock,
  UploadCloud,
  Code2
} from "lucide-react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, firebaseEnabled, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function Codes({ user, files, setFiles }) {
  const inputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const filtered = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  async function uploadFiles(event) {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    setBusy(true);

    try {
      for (const file of selected) {
        let textContent = "";
        try {
          if (file.size < 500000) {
            textContent = await file.text();
          }
        } catch {
          textContent = `// Binary or large file: ${file.name}`;
        }

        if (firebaseEnabled && storage && db) {
          try {
            const storageRef = ref(storage, `users/${user?.uid || "guest"}/codes/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, "codes"), {
              uid: user?.uid || "guest",
              name: file.name,
              language: detectLanguage(file.name),
              size: file.size,
              content: textContent,
              downloadURL: url,
              createdAt: serverTimestamp()
            });
            continue;
          } catch (storageErr) {
            console.warn("Storage upload failed, falling back to local workspace:", storageErr);
          }
        }

        // Local / demo workspace fallback
        const localFile = {
          id: crypto.randomUUID(),
          name: file.name,
          language: detectLanguage(file.name),
          size: file.size,
          content: textContent,
          updatedAt: new Date().toISOString()
        };
        setFiles((current) => [localFile, ...current]);
      }
    } catch (error) {
      alert(error.message || "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function removeFile(file) {
    if (!window.confirm(`Delete ${file.name}?`)) return;

    if (firebaseEnabled && db && file.id && !file.id.includes("-")) {
      try {
        await deleteDoc(doc(db, "codes", file.id));
      } catch (e) {
        console.warn("Delete doc error:", e);
      }
    }
    setFiles((current) => current.filter((item) => item.id !== file.id));
    if (previewFile?.id === file.id) setPreviewFile(null);
  }

  function handleDownload(file) {
    if (file.downloadURL) {
      window.open(file.downloadURL, "_blank");
      return;
    }

    const defaultContent =
      file.content ||
      `// =====================================\n// File: ${file.name}\n// Language: ${file.language || "Plain Text"}\n// Author: ${user?.displayName || "Developer"}\n// =====================================\n\nconsole.log("Loaded: ${file.name}");\n`;

    const blob = new Blob([defaultContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Codes</h1>
          <p>Upload, inspect, and manage your source code files in real-time.</p>
        </div>
        <button
          className="primary-button"
          onClick={() => { setPreviewFile(null); inputRef.current?.click(); }}
          disabled={busy}
        >
          <Upload size={16} /> {busy ? "Uploading..." : "Upload Code"}
        </button>
        <input ref={inputRef} type="file" multiple hidden onChange={uploadFiles} />
      </div>

      {/* ── Two-column layout ── */}
      <div className="projects-split" style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: "18px", alignItems: "start" }}>

        {/* ════ LEFT: File Recycler List ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {/* Search Bar */}
          <div className="panel" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="search-box" style={{ flex: 1, height: "38px" }}>
                <Search size={15} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search code files..."
                />
                {search && (
                  <button onClick={() => setSearch("")} style={{ border: 0, background: "none", color: "var(--muted)", cursor: "pointer" }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "10px" }}>
              {filtered.length} file{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Files List */}
          <div className="project-recycler" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
            {filtered.length === 0 ? (
              <div className="panel" style={{ padding: "40px 20px", textAlign: "center" }}>
                <FileCode2 size={36} style={{ color: "var(--muted)", marginBottom: "12px", opacity: 0.5 }} />
                <strong style={{ display: "block", fontSize: "14px", marginBottom: "6px" }}>
                  {files.length === 0 ? "No code files yet" : "No matches found"}
                </strong>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {files.length === 0
                    ? "Click Upload Code to add your first source file."
                    : "Try adjusting your search."}
                </span>
              </div>
            ) : (
              filtered.map((file) => {
                const isActive = previewFile?.id === file.id;
                
                // Color code the language badge slightly
                const langLower = (file.language || "").toLowerCase();
                let badgeBg = "var(--soft)";
                let badgeColor = "var(--navy)";
                if (langLower.includes("react") || langLower.includes("jsx")) { badgeBg = "#e0f7ff"; badgeColor = "#0078a8"; }
                else if (langLower.includes("python")) { badgeBg = "#fef3c7"; badgeColor = "#b45309"; }
                else if (langLower.includes("c") || langLower.includes("cpp")) { badgeBg = "#ede9fe"; badgeColor = "#7c3aed"; }

                return (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(file)}
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
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                        background: isActive ? "var(--blue)" : "var(--soft)",
                        color: isActive ? "#fff" : "var(--navy)",
                        display: "grid", placeItems: "center"
                      }}>
                        <Code2 size={20} />
                      </div>
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <strong style={{ fontSize: "13px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {file.name}
                          </strong>
                          <span style={{
                            padding: "2px 8px", borderRadius: "20px", fontSize: "9px",
                            fontWeight: "700", flexShrink: 0,
                            background: badgeBg, color: badgeColor
                          }}>
                            {file.language || "Source"}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "8px", fontSize: "10px", color: "var(--muted)" }}>
                          <span>{formatSize(file.size)}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={11} /> 
                            {file.updatedAt && file.updatedAt !== "Just now" 
                              ? new Date(file.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
                              : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row footer: Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)", gap: "6px" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                        style={{
                          border: "1px solid var(--border)", background: "var(--card)",
                          borderRadius: "7px", padding: "4px 9px", cursor: "pointer",
                          fontSize: "11px", color: "var(--muted)",
                          display: "flex", alignItems: "center", gap: "4px"
                        }}
                        title="Download"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(file); }}
                        style={{
                          border: "1px solid #fecaca", background: "#fef2f2",
                          borderRadius: "7px", padding: "4px 9px", cursor: "pointer",
                          color: "#dc2626", display: "flex", alignItems: "center", gap: "4px"
                        }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ════ RIGHT: Preview / Upload Form ════ */}
        <div style={{ position: "sticky", top: "18px" }}>
          {previewFile ? (
            /* ── Code Preview View ── */
            <div className="panel" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "70vh", border: "1.5px solid var(--blue)" }}>
              {/* Header */}
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "var(--soft)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                  <FileText size={18} color="var(--blue)" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: "hidden" }}>
                    <strong style={{ fontSize: "14px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewFile.name}
                    </strong>
                    <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                      {previewFile.language} • {formatSize(previewFile.size)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    className="outline-button"
                    style={{ height: "32px", padding: "0 12px", fontSize: "11px", background: "var(--card)" }}
                    onClick={() => handleDownload(previewFile)}
                  >
                    <Download size={14} /> <span className="hide-mobile">Download</span>
                  </button>
                  <button
                    style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--card)", padding: "0 8px", cursor: "pointer", color: "var(--muted)", display: "grid", placeItems: "center" }}
                    onClick={() => setPreviewFile(null)}
                    title="Close Preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              {/* Code Content */}
              <div style={{ padding: "16px", overflowY: "auto", flex: 1, background: "#1e1e1e", color: "#d4d4d4" }}>
                <pre style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {previewFile.content || `// Source code for ${previewFile.name}\n// Language: ${previewFile.language}\n// Size: ${formatSize(previewFile.size)}\n\n(File preview available - click Download to retrieve full binary/raw source)`}
                </pre>
              </div>
            </div>
          ) : (
            /* ── Upload State ── */
            <div className="panel" style={{ padding: "40px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "70vh", border: "2px dashed var(--border)" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "linear-gradient(135deg, #0c2340, #1a7fd4)",
                color: "#00c8ff", display: "grid", placeItems: "center",
                marginBottom: "20px"
              }}>
                <UploadCloud size={30} />
              </div>
              <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>Upload Source Code</h2>
              <p style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "260px", marginBottom: "24px", lineHeight: "1.5" }}>
                Select files from your computer to add to the workspace repository.
              </p>
              
              <button
                className="primary-button"
                style={{ padding: "0 24px", height: "44px", fontSize: "13px" }}
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                <Upload size={16} /> {busy ? "Uploading..." : "Select Files"}
              </button>
              
              <div style={{ marginTop: "24px", fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={13} color="#10b981" />
                Files are secured in your workspace
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function detectLanguage(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  const map = {
    js: "JavaScript",
    jsx: "React JSX",
    ts: "TypeScript",
    tsx: "React TSX",
    java: "Java",
    c: "C",
    cpp: "C++",
    h: "C/C++ Header",
    cs: "C#",
    py: "Python",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    ino: "Arduino",
    kt: "Kotlin",
    rs: "Rust",
    go: "Go",
    sh: "Shell Script"
  };
  return map[ext] || "Source";
}

function formatSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}