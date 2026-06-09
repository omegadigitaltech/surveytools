import { useState, useEffect } from "react";
import useAuthStore from "../../store/useAuthStore";
import config from "../../config/config";

// ── Placeholder data (replaced once API endpoints exist) ──────────────────
const DAILY_FALLBACK = [
  { _id: "d1", title: "Complete 3 Surveys", description: "Finish any 3 surveys to earn bonus points", reward: 150, current: 2, target: 3 },
  { _id: "d2", title: "Login 5 days in a row", description: "Maintain your daily streak", reward: 200, current: 5, target: 5 },
  { _id: "d3", title: "Refer a friend", description: "Invite 1 friend to SurveyTools", reward: 500, current: 0, target: 1 },
  { _id: "d4", title: "Earn 500 Points", description: "Collect 500 Points today", reward: 200, current: 350, target: 500 },
];

const WEEKLY_FALLBACK = [
  { _id: "w1", title: "Complete 10 Surveys", description: "Finish any 10 surveys this week", reward: 500, current: 4, target: 10 },
  { _id: "w2", title: "Earn 2000 Points", description: "Collect 2000 points this week", reward: 300, current: 800, target: 2000 },
  { _id: "w3", title: "Share 3 Surveys", description: "Share 3 surveys with friends", reward: 200, current: 1, target: 3 },
  { _id: "w4", title: "No-skip Survey", description: "Complete a survey without skipping any question", reward: 250, current: 0, target: 1 },
];

// ── Icons ─────────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconSparkle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconCoin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M9.5 9.5h4a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3h4.5" />
  </svg>
);

// ── Mission card ──────────────────────────────────────────────────────────
const MissionCard = ({ mission }) => {
  const pct = Math.min(100, Math.round((mission.current / mission.target) * 100));
  const isComplete = mission.current >= mission.target;

  return (
    <div className={`mc${isComplete ? " mc--complete" : ""}`}>
      <div className="mc-top flex">
        <h3 className="mc-title">{mission.title}</h3>
        <span className="mc-reward flex">
          <IconCoin />
          <span>+ {mission.reward}</span>
        </span>
      </div>
      <p className="mc-desc">{mission.description}</p>
      <div className="mc-progress-row flex">
        <span className="mc-progress-label">Progress</span>
        <span className="mc-progress-val">{mission.current}/{mission.target}</span>
      </div>
      <div className="mc-bar-bg">
        <div
          className={`mc-bar-fill${isComplete ? " mc-bar--complete" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const MissionsTab = () => {
  const { authToken } = useAuthStore();

  const [subTab, setSubTab] = useState("daily");
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyMissions, setWeeklyMissions] = useState([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState(true);
  const [isLoadingWeekly, setIsLoadingWeekly] = useState(false);
  const [dailyBonus, setDailyBonus] = useState(500);
  const [weeklyBonus, setWeeklyBonus] = useState(1000);
  const [weeklyFetched, setWeeklyFetched] = useState(false);

  // Fetch daily missions on mount
  useEffect(() => {
    const fetchDaily = async () => {
      setIsLoadingDaily(true);
      try {
        const res = await fetch(`${config.API_URL}/user/missions/daily`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDailyMissions(data.missions ?? DAILY_FALLBACK);
          if (data.bonusPoints) setDailyBonus(data.bonusPoints);
        } else {
          setDailyMissions(DAILY_FALLBACK);
        }
      } catch {
        setDailyMissions(DAILY_FALLBACK);
      } finally {
        setIsLoadingDaily(false);
      }
    };
    fetchDaily();
  }, [authToken]);

  // Lazy-fetch weekly when tab first opened
  const handleWeeklyTab = async () => {
    setSubTab("weekly");
    if (weeklyFetched) return;
    setWeeklyFetched(true);
    setIsLoadingWeekly(true);
    try {
      const res = await fetch(`${config.API_URL}/user/missions/weekly`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWeeklyMissions(data.missions ?? WEEKLY_FALLBACK);
        if (data.bonusPoints) setWeeklyBonus(data.bonusPoints);
      } else {
        setWeeklyMissions(WEEKLY_FALLBACK);
      }
    } catch {
      setWeeklyMissions(WEEKLY_FALLBACK);
    } finally {
      setIsLoadingWeekly(false);
    }
  };

  const isDaily = subTab === "daily";
  const missions = isDaily ? dailyMissions : weeklyMissions;
  const isLoading = isDaily ? isLoadingDaily : isLoadingWeekly;
  const bonusPoints = isDaily ? dailyBonus : weeklyBonus;
  const completedCount = missions.filter((m) => m.current >= m.target).length;
  const totalCount = missions.length;
  const dailyCount = dailyMissions.length || 4;
  const weeklyCount = weeklyMissions.length || 4;

  return (
    <div className="missions-tab">
      <h1 className="mp-title">Missions and Challenges</h1>
      <p className="mp-sub">Complete missions to earn bonus points and rewards</p>

      {/* ── Sub-tabs ──────────────────────────────────────────────── */}
      <div className="missions-subtabs flex">
        <button
          className={`missions-subtab${isDaily ? " msub--active" : ""}`}
          onClick={() => setSubTab("daily")}
        >
          <IconClock />
          Daily Missions
          <span className="missions-subtab-count">{dailyCount}</span>
        </button>
        <button
          className={`missions-subtab${!isDaily ? " msub--active" : ""}`}
          onClick={handleWeeklyTab}
        >
          <IconSparkle />
          Weekly Challenge
          <span className="missions-subtab-count">{weeklyCount}</span>
        </button>
      </div>

      {/* ── Mission cards grid ────────────────────────────────────── */}
      {isLoading ? (
        <div className="missions-loading flex">
          <span className="missions-spinner" />
          Loading missions...
        </div>
      ) : (
        <div className="missions-grid">
          {missions.map((m) => (
            <MissionCard key={m._id ?? m.id} mission={m} />
          ))}
        </div>
      )}

      {/* ── Completion banner ─────────────────────────────────────── */}
      {!isLoading && missions.length > 0 && (
        <div className="missions-banner">
          <div className="missions-banner-left">
            <h3 className="missions-banner-title">
              Complete all {isDaily ? "Daily" : "Weekly"} Missions
            </h3>
            <p className="missions-banner-desc">
              Earn a bonus of{" "}
              <span className="missions-banner-pts">{bonusPoints} points</span>{" "}
              when you complete all {isDaily ? "daily" : "weekly"} missions!
            </p>
          </div>
          <div className="missions-banner-counter">
            <span className="missions-banner-num">{completedCount}</span>
            <span className="missions-banner-denom">of {totalCount}</span>
            <span className="missions-banner-label">complete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsTab;
