import { useState, useEffect } from "react";
import useAuthStore from "../../store/useAuthStore";
import useAppStore from "../../store/useAppStore";
import config from "../../config/config";

// ── Static data (structure; content from API) ─────────────────────────────
const ALL_LEVELS = [
  { level: 1, name: "Novice",   xpRequired: 0,     benefits: ["Basic surveys", "1.0 x points multiplier", "Daily spin wheel"] },
  { level: 2, name: "Explorer", xpRequired: 1000,  benefits: ["Premium surveys", "1.2 x points multiplier", "Weekly bonus mission"] },
  { level: 3, name: "Achiever", xpRequired: 2000,  benefits: ["Exclusive Surveys", "1.5 x points multiplier", "Weekly bonus mission"] },
  { level: 4, name: "Master",   xpRequired: 5000,  benefits: ["VIP Surveys", "1.7 x points multiplier", "Weekly bonus mission"] },
  { level: 5, name: "Legend",   xpRequired: 10000, benefits: ["All Surveys Unlocked", "2.0 x points multiplier", "Weekly bonus mission"] },
];

const VIP_TIERS = [
  { id: "bronze",   name: "Bronze",   range: "0 – 1,000 points earned",    features: ["Faster conversion rate", "2% bonus on rewards", "Standard support"], minPts: 0 },
  { id: "silver",   name: "Silver",   range: "1,001 – 5,000 points earned", features: ["Faster conversion rate", "2% bonus on rewards", "Standard support"], minPts: 1001 },
  { id: "gold",     name: "Gold",     range: "5,001 – 10,000 points earned",features: ["Faster conversion rate", "2% bonus on rewards", "Standard support"], minPts: 5001 },
  { id: "platinum", name: "Platinum", range: "10,001 – 15,000 points earned",features: ["Faster conversion rate", "2% bonus on rewards", "Standard support"], minPts: 10001 },
];

const getVipTier = (pts) => {
  if (pts >= 10001) return "platinum";
  if (pts >= 5001)  return "gold";
  if (pts >= 1001)  return "silver";
  return "bronze";
};

// ── Default level data shown when API is unavailable ─────────────────────
const DEFAULT_LEVEL_DATA = {
  currentLevel: 2,
  levelName: "Explorer",
  currentXP: 500,
  nextLevelXP: 2000,
  nextLevelName: "Achiever",
  benefits: ["Access to premium surveys", "1.0 x points multiplier", "Weekly bonus mission"],
};

// ── Icons ─────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// VIP tier icon and color config
const TIER_CONFIG = {
  bronze:   { emoji: "🏅", bg: "#fef3c7", color: "#d97706" },
  silver:   { emoji: "⭐", bg: "#f3f4f6", color: "#6b7280" },
  gold:     { emoji: "👑", bg: "#fef9c3", color: "#ca8a04" },
  platinum: { emoji: "💎", bg: "#ede9fe", color: "#7c3aed" },
};

// ── Level row icon ─────────────────────────────────────────────────────────
const LevelIcon = ({ isUnlocked, isCurrent }) => {
  if (isCurrent) return <div className="lvl-icon lvl-icon--current"><IconTrendingUp /></div>;
  if (isUnlocked) return <div className="lvl-icon lvl-icon--unlocked"><IconStar /></div>;
  return <div className="lvl-icon lvl-icon--locked"><IconLock /></div>;
};

// ── Main component ────────────────────────────────────────────────────────
const LevelsTab = () => {
  const { authToken } = useAuthStore();
  const { pointBalance } = useAppStore();

  const [levelData, setLevelData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentVipTier = getVipTier(pointBalance ?? 0);

  useEffect(() => {
    const fetchLevel = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${config.API_URL}/user/level`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLevelData(data);
        } else {
          setLevelData(DEFAULT_LEVEL_DATA);
        }
      } catch {
        setLevelData(DEFAULT_LEVEL_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLevel();
  }, [authToken]);

  if (isLoading) {
    return (
      <div className="missions-loading flex">
        <span className="missions-spinner" />
        Loading level data...
      </div>
    );
  }

  const xpPct = levelData
    ? Math.min(100, Math.round((levelData.currentXP / levelData.nextLevelXP) * 100))
    : 0;
  const xpRemaining = (levelData?.nextLevelXP ?? 0) - (levelData?.currentXP ?? 0);

  return (
    <div className="levels-tab">
      <h1 className="mp-title">Levels and Progression</h1>
      <p className="mp-sub">Track your progress and unlock exclusive benefits</p>

      {/* ── Current level + benefits ──────────────────────────────── */}
      <div className="levels-top-row flex">
        {/* Current level card */}
        <div className="levels-current-card">
          <p className="levels-current-label">Current Level</p>
          <h2 className="levels-current-name">
            Level {levelData?.currentLevel} –{" "}
            <span className="levels-current-name-accent">{levelData?.levelName}</span>
          </h2>
          <p className="levels-current-hint">Keep earning XP to reach the next level</p>
          <div className="levels-xp-row flex">
            <span>Progress to level {(levelData?.currentLevel ?? 1) + 1}</span>
            <span className="levels-xp-fraction">
              {(levelData?.currentXP ?? 0).toLocaleString()} / {(levelData?.nextLevelXP ?? 0).toLocaleString()} XP
            </span>
          </div>
          <div className="levels-xp-bar-bg">
            <div className="levels-xp-bar-fill" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="levels-xp-needed">
            {xpRemaining.toLocaleString()} XP needed to unlock {levelData?.nextLevelName}
          </p>
        </div>

        {/* Current benefits card */}
        <div className="levels-benefits-card">
          <div className="levels-benefits-header flex">
            <span className="levels-crown-emoji">👑</span>
            <h3 className="levels-benefits-title">Current Benefits</h3>
          </div>
          <ul className="levels-benefits-list">
            {(levelData?.benefits ?? []).map((b) => (
              <li key={b} className="flex">
                <span className="levels-check"><IconCheck /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── All Levels list ───────────────────────────────────────── */}
      <section className="levels-section">
        <h2 className="levels-section-title">All Levels</h2>
        <div className="levels-list">
          {ALL_LEVELS.map((lvl) => {
            const isCurrent = lvl.level === levelData?.currentLevel;
            const isUnlocked = lvl.level < (levelData?.currentLevel ?? 1);
            return (
              <div
                key={lvl.level}
                className={`levels-item${isCurrent ? " levels-item--current" : ""}${isUnlocked ? " levels-item--unlocked" : ""}`}
              >
                <LevelIcon isUnlocked={isUnlocked} isCurrent={isCurrent} />
                <div className="levels-item-body flex-1">
                  <div className="levels-item-name-row flex">
                    <h3 className="levels-item-name">Level {lvl.level} – {lvl.name}</h3>
                    {isCurrent && <span className="levels-badge levels-badge--current">Current Level</span>}
                    {isUnlocked && <span className="levels-badge levels-badge--unlocked">Unlocked</span>}
                  </div>
                  <p className="levels-item-xp">
                    Unlocked at {lvl.xpRequired.toLocaleString()} xp
                  </p>
                  <div className="levels-item-benefits flex">
                    {lvl.benefits.map((b) => (
                      <span key={b} className="flex levels-benefit-chip">
                        <span className="levels-check-sm"><IconCheck /></span>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── VIP Tier System ───────────────────────────────────────── */}
      <section className="levels-section levels-section--last">
        <h2 className="levels-section-title">VIP Tier System</h2>
        <div className="vip-tiers-grid">
          {VIP_TIERS.map((tier) => {
            const cfg = TIER_CONFIG[tier.id];
            const isCurrent = currentVipTier === tier.id;
            return (
              <div
                key={tier.id}
                className={`vip-card vip-card--${tier.id}${isCurrent ? " vip-card--active" : ""}`}
              >
                <div
                  className="vip-icon"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <span>{cfg.emoji}</span>
                </div>
                <h3 className="vip-name">{tier.name}</h3>
                <p className="vip-range">{tier.range}</p>
                <ul className="vip-features">
                  {tier.features.map((f) => (
                    <li key={f} className="flex">
                      <span className="levels-check-sm"><IconCheck /></span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LevelsTab;
