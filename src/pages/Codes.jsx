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
  FileText
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
            const storageRef = ref(storage, `users/${user.uid}/codes/${Date.now()}-${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, "codes"), {
              uid: user.uid,
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
          updatedAt: "Just now"
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
    if (!confirm(`Delete ${file.name}?`)) return;

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
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Codes</h1>
          <p>Upload, inspect, and manage your source code files in real-time.</p>
        </div>
        <button
          className="primary-button compact"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Upload size={16} /> {busy ? "Uploading..." : "Upload Code"}
        </button>
        <input ref={inputRef} type="file" multiple hidden onChange={uploadFiles} />
      </div>

      <section className="panel codes-panel">
        <div className="codes-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search uploaded codes..."
            />
          </div>
          <span className="result-count">{filtered.length} files</span>
        </div>

        <div className="code-table">
          <div className="code-table-head">
            <span>FILE</span>
            <span>LANGUAGE</span>
            <span>SIZE</span>
            <span>UPDATED</span>
            <span style={{ textAlign: "right" }}>ACTIONS</span>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <FileCode2 size={30} />
              <strong>No code files found</strong>
              <span>Upload your first source file to get started.</span>
            </div>
          )}

          {filtered.map((file) => (
            <div className="code-table-row" key={file.id}>
              <div
                className="code-name"
                style={{ cursor: "pointer" }}
                onClick={() => setPreviewFile(file)}
                title="Click to view file"
              >
                <div className="file-icon"><FileCode2 size={17} /></div>
                <strong>{file.name}</strong>
              </div>
              <span>{file.language || "Source"}</span>
              <span>{formatSize(file.size)}</span>
              <span>{file.updatedAt || "Recently"}</span>
              <div className="row-actions">
                <button
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  title="Inspect Code"
                  aria-label="Inspect Code"
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  title="Download File"
                  aria-label="Download File"
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(file)}
                  title="Delete File"
                  aria-label="Delete File"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="info-strip">
        <CheckCircle2 size={17} />
        Uploaded files belong to {user?.displayName || "your account"} and are secured under your workspace.
      </div>

      {/* Code Inspector / Preview Modal */}
      {previewFile && (
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
          onClick={() => setPreviewFile(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "min(720px, 100%)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--soft)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText size={20} color="var(--navy)" />
                <div>
                  <strong style={{ fontSize: "14px", display: "block" }}>{previewFile.name}</strong>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    {previewFile.language} · {formatSize(previewFile.size)}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="outline-button"
                  style={{ height: "32px", padding: "0 12px", fontSize: "11px" }}
                  onClick={() => handleDownload(previewFile)}
                >
                  <Download size={14} /> Download
                </button>
                <button
                  style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--muted)" }}
                  onClick={() => setPreviewFile(null)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: "16px", overflowY: "auto", flex: 1, background: "#1e1e1e", color: "#d4d4d4" }}>
              <pre style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {previewFile.content || `// Source code for ${previewFile.name}\n// Language: ${previewFile.language}\n// Size: ${formatSize(previewFile.size)}\n\n(File preview available - click Download to retrieve full binary/raw source)`}
              </pre>
            </div>
          </div>
        </div>
      )}
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