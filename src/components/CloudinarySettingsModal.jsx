import { useState, useEffect } from "react";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Loader2,
  Folder,
  Key,
  ShieldCheck,
  Sparkles,
  Info
} from "lucide-react";
import {
  getCloudinaryConfig,
  saveCloudinaryConfig,
  testCloudinaryConnection
} from "../utils/cloudinary";

export default function CloudinarySettingsModal({ isOpen, onClose }) {
  const [cloudName, setCloudName] = useState("");
  const [uploadPreset, setUploadPreset] = useState("");
  const [folder, setFolder] = useState("nba_vlsi");
  const [isConfigured, setIsConfigured] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getCloudinaryConfig();
      setCloudName(cfg.cloudName || "");
      setUploadPreset(cfg.uploadPreset || "");
      setFolder(cfg.folder || "nba_vlsi");
      setIsConfigured(cfg.isConfigured);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const result = await testCloudinaryConnection(cloudName, uploadPreset);
    setTestResult(result);
    setTesting(false);
  }

  function handleSave(e) {
    e?.preventDefault();
    saveCloudinaryConfig({ cloudName, uploadPreset, folder });
    setIsConfigured(Boolean(cloudName.trim() && uploadPreset.trim()));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  }

  function handleClear() {
    if (window.confirm("Remove custom Cloudinary settings and reset to defaults?")) {
      saveCloudinaryConfig({ cloudName: "", uploadPreset: "", folder: "nba_vlsi" });
      setCloudName("");
      setUploadPreset("");
      setFolder("nba_vlsi");
      setIsConfigured(false);
      setTestResult(null);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 20, 35, 0.65)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        padding: "16px",
        overflowY: "auto"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="panel"
        style={{
          width: "100%",
          maxWidth: "520px",
          borderRadius: "16px",
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          padding: "26px",
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0c2340, #1a7fd4)",
                color: "#00c8ff",
                display: "grid",
                placeItems: "center"
              }}
            >
              <Cloud size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: "700", margin: 0, color: "var(--text)" }}>
                Cloudinary Storage
              </h2>
              <p style={{ fontSize: "12px", color: "var(--muted)", margin: "3px 0 0" }}>
                Cloud media storage for avatars & project assets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Badge */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: isConfigured ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: `1px solid ${isConfigured ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            color: isConfigured ? "#10b981" : "#d97706",
            fontSize: "12px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px"
          }}
        >
          {isConfigured ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
          <span>
            {isConfigured
              ? `Cloudinary Active: "${cloudName}" (unsigned preset "${uploadPreset}")`
              : "Cloudinary Unset — image uploads will fall back to Firebase Storage."}
          </span>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "6px" }}>
              Cloud Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="search-box" style={{ height: "40px" }}>
              <Key size={15} />
              <input
                type="text"
                placeholder="e.g. dna2k3x9 or your-lab-name"
                value={cloudName}
                onChange={(e) => setCloudName(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              Found at the top of your Cloudinary Dashboard.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "6px" }}>
              Upload Preset (Unsigned) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="search-box" style={{ height: "40px" }}>
              <Sparkles size={15} />
              <input
                type="text"
                placeholder="e.g. ml_default or nba_vlsi_unsigned"
                value={uploadPreset}
                onChange={(e) => setUploadPreset(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>
            <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px", display: "block" }}>
              Must have <strong>Signing Mode = Unsigned</strong> in Cloudinary Settings &gt; Upload.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted)", marginBottom: "6px" }}>
              Target Folder (Optional)
            </label>
            <div className="search-box" style={{ height: "40px" }}>
              <Folder size={15} />
              <input
                type="text"
                placeholder="nba_vlsi"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Test connection result */}
          {testResult && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                background: testResult.ok ? "#ecfdf5" : "#fef2f2",
                border: `1px solid ${testResult.ok ? "#a7f3d0" : "#fecaca"}`,
                color: testResult.ok ? "#065f46" : "#991b1b",
                fontSize: "12px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px"
              }}
            >
              {testResult.ok ? <CheckCircle2 size={16} style={{ marginTop: "2px" }} /> : <AlertCircle size={16} style={{ marginTop: "2px" }} />}
              <div>
                <strong>{testResult.ok ? "Connection Successful!" : "Connection Test Failed"}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "11px" }}>
                  {testResult.ok
                    ? "Successfully verified Cloudinary unsigned upload endpoint."
                    : testResult.error}
                </p>
              </div>
            </div>
          )}

          {/* Quick Guide Help Box */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "var(--soft)",
              border: "1px solid var(--border)",
              fontSize: "11px",
              color: "var(--muted)",
              lineHeight: 1.5
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text)", fontWeight: "700", marginBottom: "4px" }}>
              <Info size={13} color="var(--blue)" /> How to get free Cloudinary credentials:
            </div>
            <ol style={{ margin: 0, paddingLeft: "18px" }}>
              <li>Create a free account at <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noreferrer" style={{ color: "var(--blue)" }}>cloudinary.com</a>.</li>
              <li>Go to <strong>Settings &gt; Upload &gt; Upload presets</strong>.</li>
              <li>Click <strong>Add upload preset</strong>, set <strong>Signing Mode</strong> to <strong>Unsigned</strong>, and click <strong>Save</strong>.</li>
              <li>Copy your Cloud Name and Preset Name into this form.</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", gap: "10px" }}>
            <button
              type="button"
              className="outline-button"
              onClick={handleTest}
              disabled={testing || !cloudName || !uploadPreset}
              style={{ height: "38px", fontSize: "12px" }}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {testing ? "Testing..." : "Test Connection"}
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--muted)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="primary-button"
                style={{ height: "38px", fontSize: "12px", padding: "0 18px" }}
              >
                {savedSuccess ? "Saved!" : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
