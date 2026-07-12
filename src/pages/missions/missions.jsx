import { useState } from "react";
import MissionsTab from "./MissionsTab";
import LevelsTab from "./LevelsTab";
import "./missions.css";

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconTrending = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Missions = () => {
  const [activeTab, setActiveTab] = useState("missions");

  return (
    <div className="missions-page">
      {/* ── Top-level tab navigation ──────────────────────────────── */}
      <div className="missions-top-nav-bar">
        <nav className="missions-top-nav missions-body flex">
          <button
            className={`missions-top-tab${activeTab === "missions" ? " mtt--active" : ""}`}
            onClick={() => setActiveTab("missions")}
          >
            <IconTarget />
            Missions
          </button>
          <button
            className={`missions-top-tab${activeTab === "levels" ? " mtt--active" : ""}`}
            onClick={() => setActiveTab("levels")}
          >
            <IconTrending />
            Levels
          </button>
        </nav>
      </div>

      {/* ── Tab content ───────────────────────────────────────────── */}
      <div className="missions-body">
        {activeTab === "missions" ? <MissionsTab /> : <LevelsTab />}
      </div>
    </div>
  );
};

export default Missions;
