import { useEffect, useMemo, useState } from "react";
import { db, firebaseEnabled, logoutUser } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Overview from "../components/Overview";
import Codes from "./Codes";
import Project from "./Project";
import Profile from "./Profile";
import Settings from "./Settings";
import RoboticsTeam from "./RoboticsTeam";
import AdminDashboard from "./AdminDashboard";
import { getRegisteredUsers } from "../utils/userDirectory";

export default function Dashboard({ user, onLogout, onUpdateUser, onViewLanding }) {
  const [page, setPage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync role from registered user directory
  const directoryUser = useMemo(() => {
    const list = getRegisteredUsers();
    return list.find(
      (u) =>
        u.id === user?.uid ||
        (user?.email && u.email?.toLowerCase() === user.email.toLowerCase())
    );
  }, [user]);

  const assignedRole = user?.role || directoryUser?.role || null;

  const currentUser = {
    ...user,
    displayName: user?.displayName || directoryUser?.name || user?.email?.split("@")[0] || "User",
    email: user?.email || "",
    role: assignedRole
  };

  // Initialize files from localStorage or empty array (no dummy files)
  const storageKey = `mocosn_files_${user?.uid || "guest"}`;
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Purge legacy dummy files
        const cleaned = parsed.filter((f) => !["1", "2", "3", "4"].includes(f.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
        }
        return cleaned;
      } catch {
        return [];
      }
    }
    return [];
  });

  // Sync files to localStorage
  const handleSetFiles = (updater) => {
    setFiles((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!firebaseEnabled || !user?.uid || !db) return;

    try {
      const q = query(collection(db, "codes"), where("uid", "==", user.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setFiles(data);
            try {
              localStorage.setItem(storageKey, JSON.stringify(data));
            } catch {}
          }
        },
        (error) => {
          console.warn("Firestore snapshot error (using local files):", error);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Firestore listener setup error:", e);
    }
  }, [user?.uid, storageKey]);

  const stats = useMemo(() => {
    const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    const rawProject = localStorage.getItem(`mocosn_project_${user?.uid || "guest"}`);
    let hasProject = false;
    if (rawProject) {
      try {
        const parsed = JSON.parse(rawProject);
        hasProject = Boolean(parsed?.name && parsed.name !== "Electro-Botics Autonomous System");
      } catch {}
    }
    return {
      files: files.length,
      projects: hasProject ? 1 : 0,
      storage: totalBytes > 0 ? `${(totalBytes / 1024 / 1024).toFixed(2)} MB` : "0 MB",
      totalBytes,
      activity: files.length
    };
  }, [files, user?.uid]);

  async function handleLogoutClick() {
    if (onLogout) {
      await onLogout();
    } else {
      await logoutUser();
    }
  }

  function renderPage() {
    if (page === "Overview") return <Overview user={currentUser} files={files} stats={stats} setPage={setPage} />;
    if (page === "Admin Console") return <AdminDashboard user={currentUser} />;
    if (page === "Codes") return <Codes user={currentUser} files={files} setFiles={handleSetFiles} />;
    if (page === "Project") return <Project user={currentUser} />;
    if (page === "Robotics Team") return <RoboticsTeam user={currentUser} />;
    if (page === "Profile") return <Profile user={currentUser} onUpdateUser={onUpdateUser} />;
    if (page === "Settings") return <Settings user={currentUser} onLogout={handleLogoutClick} />;
    return <Overview user={currentUser} files={files} stats={stats} setPage={setPage} />;
  }

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar
        page={page}
        setPage={(value) => { setPage(value); setMobileOpen(false); }}
        onLogout={handleLogoutClick}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={currentUser}
      />
      <div className="main-area">
        <Header
          page={page}
          user={currentUser}
          onMenu={() => setMobileOpen(!mobileOpen)}
          onLogout={handleLogoutClick}
          onViewLanding={onViewLanding}
        />
        <main className="content">{renderPage()}</main>
      </div>
    </div>
  );
}