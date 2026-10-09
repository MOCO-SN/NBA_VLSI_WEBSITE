import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db, firebaseEnabled } from "../firebase";
import { logActivity } from "./activityLogger";

const USERS_STORAGE_KEY = "mocosn_registered_users";

export const AVAILABLE_ROLES = [
  "Admin",
  "Robotics Lead",
  "Hardware Engineer",
  "Developer",
  "Researcher",
  "Viewer"
];

export function hasWebsiteAccess(role) {
  if (!role) return false;
  const trimmed = String(role).trim().toLowerCase();
  if (
    trimmed === "" ||
    trimmed === "none" ||
    trimmed === "pending" ||
    trimmed === "pending approval" ||
    trimmed === "unassigned" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }
  return true;
}

/**
 * Check if a user is defined in the Firestore `/admins` collection.
 * The /admins collection contains documents with their id and role.
 */
export async function checkAdminFromFirestore(uid = null, email = null) {
  if (!firebaseEnabled || !db) return null;
  const cleanEmail = (email || "").trim().toLowerCase();

  try {
    // 1. Direct doc lookup by UID
    if (uid) {
      try {
        const snapUid = await getDoc(doc(db, "admins", uid));
        if (snapUid.exists()) {
          const d = snapUid.data() || {};
          return {
            id: d.id || uid,
            role: d.role || "Admin",
            status: "Active",
            requestedRole: d.role || "Admin",
            inAdminCollection: true
          };
        }
      } catch {}
    }

    // 2. Direct doc lookup by Email
    if (cleanEmail) {
      try {
        const snapEmail = await getDoc(doc(db, "admins", cleanEmail));
        if (snapEmail.exists()) {
          const d = snapEmail.data() || {};
          return {
            id: d.id || cleanEmail,
            role: d.role || "Admin",
            status: d.status || "Active",
            requestedRole: d.role || "Admin",
            inAdminCollection: true
          };
        }
      } catch {}

      // Direct query by email field
      try {
        const qEmail = query(collection(db, "admins"), where("email", "==", cleanEmail));
        const qEmailSnap = await getDocs(qEmail);
        if (!qEmailSnap.empty) {
          const d = qEmailSnap.docs[0].data() || {};
          return {
            id: d.id || qEmailSnap.docs[0].id,
            role: d.role || "Admin",
            status: d.status || "Active",
            requestedRole: d.role || "Admin",
            inAdminCollection: true
          };
        }
      } catch (e) {
        console.warn("Direct query where email == cleanEmail failed:", e);
      }
    }

    // 3. Scan documents in `/admins` collection (contains id/email and their role)
    try {
      const adminCol = collection(db, "admins");
      const adminSnap = await getDocs(adminCol);
      if (!adminSnap.empty) {
        for (const docSnap of adminSnap.docs) {
          const d = docSnap.data() || {};
          const docId = (docSnap.id || "").trim().toLowerCase();
          const fieldId = String(d.id || d.uid || "").trim().toLowerCase();
          const fieldEmail = String(d.email || "").trim().toLowerCase();
          const cleanEmailLower = cleanEmail ? cleanEmail.trim().toLowerCase() : "";

          const matchUid = uid && (docId === String(uid).trim().toLowerCase() || fieldId === String(uid).trim().toLowerCase());
          const matchEmail = cleanEmailLower && (
            docId === cleanEmailLower ||
            fieldId === cleanEmailLower ||
            fieldEmail === cleanEmailLower
          );

          if (matchUid || matchEmail) {
            return {
              id: d.id || docSnap.id,
              role: d.role || "Admin",
              status: d.status || "Active",
              requestedRole: d.role || "Admin",
              inAdminCollection: true
            };
          }
        }
      }
    } catch (e) {
      console.warn("Error querying /admins collection:", e);
    }
  } catch (err) {
    console.warn("Could not check /admins from Firestore:", err);
  }
  return null;
}

/**
 * Check a user's role directly from Firestore:
 * 1. First checks Firestore collection `/admins` (contains id and their role).
 * 2. Next checks Firestore collection `/users`.
 * 3. If not found or role unassigned, role defaults to null.
 * NO role is hardcoded in local code!
 */
export async function checkEmailRoleFromFirestore(email, uid = null) {
  if (!firebaseEnabled || !db) return null;
  const cleanEmail = (email || "").trim().toLowerCase();

  // 1. First check the `/admins` collection in Firestore!
  const adminMatch = await checkAdminFromFirestore(uid, cleanEmail);
  if (adminMatch) {
    return adminMatch;
  }

  // 2. Next check the `/users` collection in Firestore
  try {
    // Check doc by uid
    if (uid) {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data) {
          return {
            role: data.role !== undefined ? data.role : null,
            status: data.status || (data.role ? "Active" : "Pending Approval"),
            requestedRole: data.requestedRole || "Developer",
            inAdminCollection: false
          };
        }
      }
    }

    // Query collection by email
    if (cleanEmail) {
      const q = query(collection(db, "users"), where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return {
          role: data.role !== undefined ? data.role : null,
          status: data.status || (data.role ? "Active" : "Pending Approval"),
          requestedRole: data.requestedRole || "Developer",
          inAdminCollection: false
        };
      }
    }
  } catch (err) {
    console.warn("Could not check role from Firestore /users:", err);
  }

  return null;
}

/**
 * Fetch registered users live from Firestore /users and /admins.
 */
export async function fetchUsersFromFirestore() {
  if (!firebaseEnabled || !db) return getRegisteredUsers();
  try {
    // Get all admins from /admins collection
    const adminDocs = await getDocs(collection(db, "admins"));
    const adminMap = new Map();
    adminDocs.forEach((d) => {
      const data = d.data() || {};
      const idKey = (data.id || d.id || "").toLowerCase();
      const emailKey = (data.email || "").toLowerCase();
      if (idKey) adminMap.set(idKey, data.role || "Admin");
      if (emailKey) adminMap.set(emailKey, data.role || "Admin");
    });

    // Get all users from /users collection
    const userDocs = await getDocs(collection(db, "users"));
    const list = [];
    userDocs.forEach((d) => {
      const data = d.data() || {};
      const uidKey = (d.id || data.id || "").toLowerCase();
      const emailKey = (data.email || "").toLowerCase();
      // If present in /admins collection, that role takes priority
      const roleFromAdminCol = adminMap.get(uidKey) || adminMap.get(emailKey);
      const role = roleFromAdminCol || data.role || null;

      list.push({
        id: d.id,
        name: data.name || data.displayName || data.email?.split("@")[0] || "User",
        email: data.email,
        role,
        requestedRole: data.requestedRole || "Developer",
        status: data.status || (role ? "Active" : "Pending Approval"),
        joinedDate: data.joinedDate || "2026",
        lastActive: data.lastActive || "Recently",
        avatar: data.avatar || ""
      });
    });

    if (list.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn("Could not fetch users from Firestore:", err);
  }
  return getRegisteredUsers();
}

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Purge any legacy dummy placeholder users or mock accounts
      const cleaned = parsed.filter(
        (u) =>
          !["usr-02", "usr-03", "usr-04", "usr-05", "usr-06", "usr-admin-01"].includes(u.id) &&
          !u.email?.includes("@example.com")
      );

      if (cleaned.length !== parsed.length) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch (err) {
    console.warn("Could not read users from storage:", err);
  }
  return [];
}

export function saveRegisteredUser(user) {
  const currentUsers = getRegisteredUsers();
  const existingIdx = currentUsers.findIndex(
    (u) =>
      (user.id && u.id === user.id) ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase())
  );

  const resolvedRole = user.role !== undefined ? user.role : null;
  const resolvedStatus = user.status || (resolvedRole ? "Active" : "Pending Approval");

  let updatedList;
  if (existingIdx >= 0) {
    updatedList = [...currentUsers];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      ...user,
      role: resolvedRole,
      status: resolvedStatus,
      lastActive: "Just now"
    };
  } else {
    const newUser = {
      id: user.id || `usr-${user.email?.replace(/[^a-z0-9]/g, "-") || Date.now()}`,
      name: user.name || user.displayName || user.email?.split("@")[0] || "User",
      email: user.email,
      role: resolvedRole,
      requestedRole: user.requestedRole || "Developer",
      status: resolvedStatus,
      joinedDate: new Date().toISOString().split("T")[0],
      lastActive: "Just now",
      avatar: user.photoURL || user.avatar || ""
    };
    updatedList = [newUser, ...currentUsers];
  }

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to Firestore if enabled
  if (firebaseEnabled && db) {
    const docId = user.id || `usr-${user.email?.replace(/[^a-z0-9]/g, "-") || Date.now()}`;
    setDoc(
      doc(db, "users", docId),
      {
        id: docId,
        name: user.name || user.displayName || user.email?.split("@")[0] || "User",
        email: user.email?.toLowerCase(),
        role: resolvedRole,
        requestedRole: user.requestedRole || "Developer",
        status: resolvedStatus,
        lastActive: new Date().toISOString()
      },
      { merge: true }
    ).catch((err) => {
      console.warn("Firestore user sync error:", err);
    });
  }

  return updatedList;
}

/**
 * Assign or update a user's role.
 * Only Admins can invoke this function!
 */
export async function assignUserRole({ userId, newRole, adminUser }) {
  if (!adminUser || adminUser.role !== "Admin") {
    throw new Error("Unauthorized: Only an Administrator can assign user roles.");
  }

  const currentUsers = getRegisteredUsers();
  const targetUser = currentUsers.find((u) => u.id === userId);

  if (!targetUser) {
    throw new Error("User not found.");
  }

  const previousRole = targetUser.role || "No Role Assigned";
  const updatedUser = {
    ...targetUser,
    role: newRole,
    status: "Active"
  };

  const updatedList = currentUsers.map((u) => (u.id === userId ? updatedUser : u));
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedList));

  // Update in Firestore if enabled
  if (firebaseEnabled && db) {
    try {
      if (userId) {
        await setDoc(doc(db, "users", userId), { role: newRole, status: "Active" }, { merge: true });
      }
      if (targetUser.email) {
        const q = query(collection(db, "users"), where("email", "==", targetUser.email.toLowerCase()));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await setDoc(doc(db, "users", d.id), { role: newRole, status: "Active" }, { merge: true });
        });
      }

      // Sync `/admins` collection in Firestore!
      if (newRole === "Admin") {
        const adminDocId = userId || targetUser.email?.toLowerCase();
        await setDoc(
          doc(db, "admins", adminDocId),
          {
            id: userId,
            email: targetUser.email?.toLowerCase() || "",
            role: "Admin",
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else if (previousRole === "Admin") {
        // If demoted from Admin, remove from /admins collection
        try {
          if (userId) await deleteDoc(doc(db, "admins", userId));
        } catch {}
        if (targetUser.email) {
          try {
            await deleteDoc(doc(db, "admins", targetUser.email.toLowerCase()));
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Firestore role update error:", err);
    }
  }

  // Log activity
  await logActivity({
    category: "ROLE",
    event: "User Role Reassigned",
    details: `${adminUser.displayName || "Admin"} assigned role '${newRole}' to ${targetUser.name} (previously: ${previousRole}).`,
    actor: adminUser.displayName || "Admin",
    role: "Admin"
  });

  return updatedList;
}

export async function toggleUserStatus({ userId, adminUser }) {
  if (!adminUser || adminUser.role !== "Admin") {
    throw new Error("Unauthorized: Only an Administrator can change user status.");
  }

  const currentUsers = getRegisteredUsers();
  const targetUser = currentUsers.find((u) => u.id === userId);
  if (!targetUser) return currentUsers;

  const nextStatus = targetUser.status === "Active" ? "Suspended" : "Active";
  const updated = currentUsers.map((u) =>
    u.id === userId ? { ...u, status: nextStatus } : u
  );
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));

  await logActivity({
    category: "USER",
    event: "User Status Changed",
    details: `${adminUser.displayName || "Admin"} set status of ${targetUser.name} to ${nextStatus}.`,
    actor: adminUser.displayName || "Admin",
    role: "Admin"
  });

  return updated;
}

export async function removeUserFromDirectory({ userId, adminUser }) {
  if (!adminUser || adminUser.role !== "Admin") {
    throw new Error("Unauthorized: Only an Administrator can remove users.");
  }

  const currentUsers = getRegisteredUsers();
  const targetUser = currentUsers.find((u) => u.id === userId);
  const updated = currentUsers.filter((u) => u.id !== userId);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));

  if (firebaseEnabled && db && userId) {
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch {}
    try {
      await deleteDoc(doc(db, "admins", userId));
    } catch {}
    if (targetUser?.email) {
      try {
        await deleteDoc(doc(db, "admins", targetUser.email.toLowerCase()));
      } catch {}
    }
  }

  if (targetUser) {
    await logActivity({
      category: "USER",
      event: "User Deleted",
      details: `${adminUser.displayName || "Admin"} removed user ${targetUser.name} (${targetUser.email}) from the workspace.`,
      actor: adminUser.displayName || "Admin",
      role: "Admin"
    });
  }

  return updated;
}
