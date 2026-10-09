import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseEnabled, logoutUser } from "./firebase";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingAccess from "./pages/PendingAccess";
import {
  getRegisteredUsers,
  saveRegisteredUser,
  hasWebsiteAccess,
  checkEmailRoleFromFirestore,
  checkAdminFromFirestore
} from "./utils/userDirectory";

export default function App() {
  const [user, setUser] = useState(() => {
    const savedGuest = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("mocosn_demo_user") : null;
    if (savedGuest) {
      try {
        return JSON.parse(savedGuest);
      } catch {
        sessionStorage.removeItem("mocosn_demo_user");
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    const hasGuest = typeof sessionStorage !== "undefined" && Boolean(sessionStorage.getItem("mocosn_demo_user"));
    return !hasGuest && Boolean(firebaseEnabled && auth);
  });

  // Route state: "/" (Landing), "/app" (Dashboard/Workspace), "/login"
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith("/app") || hash.startsWith("#/app")) return "/app";
      if (path.startsWith("/login") || hash.startsWith("#/login")) return "/login";
    }
    return "/";
  });

  const navigateTo = (route) => {
    if (typeof window !== "undefined") {
      try {
        if (window.location.pathname !== route) {
          window.history.pushState(null, "", route);
        }
      } catch {
        window.location.hash = `#${route}`;
      }
    }
    setCurrentRoute(route);
  };

  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith("/app") || hash.startsWith("#/app")) {
        setCurrentRoute("/app");
      } else if (path.startsWith("/login") || hash.startsWith("#/login")) {
        setCurrentRoute("/login");
      } else {
        setCurrentRoute("/");
      }
    };
    window.addEventListener("popstate", handleRouteSync);
    window.addEventListener("hashchange", handleRouteSync);
    return () => {
      window.removeEventListener("popstate", handleRouteSync);
      window.removeEventListener("hashchange", handleRouteSync);
    };
  }, []);

  // Apply saved theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem("mocosn_theme") || "Light";
    document.documentElement.dataset.theme = savedTheme.toLowerCase();
  }, []);

  // Listen to Firebase Auth state and check role directly from Firestore (/admins and /users)
  useEffect(() => {
    if (sessionStorage.getItem("mocosn_demo_user")) {
      return;
    }

    if (!firebaseEnabled || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let role = null;
        let requestedRole = "Developer";
        let status = "Pending Approval";

        // Query role directly from Firestore (/admins and /users) - NO local code overrides!
        try {
          const fsData = await checkEmailRoleFromFirestore(currentUser.email, currentUser.uid);
          if (fsData) {
            role = fsData.role !== undefined ? fsData.role : null;
            if (fsData.requestedRole) requestedRole = fsData.requestedRole;
            if (fsData.status) status = fsData.status;
          }
        } catch (e) {
          console.warn("Firestore role lookup error:", e);
        }

        saveRegisteredUser({
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email?.split("@")[0],
          email: currentUser.email,
          role,
          requestedRole,
          status
        });

        setUser({
          ...currentUser,
          role,
          requestedRole,
          status
        });

        // When user logs in, ensure route is /app if on login
        if (window.location.pathname === "/login" || window.location.hash === "#/login") {
          navigateTo("/app");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const handleDemoLogin = (customName, customEmail, customRole) => {
    const safeEmail = (customEmail || "").trim().toLowerCase();
    const resolvedRole = customRole !== undefined ? customRole : null;
    const safeName = customName || (safeEmail.split("@")[0] || "User");
    const demo = {
      uid: `usr-${safeEmail.replace(/[^a-z0-9]/g, "-") || Date.now()}`,
      displayName: safeName,
      email: safeEmail || "user@workspace.local",
      role: resolvedRole,
      requestedRole: "Developer",
      photoURL: ""
    };
    sessionStorage.setItem("mocosn_demo_user", JSON.stringify(demo));
    setUser(demo);
    navigateTo("/app");
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("mocosn_demo_user");
    if (firebaseEnabled && auth) {
      try {
        await logoutUser();
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    setUser(null);
    navigateTo("/");
  };

  const handleUpdateUser = (updatedData) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updatedData };
      if (sessionStorage.getItem("mocosn_demo_user")) {
        sessionStorage.setItem("mocosn_demo_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Real-time Firestore role sync (listens to both /admins and /users collections)
  useEffect(() => {
    if (!firebaseEnabled || !db || !user?.uid) return;

    let unsubAdmins = () => {};
    let unsubUser = () => {};

    try {
      // 1. Listen to /admins collection so changes to administrators update immediately
      unsubAdmins = onSnapshot(
        collection(db, "admins"),
        (snap) => {
          const cleanEmail = (user.email || "").trim().toLowerCase();
          let foundAdminDoc = null;
          snap.forEach((docSnap) => {
            const d = docSnap.data() || {};
            const docId = (docSnap.id || "").trim().toLowerCase();
            const fId = String(d.id || d.uid || "").trim().toLowerCase();
            const fEmail = String(d.email || "").trim().toLowerCase();
            if (
              (user.uid && (docId === user.uid.toLowerCase() || fId === user.uid.toLowerCase())) ||
              (cleanEmail && (docId === cleanEmail || fId === cleanEmail || fEmail === cleanEmail))
            ) {
              foundAdminDoc = d;
            }
          });

          if (foundAdminDoc) {
            const adminRole = foundAdminDoc.role || "Admin";
            if (user.role !== adminRole) {
              saveRegisteredUser({
                id: user.uid,
                name: user.displayName || user.email?.split("@")[0],
                email: user.email,
                role: adminRole,
                status: "Active"
              });
              setUser((prev) => (prev ? { ...prev, role: adminRole, status: "Active" } : prev));
            }
          }
        },
        (err) => {
          console.warn("Firestore /admins snapshot error (check security rules):", err);
        }
      );

      // 2. Listen to /users document for role updates assigned by administrators
      unsubUser = onSnapshot(
        doc(db, "users", user.uid),
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.role !== undefined && data.role !== user.role) {
              // Check if /admins already dictates the role
              const adminMatch = await checkAdminFromFirestore(user.uid, user.email);
              const resolvedRole = adminMatch ? (adminMatch.role || "Admin") : data.role;
              const resolvedStatus = data.status || (resolvedRole ? "Active" : "Pending Approval");

              saveRegisteredUser({
                id: user.uid,
                name: user.displayName || user.email?.split("@")[0],
                email: user.email,
                role: resolvedRole,
                status: resolvedStatus
              });
              setUser((prev) => (prev ? { ...prev, role: resolvedRole, status: resolvedStatus } : prev));
            }
          }
        },
        (err) => {
          console.warn("Firestore /users snapshot error (check security rules):", err);
        }
      );
    } catch (e) {
      console.warn("Firestore snapshot listener setup error:", e);
    }

    return () => {
      unsubAdmins();
      unsubUser();
    };
  }, [user?.uid, user?.email, user?.displayName, user?.role]);

  const handleRefreshStatus = async () => {
    if (!user) return false;
    // 1. Check directly from Firestore (/admins and /users)!
    if (user.email) {
      try {
        const fsData = await checkEmailRoleFromFirestore(user.email, user.uid);
        if (fsData && hasWebsiteAccess(fsData.role)) {
          saveRegisteredUser({
            id: user.uid,
            name: user.displayName || user.email?.split("@")[0],
            email: user.email,
            role: fsData.role,
            status: fsData.status || "Active"
          });
          setUser((prev) => (prev ? { ...prev, role: fsData.role, status: fsData.status || "Active" } : prev));
          handleUpdateUser({ role: fsData.role, status: fsData.status || "Active" });
          return true;
        }
      } catch (e) {
        console.warn("Firestore status check error:", e);
      }
    }

    // 2. Check local directory
    const freshList = getRegisteredUsers();
    const target = freshList.find(
      (u) =>
        u.id === user.uid ||
        (user.email && u.email?.toLowerCase() === user.email.toLowerCase())
    );

    if (target && hasWebsiteAccess(target.role)) {
      setUser((prev) => (prev ? { ...prev, role: target.role, status: target.status || "Active" } : prev));
      handleUpdateUser({ role: target.role, status: target.status || "Active" });
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
          <strong>Loading workspace...</strong>
        </div>
      </div>
    );
  }

  // Unauthenticated routing: "/" shows Landing, "/login" and "/app" show Login
  if (!user) {
    if (currentRoute === "/login" || currentRoute === "/app") {
      return (
        <Login
          onBack={() => navigateTo("/")}
          onDemoLogin={handleDemoLogin}
          onAuthSuccess={(u) => {
            setUser(u);
            navigateTo("/app");
          }}
        />
      );
    }
    return (
      <Landing
        user={null}
        onGetStarted={() => navigateTo("/app")}
        onSignIn={() => navigateTo("/login")}
      />
    );
  }

  // Authenticated user viewing public landing page at "/"
  if (currentRoute === "/") {
    return (
      <Landing
        user={user}
        onGetStarted={() => navigateTo("/app")}
        onSignIn={() => navigateTo("/app")}
      />
    );
  }

  // Check role in directory to verify website access (user.role from Firestore takes top priority!)
  const registeredUsers = getRegisteredUsers();
  const registered = registeredUsers.find(
    (u) =>
      u.id === user.uid ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase())
  );

  const effectiveRole = user.role || registered?.role || null;
  const canAccessWebsite = hasWebsiteAccess(effectiveRole);

  const userWithRole = {
    ...user,
    role: effectiveRole,
    requestedRole: registered?.requestedRole || user.requestedRole || "Developer"
  };

  // ACCESS GATE: If user role is not available, block website access!
  if (!canAccessWebsite) {
    return (
      <PendingAccess
        user={userWithRole}
        onLogout={handleLogout}
        onRefreshStatus={handleRefreshStatus}
        onBackHome={() => navigateTo("/")}
      />
    );
  }

  return (
    <Dashboard
      user={userWithRole}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      onViewLanding={() => navigateTo("/")}
    />
  );
}