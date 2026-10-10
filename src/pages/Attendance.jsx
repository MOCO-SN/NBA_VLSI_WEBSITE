import { useState, useMemo, useEffect } from "react";
import {
  CalendarCheck,
  LogIn,
  LogOut,
  Users,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { getRegisteredUsers } from "../utils/userDirectory";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const ATT_KEY = "mocosn_attendance";
const CHECKIN_KEY = "mocosn_checkins";

function loadAttendance() {
  try { return JSON.parse(localStorage.getItem(ATT_KEY) || "{}"); } catch { return {}; }
}
function saveAttendance(data) {
  localStorage.setItem(ATT_KEY, JSON.stringify(data));
}
function loadCheckins() {
  try { return JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]"); } catch { return []; }
}
function saveCheckins(data) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(data));
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function toDateStr(d) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// ─── Mini Calendar ────────────────────────────────────────────────────────────
function AttCalendar({ year, month, records }) {
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);
  const todayStr = toDateStr(new Date());

  const cells = [];
  // blank leading cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="attendance-calendar">
      {["Su","Mo","Tu","We","Th","Fr","Sa"].map(l => (
        <div key={l} className="cal-day-label">{l}</div>
      ))}
      {cells.map((d, i) => {
        if (!d) return <div key={`e${i}`} className="cal-day empty" />;
        const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const status = records[dateStr];
        const isToday = dateStr === todayStr;
        return (
          <div
            key={d}
            className={`cal-day ${status === "present" ? "present" : status === "absent" ? "absent" : ""} ${isToday ? "today" : ""}`}
            title={status ? `${dateStr}: ${status}` : dateStr}
          >
            {d}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Attendance({ user }) {
  const isAdmin = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState(isAdmin ? "admin" : "my");

  // Attendance records: { [userId]: { [dateStr]: "present" | "absent" } }
  const [attendance, setAttendance] = useState(loadAttendance);
  // Check-in/out records: [{ id, userId, name, type:"in"|"out", time }]
  const [checkins, setCheckins] = useState(loadCheckins);

  // My own records
  const myRecords = attendance[user?.uid] || {};

  // Calendar navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Today's status for current user
  const todayStr = toDateStr(today);
  const todayStatus = myRecords[todayStr];

  // Active check-in session (last "in" without a following "out" today)
  const todayCheckins = checkins.filter(
    c => c.userId === user?.uid && c.time?.startsWith(todayStr)
  );
  const lastToday = todayCheckins[todayCheckins.length - 1];
  const isCheckedIn = lastToday?.type === "in";

  // ── Mark Attendance ──────────────────────────────────────────────────────
  function markAttendance(status) {
    const updated = {
      ...attendance,
      [user.uid]: { ...(attendance[user.uid] || {}), [todayStr]: status }
    };
    setAttendance(updated);
    saveAttendance(updated);
  }

  // ── Check In / Out ───────────────────────────────────────────────────────
  function handleCheckIn() {
    const record = {
      id: Date.now(),
      userId: user.uid,
      name: user.displayName || user.email,
      type: "in",
      time: new Date().toISOString()
    };
    const updated = [...checkins, record];
    setCheckins(updated);
    saveCheckins(updated);
    // auto-mark present on check-in
    if (!myRecords[todayStr]) markAttendance("present");
  }

  function handleCheckOut() {
    const record = {
      id: Date.now(),
      userId: user.uid,
      name: user.displayName || user.email,
      type: "out",
      time: new Date().toISOString()
    };
    const updated = [...checkins, record];
    setCheckins(updated);
    saveCheckins(updated);
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const myStats = useMemo(() => {
    const all = Object.values(myRecords);
    const present = all.filter(s => s === "present").length;
    const absent  = all.filter(s => s === "absent").length;
    const pct = all.length ? Math.round((present / all.length) * 100) : 0;
    return { present, absent, total: all.length, pct };
  }, [myRecords]);

  // ── Admin: all users ─────────────────────────────────────────────────────
  const allUsers = useMemo(() => {
    if (!isAdmin) return [];
    return getRegisteredUsers().filter(u => u.role);
  }, [isAdmin]);

  function getUserStats(uid) {
    const rec = attendance[uid] || {};
    const all = Object.values(rec);
    const present = all.filter(s => s === "present").length;
    const absent  = all.filter(s => s === "absent").length;
    const pct = all.length ? Math.round((present / all.length) * 100) : 0;
    return { present, absent, total: all.length, pct };
  }

  // Admin: mark attendance for a member
  function adminMark(uid, status) {
    const updated = {
      ...attendance,
      [uid]: { ...(attendance[uid] || {}), [todayStr]: status }
    };
    setAttendance(updated);
    saveAttendance(updated);
  }

  // ── Today's check-in history (all users, admin) ──────────────────────────
  const todayAllCheckins = checkins
    .filter(c => c.time?.startsWith(todayStr))
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  function fmtTime(iso) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // ── Month navigation ─────────────────────────────────────────────────────
  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">TEAM MANAGEMENT</div>
          <h1>Attendance</h1>
          <p>Track daily attendance, check-in/out sessions, and view team reports.</p>
        </div>

        {/* Tabs */}
        <div className="att-tabs">
          <button className={`att-tab ${activeTab === "my" ? "active" : ""}`} onClick={() => setActiveTab("my")}>
            My Attendance
          </button>
          {isAdmin && (
            <button className={`att-tab ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
              Team Report
            </button>
          )}
        </div>
      </div>

      {/* ─── MY ATTENDANCE TAB ─── */}
      {activeTab === "my" && (
        <>
          {/* Stats strip */}
          <div className="att-stat-strip">
            <div className="att-stat-box">
              <span>PRESENT DAYS</span>
              <strong style={{ color: "#0078a8" }}>{myStats.present}</strong>
            </div>
            <div className="att-stat-box">
              <span>ABSENT DAYS</span>
              <strong style={{ color: "#a03030" }}>{myStats.absent}</strong>
            </div>
            <div className="att-stat-box">
              <span>ATTENDANCE %</span>
              <strong style={{ color: myStats.pct >= 75 ? "#0078a8" : "#a03030" }}>
                {myStats.pct}%
              </strong>
            </div>
            <div className="att-stat-box">
              <span>STATUS TODAY</span>
              <strong style={{ fontSize: "14px", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                {todayStatus === "present" ? (
                  <><CheckCircle2 size={18} color="#0078a8" /> Present</>
                ) : todayStatus === "absent" ? (
                  <><XCircle size={18} color="#a03030" /> Absent</>
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: "11px" }}>Not marked</span>
                )}
              </strong>
            </div>
          </div>

          <div className="projects-split attendance-split">
            {/* Left: Calendar + Mark Attendance */}
            <div className="panel">
              <div className="panel-title">
                <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CalendarCheck size={17} /> Attendance Calendar
                </h2>
                <div className="month-nav">
                  <button className="month-nav-btn" onClick={prevMonth}>‹</button>
                  <strong>{MONTH_NAMES[calMonth]} {calYear}</strong>
                  <button className="month-nav-btn" onClick={nextMonth}>›</button>
                </div>
              </div>

              <AttCalendar year={calYear} month={calMonth} records={myRecords} />

              {/* Mark today */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "8px" }}>
                <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "12px" }}>
                  Mark your attendance for today · <strong style={{ color: "var(--text)" }}>{todayStr}</strong>
                </p>
                <div className="mark-btn-group">
                  <button
                    className={`mark-btn present-btn ${todayStatus === "present" ? "active" : ""}`}
                    onClick={() => markAttendance("present")}
                  >
                    <CheckCircle2 size={15} /> Present
                  </button>
                  <button
                    className={`mark-btn absent-btn ${todayStatus === "absent" ? "active" : ""}`}
                    onClick={() => markAttendance("absent")}
                  >
                    <XCircle size={15} /> Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Check-in / Check-out */}
            <div className="panel">
              <div className="panel-title">
                <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={17} /> Check-In / Out
                </h2>
                <span style={{
                  fontSize: "10px", padding: "3px 9px", borderRadius: "20px",
                  background: isCheckedIn ? "#d0f0ff" : "var(--soft)",
                  color: isCheckedIn ? "#0078a8" : "var(--muted)",
                  fontWeight: "700"
                }}>
                  {isCheckedIn ? "● Checked In" : "○ Not Checked In"}
                </span>
              </div>

              <div style={{ padding: "16px 0" }}>
                <div className="checkin-btn-row" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <button
                    className="primary-button"
                    style={{ flex: 1, background: isCheckedIn ? "var(--muted)" : "#0078a8" }}
                    onClick={handleCheckIn}
                    disabled={isCheckedIn}
                  >
                    <LogIn size={16} /> Check In
                  </button>
                  <button
                    className="primary-button"
                    style={{ flex: 1, background: !isCheckedIn ? "var(--muted)" : "#1a5a88" }}
                    onClick={handleCheckOut}
                    disabled={!isCheckedIn}
                  >
                    <LogOut size={16} /> Check Out
                  </button>
                </div>

                <p style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "10px", fontWeight: "700", letterSpacing: "0.5px" }}>
                  TODAY'S SESSION LOG
                </p>
                {todayCheckins.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)" }}>
                    <Clock size={28} style={{ marginBottom: "8px" }} />
                    <p style={{ fontSize: "11px" }}>No check-ins recorded today.</p>
                  </div>
                ) : (
                  <div>
                    {[...todayCheckins].reverse().map(c => (
                      <div key={c.id} className="checkin-row">
                        <span className={`checkin-badge ${c.type}`}>
                          {c.type === "in" ? "CHECK IN" : "CHECK OUT"}
                        </span>
                        <span style={{ color: "var(--text)", fontWeight: "500" }}>{fmtTime(c.time)}</span>
                        <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--muted)" }}>
                          {new Date(c.time).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── ADMIN TEAM REPORT TAB ─── */}
      {activeTab === "admin" && isAdmin && (
        <>
          {/* Today's live check-ins */}
          <div className="panel" style={{ marginBottom: "16px" }}>
            <div className="panel-title">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={17} /> Live Check-Ins Today — {todayStr}
              </h2>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{todayAllCheckins.length} events</span>
            </div>
            {todayAllCheckins.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--muted)" }}>
                <Clock size={28} style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "11px" }}>No check-in events recorded today.</p>
              </div>
            ) : (
              todayAllCheckins.map(c => (
                <div key={c.id} className="checkin-row">
                  <span className={`checkin-badge ${c.type}`}>{c.type === "in" ? "CHECK IN" : "CHECK OUT"}</span>
                  <strong style={{ fontSize: "12px" }}>{c.name}</strong>
                  <span style={{ marginLeft: "auto", fontSize: "10px", color: "var(--muted)" }}>{fmtTime(c.time)}</span>
                </div>
              ))
            )}
          </div>

          {/* Team Attendance Table */}
          <div className="panel">
            <div className="panel-title">
              <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={17} /> Team Attendance Overview
              </h2>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>{allUsers.length} members</span>
            </div>

            <div className="att-table-wrap" style={{ marginTop: "12px" }}>
              <table className="att-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>TODAY STATUS</th>
                    <th>PRESENT DAYS</th>
                    <th>ABSENT DAYS</th>
                    <th>ATTENDANCE %</th>
                    <th>MARK TODAY</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => {
                    const stats = getUserStats(u.id);
                    const rec = attendance[u.id] || {};
                    const todayRec = rec[todayStr];
                    const initials = (u.name || "U").split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase();

                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="avatar small" style={{ width: "32px", height: "32px" }}>{initials}</div>
                            <div>
                              <strong style={{ display: "block", fontSize: "12px" }}>{u.name}</strong>
                              <span style={{ fontSize: "10px", color: "var(--muted)" }}>{u.role}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {todayRec === "present" ? (
                            <span style={{ color: "#0078a8", fontWeight: "700", fontSize: "11px" }}>✓ Present</span>
                          ) : todayRec === "absent" ? (
                            <span style={{ color: "#a03030", fontWeight: "700", fontSize: "11px" }}>✗ Absent</span>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: "11px" }}>— Not marked</span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: "700", color: "#0078a8", fontFamily: "DM Mono" }}>{stats.present}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: "700", color: stats.absent > 0 ? "#a03030" : "var(--muted)", fontFamily: "DM Mono" }}>{stats.absent}</span>
                        </td>
                        <td>
                          <div className="att-pct-bar">
                            <div className="att-pct-track">
                              <div className="att-pct-fill" style={{ width: `${stats.pct}%` }} />
                            </div>
                            <span style={{
                              fontSize: "11px", fontWeight: "700",
                              color: stats.pct >= 75 ? "#0078a8" : stats.pct > 0 ? "#a03030" : "var(--muted)"
                            }}>{stats.pct}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="mark-btn-group">
                            <button
                              className={`mark-btn present-btn ${todayRec === "present" ? "active" : ""}`}
                              style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                              onClick={() => adminMark(u.id, "present")}
                            >
                              <CheckCircle2 size={13} /> P
                            </button>
                            <button
                              className={`mark-btn absent-btn ${todayRec === "absent" ? "active" : ""}`}
                              style={{ height: "30px", padding: "0 10px", fontSize: "11px" }}
                              onClick={() => adminMark(u.id, "absent")}
                            >
                              <XCircle size={13} /> A
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {allUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
                        No team members found with assigned roles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
