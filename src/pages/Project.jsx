import { useEffect, useState } from "react";
import { Save, Globe, ExternalLink } from "lucide-react";
import { Github } from "../components/SocialIcons";
import { db, firebaseEnabled } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const initial = {
  name: "",
  description: "",
  website: "",
  github: "",
  technologies: "",
  status: "Development"
};

export default function Project({ user }) {
  const storageKey = `mocosn_project_${user?.uid || "guest"}`;
  const [project, setProject] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.name === "Electro-Botics Autonomous System") {
          localStorage.removeItem(storageKey);
          return initial;
        }
        return { ...initial, ...parsed };
      } catch {
        return initial;
      }
    }
    return initial;
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!firebaseEnabled || !db || !user?.uid) return;
      try {
        const snap = await getDoc(doc(db, "projects", user.uid));
        if (snap.exists()) {
          const remoteData = { ...initial, ...snap.data() };
          if (remoteData?.name === "Electro-Botics Autonomous System") {
            setProject(initial);
          } else {
            setProject(remoteData);
            localStorage.setItem(storageKey, JSON.stringify(remoteData));
          }
        }
      } catch (e) {
        console.warn("Could not load remote project doc:", e);
      }
    }
    load();
  }, [user?.uid, storageKey]);

  function update(key, value) {
    setProject((p) => {
      const next = { ...p, [key]: value };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(project));

      if (firebaseEnabled && db && user?.uid) {
        await setDoc(
          doc(db, "projects", user.uid),
          {
            ...project,
            uid: user.uid,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.warn("Save project warning:", e);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1>Project</h1>
          <p>Update and publish hardware specs and repository links for your project.</p>
        </div>
      </div>

      <section className="panel form-panel">
        <div className="project-form-top">
          <div className="project-logo large">
            {(project.name || "P")[0].toUpperCase()}
          </div>
          <div>
            <h2>{project.name || "Your project"}</h2>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>Status: <b>{project.status}</b></span>
              {project.github && (
                <a
                  href={project.github.startsWith("http") ? project.github : `https://${project.github}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#579cf5" }}
                >
                  GitHub <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Project name">
            <input
              value={project.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Autonomous Mobile Robot"
            />
          </Field>

          <Field label="Status">
            <select value={project.status} onChange={(e) => update("status", e.target.value)}>
              <option>Active</option>
              <option>Development</option>
              <option>Calibrating</option>
              <option>Archived</option>
            </select>
          </Field>

          <Field label="Website">
            <div className="field-with-icon">
              <Globe size={16} />
              <input
                value={project.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourproject.lab"
              />
            </div>
          </Field>

          <Field label="GitHub Repository">
            <div className="field-with-icon">
              <Github size={16} />
              <input
                value={project.github}
                onChange={(e) => update("github", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>
          </Field>

          <Field label="Hardware & Firmware Technologies">
            <input
              value={project.technologies}
              onChange={(e) => update("technologies", e.target.value)}
              placeholder="e.g. ROS 2, STM32, CANopen, FreeRTOS"
            />
          </Field>

          <Field label="Description" full>
            <textarea
              rows="5"
              value={project.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Detailed architecture and mission scope..."
            />
          </Field>
        </div>

        <div className="form-actions">
          {saved && <span className="save-success">Project saved successfully.</span>}
          <button className="primary-button compact" onClick={save} disabled={busy}>
            <Save size={16} /> {busy ? "Saving..." : "Save Project"}
          </button>
        </div>
      </section>
    </>
  );
}

function Field({ label, children, full }) {
  return (
    <label className={`field full-field ${full ? "span-2" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}