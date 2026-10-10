import { useRef, useState, useMemo } from "react";
import {
  Save,
  UserRound,
  Mail,
  AtSign,
  Camera,
  Cpu,
  Wrench,
  Phone,
  Plus,
  X,
  Tag,
  CheckCircle2,
  Sparkles,
  Cloud,
  Loader2
} from "lucide-react";
import { Github, Linkedin } from "../components/SocialIcons";
import { auth, db, firebaseEnabled } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getRegisteredUsers, saveRegisteredUser } from "../utils/userDirectory";
import { uploadImageToCloud } from "../utils/cloudinary";

const INTEREST_SUGGESTIONS = [
  "FPGA Synthesis",
  "RISC-V Architecture",
  "ROS 2 & Kinematics",
  "ASIC Verification",
  "Embedded C / RTOS",
  "Edge AI & Computer Vision",
  "High-Speed PCB Design",
  "CAN Bus & Automotive Telemetry",
  "Digital Signal Processing",
  "LoRaWAN & IoT Telemetry"
];

const HARDWARE_SUGGESTIONS = [
  "Xilinx Artix-7 / Vivado",
  "Digital Storage Oscilloscope",
  "Hardware Logic Analyzer",
  "CAN Bus Analyzer",
  "STM32 Nucleo Bench",
  "JTAG Hardware Debugger",
  "Spectrum Analyzer",
  "Soldering & Rework Station",
  "Analog Discovery 2",
  "Raspberry Pi / Jetson Nano"
];

export default function Profile({ user, onUpdateUser }) {
  const fileInputRef = useRef(null);

  // Load existing profile from registered user directory or localStorage
  const existingDirUser = useMemo(() => {
    try {
      const list = getRegisteredUsers();
      return list.find(
        (u) =>
          (user?.uid && u.id === user.uid) ||
          (user?.email && u.email?.toLowerCase() === user.email.toLowerCase())
      );
    } catch {
      return null;
    }
  }, [user]);

  const [name, setName] = useState(
    user?.displayName || existingDirUser?.name || ""
  );
  const [email] = useState(user?.email || existingDirUser?.email || "");
  const [username, setUsername] = useState(
    localStorage.getItem("mocosn_username") || existingDirUser?.username || ""
  );
  const [bio, setBio] = useState(
    localStorage.getItem("mocosn_bio") || existingDirUser?.bio || ""
  );
  const [avatar, setAvatar] = useState(
    user?.photoURL || localStorage.getItem("mocosn_avatar") || existingDirUser?.avatar || ""
  );

  // ── Research Interests State ──
  const [interests, setInterests] = useState(() => {
    try {
      const local = localStorage.getItem(`mocosn_interests_${user?.uid || "guest"}`);
      if (local) return JSON.parse(local);
      if (existingDirUser?.interests?.length) return existingDirUser.interests;
    } catch {}
    return ["FPGA Synthesis", "ROS 2 & Kinematics", "Embedded C / RTOS"];
  });
  const [newInterestInput, setNewInterestInput] = useState("");

  // ── Hardware Tools State ──
  const [hardwareTools, setHardwareTools] = useState(() => {
    try {
      const local = localStorage.getItem(`mocosn_hardwareTools_${user?.uid || "guest"}`);
      if (local) return JSON.parse(local);
      if (existingDirUser?.hardwareTools?.length) return existingDirUser.hardwareTools;
    } catch {}
    return ["Digital Storage Oscilloscope", "Hardware Logic Analyzer", "FPGA Dev Bench"];
  });
  const [newToolInput, setNewToolInput] = useState("");

  // ── Links & Contact ──
  const [github, setGithub] = useState(() => {
    return localStorage.getItem(`mocosn_github_${user?.uid || "guest"}`) || existingDirUser?.github || "";
  });
  const [linkedin, setLinkedin] = useState(() => {
    return localStorage.getItem(`mocosn_linkedin_${user?.uid || "guest"}`) || existingDirUser?.linkedin || "";
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem(`mocosn_phone_${user?.uid || "guest"}`) || existingDirUser?.phone || "";
  });

  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cloudProviderUsed, setCloudProviderUsed] = useState(() => {
    return avatar?.includes("cloudinary")
      ? "Cloudinary"
      : avatar?.includes("firebasestorage")
      ? "Firebase Storage"
      : "";
  });

  // ── Tag Handlers ──
  function addInterest(val) {
    const trimmed = (val || newInterestInput).trim();
    if (!trimmed || interests.includes(trimmed)) return;
    setInterests([...interests, trimmed]);
    setNewInterestInput("");
  }

  function removeInterest(tag) {
    setInterests(interests.filter((t) => t !== tag));
  }

  function addTool(val) {
    const trimmed = (val || newToolInput).trim();
    if (!trimmed || hardwareTools.includes(trimmed)) return;
    setHardwareTools([...hardwareTools, trimmed]);
    setNewToolInput("");
  }

  function removeTool(tool) {
    setHardwareTools(hardwareTools.filter((t) => t !== tool));
  }

  async function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP, GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Please select an image smaller than 10MB.");
      return;
    }

    setUploadingPhoto(true);

    try {
      const uploadRes = await uploadImageToCloud(file, { folder: "nba_vlsi/avatars" });
      const cloudUrl = uploadRes.url;
      setAvatar(cloudUrl);
      setCloudProviderUsed(uploadRes.provider === "cloudinary" ? "Cloudinary" : "Firebase Storage");
      localStorage.setItem("mocosn_avatar", cloudUrl);
      if (onUpdateUser) {
        onUpdateUser({ photoURL: cloudUrl });
      }

      // Persist to Firebase Auth & Firestore immediately if authenticated
      if (firebaseEnabled && auth?.currentUser) {
        const isSafeAuthUrl = Boolean(
          cloudUrl &&
          typeof cloudUrl === "string" &&
          (cloudUrl.startsWith("http://") || cloudUrl.startsWith("https://")) &&
          cloudUrl.length <= 2048
        );
        if (isSafeAuthUrl) {
          try {
            await updateProfile(auth.currentUser, { photoURL: cloudUrl });
          } catch (authErr) {
            console.warn("Could not update auth photoURL:", authErr);
          }
        }
        if (db && user?.uid) {
          await setDoc(doc(db, "users", user.uid), { photoURL: cloudUrl }, { merge: true }).catch(() => {});
        }
      }

      // Sync into registered user directory (feeds RoboticsTeam)
      saveRegisteredUser({
        id: user?.uid || `usr-${email.replace(/[^a-z0-9]/g, "-")}`,
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim(),
        avatar: cloudUrl,
        photoURL: cloudUrl
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.warn("Cloud image upload failed, falling back to local preview:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string") {
          setAvatar(dataUrl);
          localStorage.setItem("mocosn_avatar", dataUrl);
          if (onUpdateUser) {
            onUpdateUser({ photoURL: dataUrl });
          }
        }
      };
      reader.readAsDataURL(file);
      alert(
        `Cloud Upload Notice:\n${err.message || "Failed to upload to Cloudinary."}\n\nA local preview was loaded. Click "Cloud Storage Settings" to configure your Cloudinary credentials.`
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save() {
    setBusy(true);
    try {
      if (firebaseEnabled && auth?.currentUser) {
        const isSafeAuthUrl = Boolean(
          avatar &&
          typeof avatar === "string" &&
          (avatar.startsWith("http://") || avatar.startsWith("https://")) &&
          avatar.length <= 2048
        );

        try {
          await updateProfile(auth.currentUser, {
            displayName: name.trim(),
            ...(isSafeAuthUrl ? { photoURL: avatar } : {})
          });
        } catch (authErr) {
          console.warn("Could not update auth profile:", authErr);
        }

        if (db && user?.uid) {
          await setDoc(
            doc(db, "users", user.uid),
            {
              displayName: name.trim(),
              username: username.trim(),
              bio: bio.trim(),
              photoURL: avatar || "",
              interests,
              hardwareTools,
              github: github.trim(),
              linkedin: linkedin.trim(),
              phone: phone.trim(),
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
      }

      // Persist to user directory (which feeds RoboticsTeam roster & dossiers)
      saveRegisteredUser({
        id: user?.uid || `usr-${email.replace(/[^a-z0-9]/g, "-")}`,
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar || "",
        photoURL: avatar || "",
        interests,
        hardwareTools,
        github: github.trim(),
        linkedin: linkedin.trim(),
        phone: phone.trim()
      });

      // Save to localStorage
      const uidKey = user?.uid || "guest";
      localStorage.setItem("mocosn_username", username.trim());
      localStorage.setItem("mocosn_bio", bio.trim());
      localStorage.setItem("mocosn_displayName", name.trim());
      localStorage.setItem(`mocosn_interests_${uidKey}`, JSON.stringify(interests));
      localStorage.setItem(`mocosn_hardwareTools_${uidKey}`, JSON.stringify(hardwareTools));
      localStorage.setItem(`mocosn_github_${uidKey}`, github.trim());
      localStorage.setItem(`mocosn_linkedin_${uidKey}`, linkedin.trim());
      localStorage.setItem(`mocosn_phone_${uidKey}`, phone.trim());

      if (onUpdateUser) {
        onUpdateUser({
          displayName: name.trim(),
          photoURL: avatar
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save profile error:", err);
      alert(err.message || "Failed to update profile.");
    } finally {
      setBusy(false);
    }
  }

  const initials = (name || "Developer")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "D";

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">RESEARCHER IDENTITY</div>
          <h1>Profile & Specializations</h1>
          <p>
            Configure your technical proficiencies, research interests, hardware tools,
            and public contact details displayed across the lab team roster.
          </p>
        </div>
      </div>

      <section className="panel form-panel" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {/* ── Avatar Header ── */}
        <div className="profile-header">
          <div
            className="avatar profile-avatar"
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: uploadingPhoto ? "default" : "pointer",
              backgroundImage: avatar ? `url(${avatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "2px solid var(--border)",
              boxShadow: "var(--shadow)"
            }}
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            title={uploadingPhoto ? "Uploading photo..." : "Click to change photo"}
          >
            {!avatar && !uploadingPhoto && initials}
            {uploadingPhoto ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10, 20, 35, 0.7)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00c8ff",
                  padding: "6px",
                  textAlign: "center"
                }}
              >
                <Loader2 size={24} className="animate-spin" />
                <span style={{ fontSize: "10px", marginTop: "4px", color: "#fff", fontWeight: 600 }}>
                  Uploading...
                </span>
              </div>
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  display: "grid",
                  placeItems: "center",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  color: "#fff"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                <Camera size={20} />
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>
              {name || "Researcher"}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 10px" }}>{email}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoSelect}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="outline-button"
                type="button"
                style={{ height: "30px", fontSize: "11px", padding: "0 12px" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                {uploadingPhoto ? "Uploading to Cloud..." : "Change Photo"}
              </button>
            </div>
            {cloudProviderUsed && (
              <span style={{ fontSize: "11px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "8px" }}>
                <Cloud size={12} color="var(--blue)" /> Stored in: <strong style={{ color: "var(--text)" }}>{cloudProviderUsed}</strong>
              </span>
            )}
          </div>
        </div>

        {/* ── Section 1: Basic Identity ── */}
        <div>
          <h3 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--muted)", marginBottom: "14px" }}>
            1. Core Developer Information
          </h3>
          <div className="form-grid">
            <Field label="Full Name" icon={UserRound}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </Field>

            <Field label="Official Lab Email" icon={Mail}>
              <input value={email} disabled title="Official email cannot be modified" />
            </Field>

            <Field label="Lab Handle / Username" icon={AtSign}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
              />
            </Field>

            <Field label="Research Background & Bio" full>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Summarize your role, research direction, or technical experience in the lab..."
              />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Research Interests ── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Sparkles size={16} color="var(--blue)" />
            <h3 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--muted)", margin: 0 }}>
              2. Research Interests & Technical Domains
            </h3>
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0 0 14px" }}>
            These tags are displayed prominently on your dossier and badge in the Robotics & VLSI Team Roster.
          </p>

          {/* Active Interest Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", minHeight: "36px" }}>
            {interests.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  background: "var(--soft)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                <Tag size={12} color="var(--blue)" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeInterest(tag)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--muted)",
                    display: "grid",
                    placeItems: "center"
                  }}
                  title="Remove tag"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom interest input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div className="input-box" style={{ flex: 1, height: "40px" }}>
              <Tag size={15} />
              <input
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                placeholder="Type an interest (e.g. RISC-V, Edge AI, FPGA)..."
              />
            </div>
            <button
              type="button"
              className="outline-button"
              style={{ height: "40px", padding: "0 16px" }}
              onClick={() => addInterest()}
              disabled={!newInterestInput.trim()}
            >
              <Plus size={14} /> Add Tag
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Quick Suggestions:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {INTEREST_SUGGESTIONS.filter((s) => !interests.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addInterest(s)}
                  style={{
                    border: "1px dashed var(--border)",
                    background: "var(--card)",
                    color: "var(--muted)",
                    padding: "4px 10px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--blue)";
                    e.currentTarget.style.color = "var(--blue)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Primary Hardware Tools ── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Cpu size={16} color="var(--blue)" />
            <h3 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--muted)", margin: 0 }}>
              3. Primary Hardware Tools & Instrumentation
            </h3>
          </div>
          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0 0 14px" }}>
            List the specialized bench equipment, EDA tools, and developer boards you operate.
          </p>

          {/* Active Hardware Chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", minHeight: "36px" }}>
            {hardwareTools.map((tool) => (
              <span
                key={tool}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  background: "var(--soft)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                  fontSize: "12px",
                  fontWeight: "600"
                }}
              >
                <Wrench size={12} color="var(--blue)" />
                {tool}
                <button
                  type="button"
                  onClick={() => removeTool(tool)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--muted)",
                    display: "grid",
                    placeItems: "center"
                  }}
                  title="Remove tool"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom tool input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
            <div className="input-box" style={{ flex: 1, height: "40px" }}>
              <Wrench size={15} />
              <input
                value={newToolInput}
                onChange={(e) => setNewToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTool();
                  }
                }}
                placeholder="Type a hardware tool (e.g. Logic Analyzer, Vivado)..."
              />
            </div>
            <button
              type="button"
              className="outline-button"
              style={{ height: "40px", padding: "0 16px" }}
              onClick={() => addTool()}
              disabled={!newToolInput.trim()}
            >
              <Plus size={14} /> Add Tool
            </button>
          </div>

          {/* Hardware Suggestions */}
          <div>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--muted)", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Quick Suggestions:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {HARDWARE_SUGGESTIONS.filter((s) => !hardwareTools.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addTool(s)}
                  style={{
                    border: "1px dashed var(--border)",
                    background: "var(--card)",
                    color: "var(--muted)",
                    padding: "4px 10px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--blue)";
                    e.currentTarget.style.color = "var(--blue)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 4: External Links & Communication ── */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--muted)", marginBottom: "14px" }}>
            4. Public Communication & Repository Links
          </h3>
          <div className="form-grid">
            <Field label="GitHub Profile URL" icon={Github}>
              <input
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/username"
              />
            </Field>

            <Field label="LinkedIn Profile URL" icon={Linkedin}>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </Field>

            <Field label="Lab Extension / Phone" icon={Phone}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210 / Lab Room 204"
              />
            </Field>
          </div>
        </div>

        {/* ── Save Action ── */}
        <div className="form-actions" style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "14px" }}>
          {saved && (
            <span style={{ fontSize: "12px", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
              <CheckCircle2 size={16} /> Profile & specializations updated!
            </span>
          )}
          <button className="primary-button" style={{ height: "42px", padding: "0 24px" }} onClick={save} disabled={busy}>
            <Save size={16} /> {busy ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </section>
    </>
  );
}

function Field({ label, icon: Icon, children, full }) {
  return (
    <label className={`field full-field ${full ? "span-2" : ""}`}>
      <span>{label}</span>
      {Icon ? <div className="field-with-icon"><Icon size={16} />{children}</div> : children}
    </label>
  );
}