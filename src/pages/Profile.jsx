import { useRef, useState } from "react";
import { Save, UserRound, Mail, AtSign, Camera } from "lucide-react";
import { auth, db, firebaseEnabled } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Profile({ user, onUpdateUser }) {
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user?.displayName || "");
  const [email] = useState(user?.email || "");
  const [username, setUsername] = useState(localStorage.getItem("mocosn_username") || "");
  const [bio, setBio] = useState(localStorage.getItem("mocosn_bio") || "");
  const [avatar, setAvatar] = useState(user?.photoURL || localStorage.getItem("mocosn_avatar") || "");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB.");
      return;
    }

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
  }

  async function save() {
    setBusy(true);
    try {
      if (firebaseEnabled && auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim(),
          ...(avatar ? { photoURL: avatar } : {})
        });

        if (db && user?.uid) {
          await setDoc(
            doc(db, "users", user.uid),
            {
              displayName: name.trim(),
              username: username.trim(),
              bio: bio.trim(),
              photoURL: avatar || "",
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
        }
      }

      localStorage.setItem("mocosn_username", username.trim());
      localStorage.setItem("mocosn_bio", bio.trim());
      localStorage.setItem("mocosn_displayName", name.trim());

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
          <div className="eyebrow">Account</div>
          <h1>Profile</h1>
          <p>Update your personal information and developer identity.</p>
        </div>
      </div>

      <section className="panel form-panel">
        <div className="profile-header">
          <div
            className="avatar profile-avatar"
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              backgroundImage: avatar ? `url(${avatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to change photo"
          >
            {!avatar && initials}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
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
          </div>

          <div>
            <h2>{name || "Your name"}</h2>
            <p>{email}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoSelect}
            />
            <button
              className="text-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Change photo
            </button>
          </div>
        </div>

        <div className="form-grid">
          <Field label="Full name" icon={UserRound}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
          </Field>

          <Field label="Email" icon={Mail}>
            <input value={email} disabled />
          </Field>

          <Field label="Username" icon={AtSign}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
            />
          </Field>

          <Field label="Bio" full>
            <textarea
              rows="5"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about your role, projects or background..."
            />
          </Field>
        </div>

        <div className="form-actions">
          {saved && <span className="save-success">Profile updated successfully.</span>}
          <button className="primary-button compact" onClick={save} disabled={busy}>
            <Save size={16} /> {busy ? "Saving..." : "Save Changes"}
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