// rewardsApi.js
// Service layer for the Rewards page and the Daily Spin modal
// (gamification + marketplace endpoints from docs/apiCollections).
//
// The Postman collection documents request URLs and bodies but has NO saved
// responses, so response shapes below are inferred from the admin "create"
// bodies (mission, listing, level, achievement models). Every mapper is the
// ONLY place that needs editing once the real JSON is confirmed. In dev, a
// console warning is printed whenever an expected field is missing so the
// mismatch is visible instead of silently papered over.
//
// Requests go through window.fetch so the global 401 handler in
// utils/setupAuthInterceptor.js logs the user out on an expired session.

import config from "../../config/config";

/* -------------------------------------------------------------------------- */
/*  Core request helper                                                       */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = no HTTP response (offline, DNS, timeout)
  }
}

// Every endpoint answers with the envelope { status, code, msg, data }
async function request(path, token, { method = "GET", body, params } = {}) {
  const url = new URL(`${config.API_URL}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    throw new ApiError(
      json?.msg || json?.message || `Request failed (${res.status})`,
      res.status,
    );
  }
  return { data: json?.data ?? null, msg: json?.msg || json?.message || "" };
}

const get = async (path, token, params) =>
  (await request(path, token, { params })).data;
const post = (path, token, body) =>
  request(path, token, { method: "POST", body });

/* -------------------------------------------------------------------------- */
/*  Shape helpers                                                             */
/* -------------------------------------------------------------------------- */

const warned = new Set();
// Dev-only, once per label: report a response that doesn't match expectations
const warnShape = (label, problem, sample) => {
  if (!import.meta.env.DEV || warned.has(label)) return;
  warned.add(label);
  console.warn(`[rewardsApi] ${label}: ${problem}`, sample);
};

// `data` may be the array itself or an object holding it under one of `keys`
const listOf = (data, label, ...keys) => {
  if (Array.isArray(data)) return data;
  for (const k of keys) if (Array.isArray(data?.[k])) return data[k];
  if (data != null) warnShape(label, `no list found (tried ${keys.join(", ")})`, data);
  return [];
};

const firstNumber = (...vals) =>
  vals.find((v) => typeof v === "number" && !Number.isNaN(v));

const asObject = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

/* -------------------------------------------------------------------------- */
/*  Points                                                                    */
/* -------------------------------------------------------------------------- */

// -> number | null   (GET /user/points answers { data: { points } })
export async function getPoints(token) {
  const d = await get("/user/points", token);
  return firstNumber(d?.points, typeof d === "number" ? d : undefined) ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Dashboard / levels / VIP                                                  */
/* -------------------------------------------------------------------------- */

export const getDashboard = (token) => get("/gamification/dashboard", token);

// GET /gamification/dashboard answers (backend controllers/gamification.js):
//   { xp, level, levelName, levelBenefits, nextLevelXP, vipTier, currentStreak,
//     spinsRemaining, pointBalance, activeMissionsCount }
// nextLevelXP is the next level's cumulative minXP, or null at the top level.
// -> { level, levelName, xp, nextLevelXP, streak, pointBalance } (any may be null)
export function readDashboard(d) {
  const src = asObject(d);
  const user = asObject(src.user);
  const rawLevel = src.level ?? src.currentLevel ?? user.level;
  const levelObj = asObject(rawLevel);
  const level = firstNumber(levelObj.level, rawLevel) ?? null;
  const xp =
    firstNumber(src.xp, src.currentXP, src.totalXP, user.xp, user.totalXP) ?? null;
  if (d && (level === null || xp === null)) {
    warnShape("dashboard", "missing level and/or xp", d);
  }
  return {
    level,
    levelName: levelObj.name || src.levelName || "",
    xp,
    nextLevelXP: firstNumber(src.nextLevelXP) ?? null,
    streak: firstNumber(src.currentStreak) ?? null,
    pointBalance: firstNumber(src.pointBalance) ?? null,
  };
}

// -> { multiplier, expiresAt: Date } for the strongest unexpired points boost, or null.
// The backend keeps boosts on the gamification profile as
// activeBoosts: [{ type, multiplier, expiresAt }], but NO endpoint returns them
// yet (not the dashboard, profile or points endpoint). This reads that model
// shape so the banner lights up once the dashboard includes it; until then it
// returns null and the banner stays hidden.
export function readActiveBoost(d) {
  const src = asObject(d);
  if (d && !Array.isArray(src.activeBoosts)) {
    warnShape(
      "dashboard",
      "no activeBoosts in the payload; the points boost banner cannot be shown",
      d,
    );
    return null;
  }
  const now = Date.now();
  let best = null;
  for (const b of src.activeBoosts || []) {
    const multiplier = Number(b?.multiplier);
    const expiresAt = new Date(b?.expiresAt);
    if (!(multiplier > 1) || Number.isNaN(expiresAt.getTime())) continue;
    if (expiresAt.getTime() <= now) continue;
    if (!best || multiplier > best.multiplier) best = { multiplier, expiresAt };
  }
  return best;
}

/* -------------------------------------------------------------------------- */
/*  Profile                                                                   */
/* -------------------------------------------------------------------------- */

// GET /user/profile answers { data: { user, requires... } } -> the user's Mongo _id
// (what surveys list in `submittedUsers`)
export async function getMyUserId(token) {
  const d = await get("/user/profile", token);
  const id = d?.user?._id;
  if (!id) warnShape("profile", "no user._id in the profile payload", d);
  return id ? String(id) : null;
}

// -> spins left today, or undefined when the payload doesn't say
export function readSpinsLeft(d) {
  const src = asObject(d);
  const n = firstNumber(
    src.spinsRemaining,
    src.spinRemaining,
    src.remainingSpins,
    src.spinsLeft,
    src.spin?.remaining,
    src.dailySpin?.remaining,
  );
  if (n !== undefined) return Math.max(0, n);
  if (src.canSpin === false) return 0;
  if (src.canSpin === true) return 1;
  return undefined;
}

// Level config model: { level, name, minXP, maxXP, benefits[] }
export async function getLevels(token) {
  const d = await get("/gamification/levels", token);
  return listOf(d, "levels", "levels")
    .map((l) => ({
      id: l._id || l.id || l.level,
      level: Number(l.level) || 0,
      name: l.name || "",
      minXP: Number(l.minXP) || 0,
      maxXP: firstNumber(l.maxXP) ?? null,
      benefits: Array.isArray(l.benefits) ? l.benefits : [],
    }))
    .sort((a, b) => a.level - b.level);
}

export const getVipStatus = (token) => get("/gamification/vip-status", token);

// -> lowercase tier id ("bronze", "silver", ...) or null
export function readVipTier(v) {
  const src = asObject(v);
  const raw = src.tier ?? src.currentTier ?? src.vipTier ?? src.name ?? null;
  const tier =
    typeof raw === "string" ? raw : (raw?.id ?? raw?.name ?? null);
  if (v && !tier) warnShape("vip-status", "no tier field found", v);
  return tier ? String(tier).toLowerCase() : null;
}

/* -------------------------------------------------------------------------- */
/*  Missions                                                                  */
/* -------------------------------------------------------------------------- */

// GET /gamification/missions answers a flat list of the user's mission-progress
// docs (backend controllers/gamification.js getMissions):
//   [{ id, title, description, type, currentValue, targetValue, completed,
//      rewardClaimed, xpReward, pointsReward }]
// `id` is the UserMissionProgress _id, which is what the claim endpoint takes.
// status: "claimed" | "completed" | "" (in progress)
const normalizeMission = (item) => {
  const id = item.id ?? item._id;
  if (!id) warnShape("missions", "no progress `id`; the mission cannot be claimed", item);

  let status = "";
  if (item.rewardClaimed) status = "claimed";
  else if (item.completed) status = "completed";

  return {
    id: id ? String(id) : "",
    claimId: id ? String(id) : "",
    title: item.title || "",
    description: item.description || "",
    type: String(item.type || "").toLowerCase(),
    pointsReward: Number(item.pointsReward) || 0,
    xpReward: Number(item.xpReward) || 0,
    currentValue: Number(item.currentValue) || 0,
    targetValue: Number(item.targetValue) || 0,
    status,
  };
};

export async function getMissions(token) {
  const d = await get("/gamification/missions", token);
  return listOf(d, "missions", "missions").map(normalizeMission);
}

// -> { data, msg }
export const claimMission = (token, missionProgressId) =>
  post(`/gamification/missions/${missionProgressId}/claim`, token);

/* -------------------------------------------------------------------------- */
/*  Leaderboard / referrals / achievements                                    */
/* -------------------------------------------------------------------------- */

// period: "all_time" | "monthly" | "weekly"  ->  { entries, myRank }
export async function getLeaderboard(token, period) {
  const d = await get("/gamification/leaderboard", token, { period });
  const info = asObject(d);
  const me = info.currentUser ?? info.myRank ?? info.userRank ?? info.me ?? null;
  return {
    entries: listOf(d, "leaderboard", "leaderboard", "rankings", "users", "entries"),
    myRank: typeof me === "number" ? me : (me?.rank ?? null),
  };
}

// -> { code, link, total, pointsEarned, referrals[] }
export async function getReferrals(token) {
  const d = await get("/gamification/referrals", token);
  const info = asObject(d);
  const referrals = listOf(d, "referrals", "referrals", "referredUsers", "history");
  return {
    code: info.referralCode || info.code || "",
    link: info.referralLink || info.referralUrl || info.link || "",
    total: firstNumber(info.totalReferrals, info.total, info.count) ?? referrals.length,
    pointsEarned:
      firstNumber(info.totalPointsEarned, info.pointsEarned, info.totalEarned) ??
      referrals.reduce(
        (sum, r) => sum + (Number(r.pointsEarned ?? r.rewardPoints ?? r.points) || 0),
        0,
      ),
    referrals,
  };
}

// Achievement model: { name, description, type, requirementValue, rewardPoints, iconUrl }.
// User progress may be merged in or the definition nested under `achievement`.
const normalizeAchievement = (item, idx) => {
  const nested = asObject(item?.achievement);
  const a = { ...nested, ...item };
  const target = Number(a.requirementValue ?? a.targetValue ?? a.target ?? 0) || 0;
  const current =
    firstNumber(a.currentValue, a.progressValue,
      typeof a.progress === "number" ? a.progress : undefined) ?? 0;
  const status = String(a.status || "").toLowerCase();
  const unlocked =
    Boolean(
      a.unlocked ?? a.isUnlocked ?? a.earned ?? a.isEarned ?? a.completed ??
        a.unlockedAt ?? a.earnedAt,
    ) || ["unlocked", "earned", "completed", "claimed"].includes(status);

  let percent = 0;
  if (unlocked) percent = 100;
  else if (target > 0) percent = Math.min((current / target) * 100, 100);
  else if (typeof a.progress === "number") percent = Math.max(0, Math.min(a.progress, 100));

  return {
    id: nested._id || a._id || a.id || idx,
    name: a.name || a.title || "Achievement",
    description: a.description || "",
    points: Number(a.rewardPoints ?? a.pointsReward ?? a.points ?? 0) || 0,
    iconUrl: a.iconUrl || a.icon || "",
    unlocked,
    current,
    target,
    percent,
    unlockedAt: a.unlockedAt || a.earnedAt || null,
  };
};

export async function getAchievements(token) {
  const d = await get("/gamification/achievements", token);
  return listOf(d, "achievements", "achievements").map(normalizeAchievement);
}

/* -------------------------------------------------------------------------- */
/*  Spin wheel                                                                */
/* -------------------------------------------------------------------------- */

// -> { data, msg }   read `data` with readSpinResult
export const spin = (token) => post("/gamification/spin", token);

// Backend results (SpinHistory.result enum) that grant a boost; only
// 2x_multiplier changes survey points (it becomes a 2x_points boost for 24h).
const BOOST_RESULTS = ["2x_multiplier", "speed_up", "jackpot"];
const RESULT_LABELS = {
  try_again: "No win this time",
  jackpot: "Jackpot",
  "2x_multiplier": "2x Points Boost",
  "1x_multiplier": "1x Multiplier",
  speed_up: "Speed Up",
};

// One spin, from POST /gamification/spin ({ result, pointsAwarded, xpAwarded,
// spinsRemaining }) or a GET /gamification/spin/history entry (same fields plus
// boostApplied and spinDate).
// -> { result, label, won, boostApplied, boostMultiplier, spinsLeft, date }
export function readSpinResult(d, { fromSpin = false } = {}) {
  const src = asObject(d);
  const result = typeof src.result === "string" ? src.result : "";
  const points = Number(src.pointsAwarded) || 0;
  const xp = Number(src.xpAwarded) || 0;

  if (fromSpin && d && typeof src.boostApplied !== "boolean") {
    warnShape(
      "spin",
      "no boostApplied in the spin response; inferring it from `result`",
      d,
    );
  }
  const boostApplied =
    typeof src.boostApplied === "boolean"
      ? src.boostApplied
      : BOOST_RESULTS.includes(result);

  const rewards = [
    points > 0 && `${points.toLocaleString()} points`,
    xp > 0 && `${xp.toLocaleString()} XP`,
  ].filter(Boolean);
  let label = RESULT_LABELS[result] || "";
  if (rewards.length) label = label ? `${label}: ${rewards.join(" + ")}` : rewards.join(" + ");
  if (!label && result) label = result.replace(/_/g, " ");
  if (d && !result) warnShape("spin", "no `result` field", d);

  return {
    result,
    label: label || "Reward",
    won: result !== "try_again" && (points > 0 || xp > 0 || boostApplied),
    boostApplied,
    boostMultiplier: result === "2x_multiplier" ? 2 : null,
    spinsLeft: readSpinsLeft(d),
    date: src.spinDate || src.createdAt || null,
  };
}

export async function getSpinHistory(token) {
  const d = await get("/gamification/spin/history", token);
  return listOf(d, "spin-history", "history", "spins");
}

/* -------------------------------------------------------------------------- */
/*  Marketplace                                                               */
/* -------------------------------------------------------------------------- */

// GET /marketplace/listings answers active listings grouped by type
// (backend controllers/marketplace.js):
//   { premiumUpgrades: Listing[], rewards: Listing[] }
// Listing model: { _id, title, description, type: "discount" | "gift_card" |
//   "premium_upgrade", pointsCost, value, partnerName, imageUrl, stock (-1 = unlimited) }
const normalizeListing = (l) => ({
  ...l,
  _id: String(l._id ?? l.id ?? ""),
  title: l.title || "",
  type: String(l.type || "").toLowerCase(),
  pointsCost: Number(l.pointsCost) || 0,
  stock: firstNumber(l.stock) ?? -1,
});

// -> { rewards, premiumUpgrades }
export async function getListings(token) {
  const d = await get("/marketplace/listings", token);
  const src = asObject(d);
  if (d != null && !Array.isArray(src.rewards)) {
    warnShape("listings", "no `rewards` list in the payload", d);
  }
  return {
    rewards: (Array.isArray(src.rewards) ? src.rewards : []).map(normalizeListing),
    premiumUpgrades: (Array.isArray(src.premiumUpgrades) ? src.premiumUpgrades : [])
      .map(normalizeListing),
  };
}

export async function getWallet(token) {
  const d = await get("/marketplace/wallet", token);
  return listOf(d, "wallet", "vouchers", "wallet");
}

export async function getTransactions(token) {
  const d = await get("/marketplace/transactions", token);
  return listOf(d, "transactions", "transactions");
}

// POST /marketplace/convert takes { pointsToConvert } for a raw cash conversion
// or { listingId } to buy a listing (the backend charges the listing's cost).
// -> { data: { voucher, newBalance }, msg }
export const convertPoints = (token, pointsToConvert) =>
  post("/marketplace/convert", token, { pointsToConvert });

export const buyListing = (token, listingId) =>
  post("/marketplace/convert", token, { listingId });
