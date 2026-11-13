import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import useAppStore from "../../store/useAppStore";
import * as api from "./rewardsApi";
import "./rewards.css";

// Best-effort display name for a user-like object
const displayName = (u) => {
  if (!u) return "";
  const nested = u.user || u.userId || u.referredUser || u.referee || null;
  const src = nested && typeof nested === "object" ? { ...nested, ...u } : u;
  return (
    src.name ||
    src.fullName ||
    [src.firstName, src.lastName].filter(Boolean).join(" ") ||
    src.username ||
    src.email ||
    ""
  );
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "");

// Re-sync the shared point balance from GET /user/points (silent on failure)
const refreshPointBalance = async (token, setPointBalance) => {
  try {
    const value = await api.getPoints(token);
    if (typeof value === "number") setPointBalance(value);
  } catch {
    /* keep whatever balance the store already has */
  }
};

// ── shared loading / error states ──────────────────────────────────────────────
const LoadingState = ({ label }) => (
  <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
    <span className="material-icons animate-spin text-3xl">refresh</span>
    <span>{label}</span>
  </div>
);

// `error` is the ApiError from rewardsApi; its server message is shown as detail
const LoadError = ({ message, error, onRetry }) => (
  <div className="col-span-full py-12 px-4 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
    <span className="material-icons text-4xl mb-2 text-red-400 block">
      error_outline
    </span>
    <p className="font-semibold text-base">{message}</p>
    <p className="text-sm mt-1">
      {error?.status
        ? `${error.message} (${error.status})`
        : "Please check your connection and try again."}
    </p>
    <button
      onClick={onRetry}
      className="mt-4 px-5 py-2 bg-[#00A5B5] hover:bg-[#008F9C] text-white rounded-lg text-sm font-bold transition-colors"
    >
      Try again
    </button>
  </div>
);

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="col-span-full py-12 px-4 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
    <span className="material-icons text-4xl mb-2 opacity-50 block">{icon}</span>
    <p className="font-semibold text-base sm:text-lg">{title}</p>
    {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
  </div>
);

// ── Root page ──────────────────────────────────────────────────────────────────
const Rewards = () => {
  const [activeTab, setActiveTab] = useState("missions");
  const { authToken } = useAuthStore();
  const { pointBalance, setPointBalance } = useAppStore();

  // Keep the shared point balance in sync with the API when the page opens
  useEffect(() => {
    if (authToken) refreshPointBalance(authToken, setPointBalance);
  }, [authToken, setPointBalance]);

  return (
    <div className="p-2 md:p-8 bg-[#F8F9FA] min-h-screen w-full min-w-0 [contain:inline-size]">
      <div className="max-w-6xl mx-auto min-w-0">
        {/* w-0 + min-w-full: the bar scrolls inside its parent instead of forcing
            the page wider than the screen when it sits in a flex layout */}
        <div className="flex gap-0 sm:gap-5 lg:gap-8 mb-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap w-0 min-w-full">
          {[
            { id: "missions", icon: "track_changes", label: "Missions" },
            { id: "levels", icon: "trending_up", label: "Levels" },
            { id: "marketplace", icon: "storefront", label: "Marketplace" },
            { id: "referrals", icon: "group_add", label: "Referrals" },
            { id: "leaderboard", icon: "leaderboard", label: "Leaderboard" },
            { id: "achievements", icon: "emoji_events", label: "Achievements" },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 px-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm transition-colors flex-shrink-0 ${
                activeTab === id
                  ? "border-b-2 border-black font-semibold -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="material-icons text-lg reward-tab">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "missions" && <MissionsTab token={authToken} />}
        {activeTab === "levels" && <LevelsTab token={authToken} />}
        {activeTab === "marketplace" && (
          <MarketplaceTab token={authToken} pointBalance={pointBalance} />
        )}
        {activeTab === "referrals" && <ReferralsTab token={authToken} />}
        {activeTab === "leaderboard" && <LeaderboardTab token={authToken} />}
        {activeTab === "achievements" && <AchievementsTab token={authToken} />}
      </div>
    </div>
  );
};

// ── Missions Tab ───────────────────────────────────────────────────────────────
const MissionsTab = ({ token }) => {
  const [missionsType, setMissionsType] = useState("daily");
  const [allMissions, setAllMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claiming, setClaiming] = useState(null); // mission id being claimed
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { setPointBalance } = useAppStore();

  // Fetch once; filter client-side by type
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    api
      .getMissions(token)
      .then(setAllMissions)
      .catch((err) => {
        setLoadError(err);
        toast.error(err.message || "Failed to load missions");
      })
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const missions = allMissions.filter((m) => m.type === missionsType);
  // Claimed missions were completed too, so they count toward the banner total
  const completedCount = missions.filter(
    (m) =>
      ["completed", "claimed"].includes(m.status) ||
      (m.targetValue > 0 && m.currentValue >= m.targetValue),
  ).length;
  const dailyMissions = allMissions.filter((m) => m.type === "daily");
  const weeklyMissions = allMissions.filter((m) => m.type === "weekly");

  const handleClaim = async (mission) => {
    setClaiming(mission.id);
    try {
      // The claim endpoint takes the user's mission-progress id
      const { msg } = await api.claimMission(token, mission.claimId);
      toast.success(msg || "Reward claimed!");
      // Mark locally as claimed
      setAllMissions((prev) =>
        prev.map((m) =>
          m.id === mission.id ? { ...m, status: "claimed" } : m,
        ),
      );
      // Claiming adds points, so refresh the shared balance
      refreshPointBalance(token, setPointBalance);
    } catch (err) {
      toast.error(err.message || "Failed to claim reward");
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-1">
        Missions and Challenges
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Complete missions to earn bonus points and rewards
      </p>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setMissionsType("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            missionsType === "daily"
              ? "bg-[#00A5B5] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <span className="material-icons text-sm">schedule</span>
          Daily Missions
          <span
            className={`px-2 rounded-full text-xs ${missionsType === "daily" ? "bg-white/20" : "bg-gray-300"}`}
          >
            {dailyMissions.length}
          </span>
        </button>
        <button
          onClick={() => setMissionsType("weekly")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            missionsType === "weekly"
              ? "bg-[#00A5B5] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <span className="material-icons text-sm">auto_awesome</span>
          Weekly Challenge
          <span
            className={`px-2 rounded-full text-xs ${missionsType === "weekly" ? "bg-white/20" : "bg-gray-300"}`}
          >
            {weeklyMissions.length}
          </span>
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-8 flex flex-col items-center justify-center gap-2 text-gray-500">
            <span className="material-icons animate-spin text-3xl">
              refresh
            </span>
            <span>Loading missions...</span>
          </div>
        ) : loadError ? (
          <LoadError
            message="We couldn't load your missions."
            error={loadError}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : missions.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="material-icons text-4xl mb-2 opacity-50 block">
              track_changes
            </span>
            <p className="font-semibold text-base sm:text-lg">
              No {missionsType} missions right now.
            </p>
            <p className="text-sm mt-1">Check back later for new challenges!</p>
          </div>
        ) : (
          missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              claiming={claiming === mission.id}
              onClaim={() => handleClaim(mission)}
            />
          ))
        )}
      </div>

      {/* Completion banner */}
      {!isLoading && !loadError && missions.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-[#009E96] to-[#007A73] text-white p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">
              Complete all{" "}
              {missionsType === "daily"
                ? "Daily Missions"
                : "Weekly Challenges"}
            </h3>
            <p className="text-sm opacity-90 mt-1">
              Earn a bonus of{" "}
              <span className="text-yellow-300 font-bold">500 points</span> when
              you complete all {missionsType} missions!
            </p>
          </div>
          <div className="bg-white/20 min-w-[64px] h-16 rounded-lg flex flex-col items-center justify-center font-bold flex-shrink-0 px-3">
            <span className="text-2xl leading-none">{completedCount}</span>
            <span className="text-[10px] leading-tight text-center">
              of {missions.length} complete
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mission card ───────────────────────────────────────────────────────────────
const MissionCard = ({ mission, claiming, onClaim }) => {
  const {
    title,
    description,
    pointsReward,
    currentValue = 0,
    targetValue,
    status,
  } = mission;
  const isClaimed = status === "claimed";
  const isComplete =
    status === "completed" ||
    isClaimed ||
    (targetValue > 0 && currentValue >= targetValue);
  const percent = isComplete
    ? 100
    : targetValue > 0
      ? Math.min((currentValue / targetValue) * 100, 100)
      : 0;

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between ${isComplete && !isClaimed ? "border-[#00A5B5]" : "border-gray-100"} ${isClaimed ? "opacity-70" : ""}`}
    >
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          {/* <h3 className="font-bold text-lg w-2/3 leading-tight">{title}</h3> */}
          <h3 className="font-bold text-lg flex-1 min-w-0 leading-tight">
            {title}
          </h3>
          <div className="bg-blue-50 text-blue-500 px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1 flex-shrink-0">
            <span className="material-icons text-sm">stars</span>+{" "}
            {pointsReward}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
      </div>
      <div>
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-gray-500">Progress</span>
          <span className={isComplete ? "text-green-600" : ""}>
            {currentValue}/{targetValue}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${isClaimed ? "bg-gray-400" : isComplete ? "bg-green-500" : "bg-[#00A5B5]"}`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {isClaimed ? (
          <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold justify-center">
            <span className="material-icons text-sm text-gray-400">
              check_circle
            </span>
            Reward Claimed
          </div>
        ) : isComplete ? (
          <button
            onClick={onClaim}
            disabled={claiming}
            className="w-full py-2 bg-[#00A5B5] text-white rounded-lg text-sm font-bold disabled:opacity-60 hover:bg-[#008F9C] transition-colors"
          >
            {claiming ? "Claiming..." : "Claim Reward"}
          </button>
        ) : null}
      </div>
    </div>
  );
};

// ── Levels Tab ─────────────────────────────────────────────────────────────────
const LevelsTab = ({ token }) => {
  const [levels, setLevels] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [vipStatus, setVipStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // One error per source so a single failing endpoint doesn't blank the tab
  const [errors, setErrors] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setErrors({});

    Promise.allSettled([
      api.getDashboard(token),
      api.getLevels(token),
      api.getVipStatus(token),
    ])
      .then(([dashRes, levelsRes, vipRes]) => {
        const reason = (r) => (r.status === "rejected" ? r.reason : null);
        setDashboard(dashRes.value ?? null);
        setLevels(levelsRes.value ?? []);
        setVipStatus(vipRes.value ?? null);
        setErrors({
          dashboard: reason(dashRes),
          levels: reason(levelsRes),
          vip: reason(vipRes),
        });
        if (dashRes.status === "rejected") toast.error("Failed to load level data");
      })
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  // Current level and XP come from the dashboard; names, thresholds and
  // benefits come from the level configs (GET /gamification/levels)
  const dash = api.readDashboard(dashboard);
  const currentLevel = dash.level;
  const currentXP = dash.xp ?? 0;
  const currentCfg = levels.find((l) => l.level === currentLevel);
  const nextCfg = levels.find((l) => l.level > (currentLevel ?? 0));
  const levelName = dash.levelName || currentCfg?.name || "";
  const nextLevelXP = nextCfg?.minXP ?? currentCfg?.maxXP ?? null;
  const nextLevelName = nextCfg?.name || "";
  const benefits = currentCfg?.benefits ?? [];
  const xpPercent =
    nextLevelXP > 0
      ? Math.min(Math.round((currentXP / nextLevelXP) * 100), 100)
      : 0;

  const currentVipTier = api.readVipTier(vipStatus);

  const VIP_TIERS = [
    {
      id: "bronze",
      name: "Bronze",
      points: "0 - 1000",
      color: "bg-yellow-600",
      icon: "military_tech",
    },
    {
      id: "silver",
      name: "Silver",
      points: "1001 - 5000",
      color: "bg-gray-400",
      icon: "star",
    },
    {
      id: "gold",
      name: "Gold",
      points: "5001 - 10000",
      color: "bg-yellow-500",
      icon: "workspace_premium",
    },
    {
      id: "platinum",
      name: "Platinum",
      points: "10001 - 15000",
      color: "bg-purple-500",
      icon: "diamond",
    },
  ];

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
        <span className="material-icons animate-spin text-3xl">refresh</span>
        <span>Loading level data...</span>
      </div>
    );
  }

  if (errors.dashboard) {
    return (
      <LoadError
        message="We couldn't load your level data."
        error={errors.dashboard}
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-1">
        Levels and Progression
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Track your progress and unlock exclusive benefits
      </p>

      {/* Current level + benefits row */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Current level card */}
        <div className="flex-1 size-full bg-gradient-to-br from-[#00D16B] to-[#007D8C] text-white p-6 rounded-2xl relative overflow-hidden">
          <div className="text-sm opacity-80 mb-1">Current Level</div>
          <h2 className="text-3xlll text-xl sm:text-sm font-bold mb-1 relative z-10">
            Level {currentLevel ?? "—"}
            {levelName ? ` — ${levelName}` : ""}
          </h2>
          <p className="text-sm opacity-80 mb-6 relative z-10">
            Keep earning XP to reach the next level
          </p>
          <div className="relative z-10">
            {nextLevelXP !== null ? (
              <>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Progress to level {nextCfg?.level ?? (currentLevel ?? 0) + 1}</span>
                  <span>
                    {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <p className="text-xs opacity-80">
                  {Math.max(0, nextLevelXP - currentXP).toLocaleString()} XP
                  needed to unlock {nextLevelName || "the next level"}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold">
                {currentXP.toLocaleString()} XP earned
              </p>
            )}
          </div>
          <div className="absolute right-[-20px] top-[20px] opacity-20 pointer-events-none">
            <span className="material-icons" style={{ fontSize: "150px" }}>
              trending_up
            </span>
          </div>
        </div>

        {/* Current benefits */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-icons text-[#00A5B5]">
              workspace_premium
            </span>
            Current Benefits
          </h3>
          {benefits.length === 0 && (
            <p className="text-sm text-gray-500">
              {errors.levels
                ? "Benefits are unavailable right now."
                : "No benefits listed for your level yet."}
            </p>
          )}
          <ul className="space-y-3">
            {benefits.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="material-icons text-green-500 text-lg">
                  check_circle
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* All Levels */}
      <h3 className="text-xl font-bold mb-4">All Levels</h3>
      <div className="space-y-3 mb-8">
        {errors.levels ? (
          <LoadError
            message="We couldn't load the level list."
            error={errors.levels}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : levels.length === 0 ? (
          <div className="py-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="material-icons text-4xl mb-2 opacity-50 block">
              trending_up
            </span>
            <p className="font-semibold">No level data available.</p>
          </div>
        ) : (
          levels.map((lvl, idx) => {
            const isCurrent = lvl.level === currentLevel;
            const isUnlocked = currentLevel !== null && lvl.level <= currentLevel;
            return (
              <div
                key={lvl.id || idx}
                className={`p-4 rounded-xl border flex items-center gap-4 bg-white transition-all ${
                  isCurrent
                    ? "border-[#00A5B5] border-2 shadow-sm"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
                    isCurrent
                      ? "bg-[#00A5B5]"
                      : isUnlocked
                        ? "bg-gray-400"
                        : "bg-gray-200"
                  }`}
                >
                  <span className="material-icons">
                    {isCurrent ? "trending_up" : isUnlocked ? "star" : "lock"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold">
                      Level {lvl.level} — {lvl.name}
                    </h4>
                    {isCurrent && (
                      <span className="bg-[#00A5B5] text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        Current Level
                      </span>
                    )}
                    {isUnlocked && !isCurrent && (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Unlocked at {(lvl.minXP || 0).toLocaleString()} xp
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    {(lvl.benefits || []).map((b, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="material-icons text-[14px] text-gray-400">
                          check_circle_outline
                        </span>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VIP Tier System */}
      <h3 className="text-xl font-bold mb-4">VIP Tier System</h3>
      {errors.vip && (
        <p className="text-sm text-gray-500 mb-4">
          We couldn't load your VIP status ({errors.vip.message}).
        </p>
      )}
      <div className="grid sm:grid-cols-2 grid-cols-1 md:grid-cols-4 gap-4">
        {VIP_TIERS.map((tier) => {
          const isActive = currentVipTier === tier.id;
          return (
            <div
              key={tier.id}
              className={`bg-white rounded-xl p-4 flex flex-col items-center text-center border transition-all ${
                isActive
                  ? "border-yellow-400 border-2 shadow-md"
                  : "border-gray-200"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center text-white mb-3`}
              >
                <span className="material-icons text-xl">{tier.icon}</span>
              </div>
              <h4 className="font-bold">{tier.name}</h4>
              {isActive && (
                <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold mb-1">
                  YOUR TIER
                </span>
              )}
              <p className="text-[10px] text-gray-500 mb-4">
                {tier.points} points earned
              </p>
              <ul className="text-left text-[11px] text-gray-600 space-y-2 w-full">
                {[
                  "Faster conversion rate",
                  "2% bonus on rewards",
                  "Standard support",
                ].map((f) => (
                  <li key={f} className="flex vip-tier-list  gap-1">
                    <span className="material-icons text-[14px] vip-tier-tick text-gray-400">
                      check_circle_outline
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Marketplace Tab ────────────────────────────────────────────────────────────
const MarketplaceTab = ({ token, pointBalance }) => {
  const { setPointBalance } = useAppStore();

  const [listings, setListings] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [convertAmount, setConvertAmount] = useState(1000);
  const [converting, setConverting] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  // One error per source: listings, wallet, transactions
  const [errors, setErrors] = useState({});

  const maxBalance = pointBalance ?? 0;
  const nairaValue = Math.floor(convertAmount / 10); // 100pts = ₦10

  // Load the voucher wallet and activity list (also re-run after a conversion)
  const loadWalletAndActivity = useCallback(async () => {
    const [walletRes, txRes] = await Promise.allSettled([
      api.getWallet(token),
      api.getTransactions(token),
    ]);
    if (walletRes.status === "fulfilled") setWallet(walletRes.value);
    if (txRes.status === "fulfilled") setTransactions(txRes.value);
    setErrors((prev) => ({
      ...prev,
      wallet: walletRes.reason ?? null,
      transactions: txRes.reason ?? null,
    }));
  }, [token]);

  // Fetch all marketplace data
  const fetchMarketplace = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setErrors({});
    const [listingsRes] = await Promise.allSettled([
      api.getListings(token),
      loadWalletAndActivity(),
    ]);
    if (listingsRes.status === "fulfilled") {
      setListings(listingsRes.value.rewards);
    } else {
      setErrors((prev) => ({ ...prev, listings: listingsRes.reason }));
      toast.error("Failed to load marketplace");
    }
    setIsLoading(false);
  }, [token, loadWalletAndActivity]);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  // Use the balance in the convert response if present, else re-fetch it
  const syncBalance = (data) => {
    const remaining = data?.newBalance;
    if (typeof remaining === "number") setPointBalance(remaining);
    else refreshPointBalance(token, setPointBalance);
  };

  // Convert points → voucher
  const handleConvert = async (pointsToConvert) => {
    if (
      !pointsToConvert ||
      pointsToConvert <= 0 ||
      pointsToConvert > maxBalance
    ) {
      toast.error("Invalid amount or insufficient points");
      return;
    }
    setConverting(true);
    try {
      const { data, msg } = await api.convertPoints(token, pointsToConvert);
      toast.success(msg || "Voucher generated successfully!");
      // Refresh wallet + activity + update balance
      await loadWalletAndActivity();
      syncBalance(data);
    } catch (err) {
      toast.error(err.message || "Failed to generate voucher");
    } finally {
      setConverting(false);
    }
  };

  // Redeem a marketplace listing: POST /marketplace/convert with { listingId };
  // the backend charges the listing's cost and decrements its stock.
  const handleRedeem = async (listing) => {
    if (listing.stock === 0) {
      toast.error("This reward is out of stock");
      return;
    }
    if ((listing.pointsCost || 0) > maxBalance) {
      toast.error("Insufficient points for this reward");
      return;
    }
    setRedeemingId(listing._id);
    try {
      const { data, msg } = await api.buyListing(token, listing._id);
      toast.success(msg || `${listing.title} redeemed!`);
      // Stock changed server-side; reflect it locally (-1 = unlimited)
      setListings((prev) =>
        prev.map((l) =>
          l._id === listing._id && l.stock > 0 ? { ...l, stock: l.stock - 1 } : l,
        ),
      );
      await loadWalletAndActivity();
      syncBalance(data);
    } catch (err) {
      toast.error(err.message || "Redemption failed");
    } finally {
      setRedeemingId(null);
    }
  };

  // Copy voucher code
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const safeListings = Array.isArray(listings) ? listings : [];
  const filteredListings =
    activeFilter === "all"
      ? safeListings
      : safeListings.filter((l) =>
          (l.type || l.category || "")
            .toLowerCase()
            .includes(activeFilter.toLowerCase()),
        );

  return (
    <div>
      {/* Hero banner */}
      {/* <div 
        className="text-white p-8 rounded-2xl mb-6 flex justify-between items-center relative overflow-hidden bg-cover bg-center"
        style={{ 
            backgroundImage: "linear-gradient(to right, rgba(11, 148, 83, 0.9), rgba(1, 94, 49, 0.9)), url('/rewards-bg.jpg')",
        }}
      > */}
      <div
        className="text-white p-6 md:p-8 rounded-2xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 131, 3, 0.9) 50%, rgba(0, 150, 184, 0.9)), url('/rewards-bg.jpg')",
        }}
      >
        <div className="relative z-10 w-full md:w-2/3">
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide inline-block mb-3">
            Rewards Season is Here
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            Convert Your Points Into{" "}
            <span className="text-[#00D16B]">Real</span> Rewards
          </h1>
          <p className="text-sm opacity-90 mb-6 w-full md:w-[80%]">
            Your opinion matters, and so do your rewards. Easily exchange your
            hard-earned survey points for cash vouchers, premium subscriptions,
            and exclusive discounts from top partners!
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() =>
                document
                  .getElementById("quick-convert")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[#00A5B5] hover:bg-[#008F9C] border border-white/30 text-white px-6 py-2 rounded font-semibold text-xs sm:text-sm transition-colors"
            >
              Start Converting →
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("marketplace-grid")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-transparent border border-white/50 text-white px-6 py-2 rounded font-semibold text-xs sm:text-sm hover:bg-white/10 transition-colors"
            >
              Browse Catalog
            </button>
          </div>
        </div>
        <div
          className="absolute right-0 top-0 w-1/3 h-full opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #00D16B 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Balance card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <span className="material-icons">account_balance_wallet</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-600 font-semibold text-sm">
                Your Balance
                <span className="material-icons text-sm text-gray-400">
                  info
                </span>
              </div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-bold">
                  {maxBalance.toLocaleString()}
                </span>
                <span className="text-gray-500 font-semibold mb-1">pts</span>
              </div>
              <div className="mt-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-semibold inline-flex items-center gap-1">
                <span className="material-icons text-[14px]">trending_up</span>≈
                ₦{Math.floor(maxBalance / 10).toLocaleString()} Value
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() =>
            document
              .getElementById("quick-convert")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="w-full bg-[#00A5B5] hover:bg-[#008F9C] text-white py-3 rounded-lg font-bold transition-colors"
        >
          Convert Points Now
        </button>
        <p className="text-center text-xs text-gray-500 mt-2">
          Conversion rate: 100pts = ₦10
        </p>
      </div>

      {/* Quick Convert */}
      <div
        id="quick-convert"
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
            <span className="material-icons text-sm">currency_exchange</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Quick Convert</h3>
            <p className="text-xs text-gray-500">
              Turn into cash vouchers instantly
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-semibold mb-2 text-gray-600">
              <span>Amount to Convert</span>
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setConvertAmount(maxBalance)}
              >
                Max ({maxBalance.toLocaleString()})
              </button>
            </div>
            <div className="border border-gray-200 rounded p-3 flex justify-between items-center">
              <input
                type="number"
                min={0}
                max={maxBalance}
                value={convertAmount}
                onChange={(e) =>
                  setConvertAmount(
                    Math.max(0, Math.min(Number(e.target.value), maxBalance)),
                  )
                }
                className="font-bold text-lg w-full outline-none"
              />
              <span className="text-gray-400 font-semibold ml-2">pts</span>
            </div>
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={maxBalance}
                value={Math.min(convertAmount, maxBalance)}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A5B5]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span>{Math.floor(maxBalance / 2).toLocaleString()}</span>
                <span>{maxBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center">
            <span className="material-icons text-gray-300 rotate-90 md:rotate-0">
              sync_alt
            </span>
          </div>

          <div className="flex-1 bg-green-50 rounded-xl p-6 flex flex-col items-center justify-center w-full">
            <span className="text-xs font-bold text-green-600 mb-1 uppercase">
              You will receive
            </span>
            <span className="text-3xl font-bold text-green-700 mb-2">
              ₦ {nairaValue.toLocaleString()}
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1 bg-white px-2 py-1 rounded-full">
              <span className="material-icons text-[14px]">check_circle</span>
              Instantly Available
            </span>
          </div>
        </div>

        <button
          disabled={
            converting || convertAmount <= 0 || convertAmount > maxBalance
          }
          onClick={() => handleConvert(convertAmount)}
          className="w-full bg-[#00A5B5] hover:bg-[#008F9C] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold mt-6 flex justify-center items-center gap-1 transition-colors"
        >
          {converting ? (
            <>
              <span className="material-icons animate-spin text-sm">
                refresh
              </span>
              Processing...
            </>
          ) : (
            <>
              Generate Voucher
              <span className="material-icons text-sm">chevron_right</span>
            </>
          )}
        </button>
      </div>

      {/* Marketplace grid */}
      <div id="marketplace-grid" className="mb-8">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-icons text-[#00A5B5]">storefront</span>
            Rewards Marketplace
          </h3>
          <div className="flex gap-2 flex-wrap">
            {/* Listing types from the backend model (premium_upgrade is listed separately) */}
            {["all", "gift_card", "discount"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${
                  activeFilter === f
                    ? "bg-[#00A5B5] text-white"
                    : "border border-gray-300 text-gray-600 hover:border-[#00A5B5]"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "gift_card"
                    ? "Gift Cards"
                    : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-gray-500">
              Loading marketplace listings...
            </div>
          ) : errors.listings ? (
            <LoadError
              message="We couldn't load the marketplace."
              error={errors.listings}
              onRetry={fetchMarketplace}
            />
          ) : filteredListings.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
              <span className="material-icons text-4xl mb-2 opacity-50 block">
                storefront
              </span>
              <p className="font-semibold text-base ">
                No listings available right now.
              </p>
              <p className="text-sm mt-1">
                Check back later for new rewards to redeem!
              </p>
            </div>
          ) : (
            filteredListings.map((item) => (
              <MarketplaceItem
                key={item._id}
                item={item}
                redeeming={redeemingId === item._id}
                outOfStock={item.stock === 0}
                onRedeem={() => handleRedeem(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* Premium Upgrades (static UI) */}
      <div className="mb-8">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <span className="material-icons text-yellow-500">auto_awesome</span>
          Premium Upgrades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UpgradeItem
            title="Pro Member"
            cost="5000"
            duration="1 Month"
            color="text-green-500"
            border="border-green-400"
            icon="workspace_premium"
          />
          <UpgradeItem
            title="Survey Boost"
            cost="1000"
            duration="7 Days"
            color="text-blue-500"
            border="border-blue-400 border-dashed"
            icon="bolt"
          />
          <UpgradeItem
            title="Ad-Free Pass"
            cost="2000"
            duration="Lifetime"
            color="text-purple-500"
            border="border-purple-400"
            icon="shield"
          />
        </div>
      </div>

      {/* Voucher Wallet */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
          <span className="material-icons text-purple-500">local_activity</span>
          Voucher Wallet
          <span className="ml-auto bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded font-bold">
            {wallet.filter((v) => v.status === "active" || !v.status).length}{" "}
            Active
          </span>
        </h3>

        {isLoading ? (
          <LoadingState label="Loading your vouchers..." />
        ) : errors.wallet ? (
          <LoadError
            message="We couldn't load your vouchers."
            error={errors.wallet}
            onRetry={loadWalletAndActivity}
          />
        ) : wallet.length === 0 ? (
          <div className="py-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
            <p className="font-semibold">Your wallet is empty</p>
            <p className="text-xs mt-1">
              Convert your points into vouchers to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallet.map((voucher, idx) => (
              <div
                key={voucher._id || idx}
                className="border border-dashed border-gray-200 rounded-xl p-4 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold mb-1">
                      REWARD
                    </div>
                    <div className="font-bold text-lg">
                      {voucher.title || "Cash Voucher"}
                    </div>
                  </div>
                  <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1">
                    <span className="material-icons text-[12px]">
                      check_circle
                    </span>
                    {voucher.status === "used" ? "Used" : "Active"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Voucher Code</div>
                  <div className="bg-gray-100 p-2 rounded font-mono font-bold tracking-widest text-sm flex justify-between items-center">
                    <span>{voucher.code || "—"}</span>
                    <button
                      onClick={() => voucher.code && handleCopy(voucher.code)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                      title="Copy code"
                    >
                      <span className="material-icons text-sm">
                        {copiedCode === voucher.code ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                  {voucher.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Generated{" "}
                      {new Date(voucher.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity (hidden when empty, as before) */}
      {errors.transactions && (
        <p className="text-sm text-gray-500">
          We couldn't load your recent activity ({errors.transactions.message}).
        </p>
      )}
      {!errors.transactions && transactions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
            <span className="material-icons text-[#00A5B5]">receipt_long</span>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx, i) => (
              <div
                key={tx._id || i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "earn" ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <span
                      className={`material-icons text-sm ${tx.type === "earn" ? "text-green-500" : "text-red-500"}`}
                    >
                      {tx.type === "earn" ? "arrow_downward" : "arrow_upward"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {tx.description || tx.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleDateString("en-GB")
                        : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-sm ${tx.type === "earn" ? "text-green-600" : "text-red-500"}`}
                >
                  {tx.type === "earn" ? "+" : "-"}
                  {Math.abs(tx.points || tx.amount || 0).toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Marketplace item card ──────────────────────────────────────────────────────
const MarketplaceItem = ({ item, redeeming, outOfStock, onRedeem }) => {
  const { title, partnerName, pointsCost, value, imageUrl } = item;
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
      <div className="h-40 bg-slate-800 relative flex items-center justify-center">
        {value && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
            {value}
          </div>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-icons text-white text-4xl opacity-30">
            image
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
            {partnerName || "REWARD"}
          </div>
          <h4 className="font-bold text-sm mb-4 leading-tight">{title}</h4>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] text-gray-500">Cost</div>
            <div className="font-bold text-sm">
              {(pointsCost || 0).toLocaleString()} pts
            </div>
          </div>
          <button
            onClick={onRedeem}
            disabled={redeeming || outOfStock}
            className="text-[#00A5B5] bg-blue-50 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#00A5B5] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {redeeming ? "..." : outOfStock ? "Out of stock" : "Redeem"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Upgrade card (static) ─────────────────────────────────────────────────────
const UpgradeItem = ({ title, cost, duration, color, border, icon }) => (
  <div className={`bg-white p-4 rounded-xl border ${border} relative`}>
    <div className="flex justify-between items-start mb-4">
      <div
        className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${color}`}
      >
        <span className="material-icons">{icon}</span>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-400 font-semibold uppercase">
          Cost
        </div>
        <div className="font-bold text-sm">
          {cost} <span className="text-xs text-gray-500">pts</span>
        </div>
      </div>
    </div>
    <h4 className="font-bold mb-1">{title}</h4>
    <div className="text-xs text-gray-500 mb-4">{duration}</div>
    <button className="w-full py-2 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
      Unlock Now
    </button>
  </div>
);

// ── Referrals Tab ──────────────────────────────────────────────────────────────
const ReferralsTab = ({ token }) => {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    api
      .getReferrals(token)
      .then(setInfo)
      .catch((err) => {
        setInfo(null);
        setLoadError(err);
        toast.error("Failed to load referrals");
      })
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const {
    code = "",
    link = "",
    total: totalReferrals = 0,
    pointsEarned = 0,
    referrals = [],
  } = info || {};

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => toast.error("Couldn't copy. Please copy it manually."));
  };

  const handleShare = () => {
    const shareLink = link || code;
    if (navigator.share) {
      navigator
        .share({
          title: "Join me on SurveyTools",
          text: "Join SurveyTools and earn rewards for your opinions!",
          ...(link ? { url: link } : {}),
        })
        .catch(() => {});
    } else {
      handleCopy(shareLink, "link");
    }
  };

  const statusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (["completed", "successful", "active", "verified", "rewarded"].includes(s))
      return "bg-green-100 text-green-700";
    if (["pending", "invited", "registered"].includes(s))
      return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  if (isLoading) return <LoadingState label="Loading referrals..." />;

  const hasData = Boolean(code || link || referrals.length > 0);

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-1">Refer and Earn</h1>
      <p className="text-gray-500 text-sm mb-6">
        Invite friends to SurveyTools and earn points when they join
      </p>

      {loadError ? (
        <LoadError
          message="We couldn't load your referrals."
          error={loadError}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : !hasData ? (
        <EmptyState
          icon="group_add"
          title="No referral data yet."
          subtitle="Check back later to invite friends and start earning points!"
        />
      ) : (
        <>

      {/* Referral code + stats row */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-gradient-to-br from-[#00D16B] to-[#007D8C] text-white p-6 rounded-2xl relative overflow-hidden">
          <div className="text-sm opacity-80 mb-1 relative z-10">
            Your Referral Code
          </div>
          {code ? (
            <div className="relative z-10 flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-white/20 px-4 py-2 rounded-lg font-mono font-bold tracking-widest text-lg sm:text-xl break-all">
                {code}
              </span>
              <button
                onClick={() => handleCopy(code, "code")}
                className="bg-white text-[#007D8C] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1 hover:bg-white/90 transition-colors"
              >
                <span className="material-icons text-sm">
                  {copied === "code" ? "check" : "content_copy"}
                </span>
                {copied === "code" ? "Copied" : "Copy Code"}
              </button>
            </div>
          ) : (
            <p className="relative z-10 text-sm opacity-90 mb-4">
              Your referral code isn't available yet. Please check back soon.
            </p>
          )}

          {link && (
            <div className="relative z-10 bg-black/20 rounded-lg p-2 pl-3 flex items-center justify-between gap-2 mb-4">
              <span className="text-xs sm:text-sm truncate min-w-0">{link}</span>
              <button
                onClick={() => handleCopy(link, "link")}
                className="text-white/80 hover:text-white flex-shrink-0 transition-colors"
                title="Copy link"
              >
                <span className="material-icons text-sm">
                  {copied === "link" ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          )}

          {(code || link) && (
            <button
              onClick={handleShare}
              className="relative z-10 bg-transparent border border-white/50 text-white px-6 py-2 rounded font-semibold text-xs sm:text-sm hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <span className="material-icons text-sm">share</span>
              Share Invite
            </button>
          )}

          <div className="absolute right-[-20px] top-[20px] opacity-20 pointer-events-none">
            <span className="material-icons" style={{ fontSize: "150px" }}>
              group_add
            </span>
          </div>
        </div>

        <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-icons text-[#00A5B5]">insights</span>
            Referral Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Total Referrals
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Number(totalReferrals || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-semibold mb-1">
                Points Earned
              </div>
              <div className="text-2xl font-bold text-green-600">
                {Number(pointsEarned || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral list */}
      <h3 className="text-xl font-bold mb-4">Your Referrals</h3>
      {referrals.length === 0 ? (
        <EmptyState
          icon="group_add"
          title="No referrals yet."
          subtitle="Share your code with friends to start earning points!"
        />
      ) : (
        <div className="space-y-3">
          {referrals.map((r, idx) => {
            const name = displayName(r) || "Invited user";
            const pts = Number(r.pointsEarned ?? r.rewardPoints ?? r.points ?? 0);
            return (
              <div
                key={r._id || r.id || idx}
                className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3 sm:gap-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#00A5B5] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base truncate max-w-full">
                      {name}
                    </h4>
                    {r.status && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize ${statusStyle(r.status)}`}
                      >
                        {r.status}
                      </span>
                    )}
                  </div>
                  {(r.createdAt || r.joinedAt) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Joined {formatDate(r.createdAt || r.joinedAt)}
                    </p>
                  )}
                </div>
                {pts > 0 && (
                  <span className="font-bold text-sm text-green-600 flex-shrink-0">
                    +{pts.toLocaleString()} pts
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
};

// ── Leaderboard Tab ────────────────────────────────────────────────────────────
const LEADERBOARD_PERIODS = [
  { id: "all_time", label: "All Time", icon: "emoji_events" },
  { id: "monthly", label: "Monthly", icon: "calendar_month" },
  { id: "weekly", label: "Weekly", icon: "date_range" },
];

const LeaderboardTab = ({ token }) => {
  const [period, setPeriod] = useState("all_time");
  const [board, setBoard] = useState({ entries: [], myRank: null });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    api
      .getLeaderboard(token, period)
      .then(setBoard)
      .catch((err) => {
        setBoard({ entries: [], myRank: null });
        setLoadError(err);
        toast.error("Failed to load leaderboard");
      })
      .finally(() => setIsLoading(false));
  }, [token, period, reloadKey]);

  // "Your position" block only shows if the API returns the user's rank
  const { entries, myRank } = board;

  const scoreOf = (e) => {
    const hasPoints = e.points ?? e.totalPoints ?? e.score;
    return hasPoints !== undefined && hasPoints !== null
      ? { value: Number(hasPoints) || 0, label: "pts" }
      : { value: Number(e.xp ?? e.totalXP ?? 0) || 0, label: "XP" };
  };

  const rankStyle = (rank) =>
    rank === 1
      ? "bg-yellow-500 text-white"
      : rank === 2
        ? "bg-gray-400 text-white"
        : rank === 3
          ? "bg-yellow-600 text-white"
          : "bg-gray-100 text-gray-600";

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-1">Leaderboard</h1>
      <p className="text-gray-500 text-sm mb-6">
        See how you stack up against other top earners
      </p>

      {/* Period filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {LEADERBOARD_PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              period === p.id
                ? "bg-[#00A5B5] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <span className="material-icons text-sm">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading leaderboard..." />
      ) : loadError ? (
        <LoadError
          message="We couldn't load the leaderboard."
          error={loadError}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <>
          {myRank && (
            <div className="mb-6 bg-gradient-to-r from-[#009E96] to-[#007A73] text-white p-6 rounded-xl flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Your Position</h3>
                <p className="text-sm opacity-90 mt-1">
                  Keep completing surveys and missions to climb higher!
                </p>
              </div>
              <div className="bg-white/20 min-w-[64px] h-16 rounded-lg flex flex-col items-center justify-center font-bold flex-shrink-0 px-3">
                <span className="text-2xl leading-none">#{myRank}</span>
                <span className="text-[10px] leading-tight">your rank</span>
              </div>
            </div>
          )}

          {entries.length === 0 ? (
            <EmptyState
              icon="leaderboard"
              title="No rankings yet."
              subtitle="Be the first to earn points and top the leaderboard!"
            />
          ) : (
            <div className="space-y-3">
              {entries.map((e, idx) => {
                const rank = Number(e.rank) || idx + 1;
                const name = displayName(e) || "Anonymous";
                const { value, label } = scoreOf(e);
                const isMe = Boolean(
                  e.isCurrentUser || e.isMe || e.isCurrent || e.currentUser,
                );
                const levelText = e.levelName || (e.level ? `Level ${e.level}` : "");
                return (
                  <div
                    key={e._id || e.userId || idx}
                    className={`p-3 sm:p-4 rounded-xl border flex items-center gap-3 sm:gap-4 bg-white transition-all ${
                      isMe
                        ? "border-[#00A5B5] border-2 shadow-sm"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${rankStyle(rank)}`}
                    >
                      {rank <= 3 ? (
                        <span className="material-icons">military_tech</span>
                      ) : (
                        rank
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base truncate max-w-full">
                          {name}
                        </h4>
                        {isMe && (
                          <span className="bg-[#00A5B5] text-white text-[10px] px-2 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                      </div>
                      {(levelText || rank <= 3) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {rank <= 3 ? `Rank #${rank}` : ""}
                          {rank <= 3 && levelText ? " · " : ""}
                          {levelText}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-sm sm:text-base">
                        {value.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase">
                        {label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Achievements Tab ───────────────────────────────────────────────────────────
const AchievementsTab = ({ token }) => {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    api
      .getAchievements(token)
      .then(setAchievements)
      .catch((err) => {
        setAchievements([]);
        setLoadError(err);
        toast.error("Failed to load achievements");
      })
      .finally(() => setIsLoading(false));
  }, [token, reloadKey]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const overallPercent =
    achievements.length > 0
      ? Math.round((unlockedCount / achievements.length) * 100)
      : 0;

  const filtered = achievements.filter((a) =>
    filter === "all" ? true : filter === "unlocked" ? a.unlocked : !a.unlocked,
  );

  return (
    <div>
      <h1 className="text-lg sm:text-2xl font-bold mb-1">Achievements</h1>
      <p className="text-gray-500 text-sm mb-6">
        Unlock badges and bonus points by hitting milestones
      </p>

      {isLoading ? (
        <LoadingState label="Loading achievements..." />
      ) : loadError ? (
        <LoadError
          message="We couldn't load your achievements."
          error={loadError}
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : achievements.length === 0 ? (
        <EmptyState
          icon="emoji_events"
          title="No achievements available yet."
          subtitle="Check back later for new milestones to unlock!"
        />
      ) : (
        <>
          {/* Summary banner */}
          <div className="mb-6 bg-gradient-to-r from-[#009E96] to-[#007A73] text-white p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg">Your Progress</h3>
              <p className="text-sm opacity-90 mt-1">
                You've unlocked{" "}
                <span className="text-yellow-300 font-bold">
                  {unlockedCount}
                </span>{" "}
                of {achievements.length} achievements
              </p>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
            <div className="bg-white/20 min-w-[64px] h-16 rounded-lg flex flex-col items-center justify-center font-bold flex-shrink-0 px-3 self-start sm:self-auto">
              <span className="text-2xl leading-none">{overallPercent}%</span>
              <span className="text-[10px] leading-tight">complete</span>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { id: "all", label: "All", count: achievements.length },
              { id: "unlocked", label: "Unlocked", count: unlockedCount },
              {
                id: "locked",
                label: "Locked",
                count: achievements.length - unlockedCount,
              },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filter === id
                    ? "bg-[#00A5B5] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {label}
                <span
                  className={`px-2 rounded-full text-xs ${filter === id ? "bg-white/20" : "bg-gray-300"}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <EmptyState
                icon="emoji_events"
                title={
                  filter === "unlocked"
                    ? "No achievements unlocked yet."
                    : "You've unlocked everything!"
                }
                subtitle={
                  filter === "unlocked"
                    ? "Complete surveys and missions to earn your first badge."
                    : undefined
                }
              />
            ) : (
              filtered.map((a) => (
                <AchievementCard key={a.id} achievement={a} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ── Achievement card ───────────────────────────────────────────────────────────
const AchievementCard = ({ achievement }) => {
  const {
    name,
    description,
    points,
    iconUrl,
    unlocked,
    current,
    target,
    percent,
    unlockedAt,
  } = achievement;

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col justify-between ${
        unlocked ? "border-[#00A5B5]" : "border-gray-100"
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-3 gap-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
              unlocked
                ? "bg-[#00A5B5] text-white"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {iconUrl && /^https?:\/\//.test(iconUrl) ? (
              <img
                src={iconUrl}
                alt={name}
                className={`w-full h-full object-cover ${unlocked ? "" : "grayscale opacity-60"}`}
              />
            ) : (
              <span className="material-icons">
                {unlocked ? "emoji_events" : "lock"}
              </span>
            )}
          </div>
          {points > 0 && (
            <div className="bg-blue-50 text-blue-500 px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1 flex-shrink-0">
              <span className="material-icons text-sm">stars</span>+ {points}
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg leading-tight mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}
      </div>

      <div>
        {!unlocked && target > 0 && (
          <>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span className="text-gray-500">Progress</span>
              <span>
                {current}/{target}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00A5B5] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
        {unlocked && (
          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <span className="material-icons text-sm">check_circle</span>
            Unlocked
            {unlockedAt ? ` · ${formatDate(unlockedAt)}` : ""}
          </div>
        )}
        {!unlocked && !(target > 0) && (
          <div className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
            <span className="material-icons text-sm text-gray-400">lock</span>
            Locked
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;
