import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const pad = (n) => String(n).padStart(2, "0");

// "HH : MM : SS" until `expiresAt`; null once it has passed
const useCountdown = (expiresAt) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const left = Math.floor((expiresAt.getTime() - now) / 1000);
  if (left <= 0) return null;
  return `${pad(Math.floor(left / 3600))} : ${pad(Math.floor((left % 3600) / 60))} : ${pad(left % 60)}`;
};

// Shown only while a boost is active; `boost` = { multiplier, expiresAt } or null
function BoostBanner({ boost }) {
  const countdown = useCountdown(boost?.expiresAt);
  if (!boost || !countdown) return null;
  const { multiplier } = boost;
  const earn = multiplier === 2 ? "double" : `${multiplier}x`;

  return (
    <div className="point-boost bg-gradient-to-r from-[#008303] to-[#0096B8] rounded-2xl p-10 text-white flex flex-col md:flex-row justify-between items-center shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-4 z-10 relative">
        <div className="boost-icon w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <span className="material-icons text-white text-2xl">bolt</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">{multiplier}x Points Boost Active</h2>
          <p className="text-sm opacity-90">
            Complete Surveys now to earn {earn} points
          </p>
        </div>
      </div>
      <div
        className="bg-white/20 px-4 py-2 rounded-lg font-mono font-bold tracking-wider mt-4 md:mt-0 z-10 relative flex items-center gap-2"
        aria-label="Boost time remaining"
      >
        <span className="material-icons text-sm">schedule</span> {countdown}
      </div>

      {/* Decorative background circle */}
      <div className="absolute right-[-50px] top-[-50px] w-48 h-48 bg-white/10 rounded-full"></div>
    </div>
  );
}

// Value for a stat: a pulse while loading, a dash when unavailable
const Stat = ({ loading, value, children }) => {
  if (loading) return <span className="inline-block w-16 h-6 bg-gray-100 rounded animate-pulse align-middle" />;
  if (value === null || value === undefined) return "–";
  return children ?? value;
};

export default function DashboardMain({
  pointBalance,
  pointsLoading,
  pointsError,
  stats,
  statsLoading,
  statsError,
  onRetryStats,
  boost,
}) {
  const xp = stats?.xp ?? null;
  const nextLevelXP = stats?.nextLevelXP ?? null;
  const isMaxLevel = Boolean(stats) && xp !== null && nextLevelXP === null;
  const levelPercent = isMaxLevel
    ? 100
    : xp !== null && nextLevelXP > 0
      ? Math.min((xp / nextLevelXP) * 100, 100)
      : 0;

  // Light up the streak's days in this week, ending today
  const streak = stats?.streak ?? 0;
  const todayIdx = new Date().getDay();
  const isStreakDay = (idx) => idx <= todayIdx && todayIdx - idx < streak;

  return (
    <div className="space-y-6 pt-2 sm:pt-6">
      <div className="flex flex-col md:flex-row md:items-center items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Respond to surveys and earn rewards
          </p>
        </div>
      </div>

      <BoostBanner boost={boost} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Points Widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#00A5B5]">
              <span className="material-icons">toll</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Your Points
              </p>
              <h3 className="dsh-point-bal sm:text-2xl font-bold text-gray-800">
                <Stat loading={pointsLoading} value={pointsError ? null : pointBalance}>
                  {typeof pointBalance === "number" ? pointBalance.toLocaleString() : null}
                </Stat>
              </h3>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-1 flex justify-between">
              <span >Next level</span>
              <span className="text-green-500 font-semibold flex items-center gap-1">
                <span className="material-icons text-[12px]">trending_up</span>{" "}
                #24.30 Voucher Value
              </span>
            </p>
            <Link
              to="/rewards"
              className="w-full bg-[#00A5B5] text-white py-2 rounded-lg text-xs font-bold block text-center mt-2 hover:bg-[#008F9C] transition-colors"
            >
              Convert Points
            </Link>
          </div>
        </div>

        {/* Level Widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
              <span className="material-icons">trending_up</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Level <Stat loading={statsLoading} value={stats?.level} />
              </p>
              <h3 className="dsh_level text-xl font-bold text-gray-800">
                <Stat loading={statsLoading} value={stats ? stats.levelName || `Level ${stats.level ?? ""}` : null} />
              </h3>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
              <span>
                {statsLoading || xp === null
                  ? "– XP"
                  : isMaxLevel
                    ? `${xp.toLocaleString()} XP · Max level`
                    : `${xp.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP`}
              </span>
              <span className="text-purple-600">
                {xp === null ? "–" : `${levelPercent.toFixed(0)}%`}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${levelPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Streak Widget */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
              <span className="material-icons">local_fire_department</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Daily Streak
              </p>
              <h3 className="dsh_streak text-xl font-bold text-gray-800">
                <Stat loading={statsLoading} value={stats?.streak}>
                  {stats?.streak === 1 ? "1 Day" : `${stats?.streak} Days`}
                </Stat>
              </h3>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            {DAYS.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isStreakDay(idx) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}
                >
                  <span className="material-icons text-[14px]">
                    local_fire_department
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-semibold">
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {statsError && (
        <p className="text-xs text-gray-500">
          Couldn&apos;t load your level and streak
          {statsError.status ? ` (${statsError.message})` : ". Please check your connection"}
          .{" "}
          <button type="button" className="underline text-[#00A5B5]" onClick={onRetryStats}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
