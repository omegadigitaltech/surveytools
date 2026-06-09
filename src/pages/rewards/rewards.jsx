import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import useAppStore from "../../store/useAppStore";
import config from "../../config/config";
import "./rewards.css";

// ── Static placeholder data (replace with API responses when endpoints exist) ──
const MARKETPLACE_ITEMS = [
  { id: 1, brand: "WOLSZ GADGETS", name: "Sony XM-1000MHS", cost: 45000, discount: 15, category: "electronics", image: null },
  { id: 2, brand: "FRENZY KITCHEN", name: "Burger, Fries & Can Malt", cost: 8000, discount: 5, category: "food", image: null },
  { id: 3, brand: "AMC", name: "AMC Cinema Tickets", cost: 4500, discount: 20, category: "entertainment", image: null },
  { id: 4, brand: "WOLSZ GADGETS", name: "X-Box Wireless Controller", cost: 25000, discount: 10, category: "electronics", image: null },
];

const PREMIUM_PLANS = [
  {
    id: "pro",
    name: "Pro Member",
    subtitle: "1 Month",
    cost: 5000,
    colorClass: "plan-gold",
    features: ["2x Points multiplier", "Priority Surveys", "No Withdrawal fee"],
  },
  {
    id: "boost",
    name: "Survey Boost",
    subtitle: null,
    cost: 1000,
    colorClass: "plan-blue",
    features: ["Unlock high-paying surveys", "Instant notifications", "Bonus 300 points on start"],
  },
  {
    id: "adfree",
    name: "Ad-Free Pass",
    subtitle: "Lifetime",
    cost: 2000,
    colorClass: "plan-purple",
    features: ["Zero Advertisement", "Faster load time", "Cleaner UI"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "electronics", label: "Electronics" },
  { id: "food", label: "Food & Drink" },
  { id: "entertainment", label: "Entertainment" },
];

const POINTS_PER_NAIRA = 10; // 100 pts = ₦10

// ── Icon components ────────────────────────────────────────────────────────────
const IconWallet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const IconArrows = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const IconShop = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconActivity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconCrown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 4l3 12h14l3-12-6 4-4-8-4 8-6-4z" />
  </svg>
);

const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCopied = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2095d3" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconImage = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PLAN_ICONS = { pro: <IconCrown />, boost: <IconBolt />, adfree: <IconShield /> };

// ── Main component ─────────────────────────────────────────────────────────────
const Rewards = () => {
  const { authToken } = useAuthStore();
  const { pointBalance } = useAppStore();

  const [convertAmount, setConvertAmount] = useState(1000);
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedCode, setCopiedCode] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(null);

  const maxBalance = pointBalance ?? 0;
  const convertedNaira = Math.floor(convertAmount / POINTS_PER_NAIRA);
  const nairaValue = Math.floor(maxBalance / POINTS_PER_NAIRA);

  const filteredItems =
    activeCategory === "all"
      ? MARKETPLACE_ITEMS
      : MARKETPLACE_ITEMS.filter((item) => item.category === activeCategory);

  const activeVouchersCount = vouchers.filter((v) => v.status === "active").length;

  // ── Fetch vouchers + activity ──────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingVouchers(true);
      try {
        const [vRes, aRes] = await Promise.all([
          fetch(`${config.API_URL}/user/vouchers`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${config.API_URL}/user/activity`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVouchers(vData.vouchers ?? []);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setActivities(aData.activities ?? []);
        }
      } catch {
        // degrade silently; sections show empty state
      } finally {
        setIsLoadingVouchers(false);
      }
    };
    fetchData();
  }, [authToken]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGenerateVoucher = async () => {
    if (convertAmount <= 0 || convertAmount > maxBalance || isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`${config.API_URL}/user/vouchers/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ points: convertAmount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to generate voucher");
      toast.success("Voucher generated successfully!");
      setVouchers((prev) => [json.voucher, ...prev]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRedeem = async (itemId) => {
    setIsRedeeming(itemId);
    try {
      const res = await fetch(`${config.API_URL}/marketplace/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ itemId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Redemption failed");
      toast.success("Item redeemed successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsRedeeming(null);
    }
  };

  const handleUnlock = async (planId) => {
    setIsUnlocking(planId);
    try {
      const res = await fetch(`${config.API_URL}/upgrades/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to unlock plan");
      toast.success(`${json.planName || "Plan"} unlocked!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUnlocking(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleAmountInput = (e) => {
    const val = Number(e.target.value);
    setConvertAmount(Math.max(0, Math.min(val, maxBalance)));
  };

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const isGenerateDisabled =
    convertAmount <= 0 || convertAmount > maxBalance || isGenerating;

  return (
    <div className="rewards-page">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="rewards-hero">
        <div className="rewards-hero-inner wrap">
          <span className="rewards-hero-badge">
            <span className="rewards-hero-badge-dot" />
            Rewards Season Is Here
          </span>
          <h1 className="rewards-hero-title">
            Convert Your Points Into{" "}
            <span className="rewards-hero-accent">Real Rewards</span>
          </h1>
          <p className="rewards-hero-sub">
            Your opinion matters, and so do your rewards. Easily exchange your
            hard-earned survey points for cash vouchers, premium subscriptions,
            and exclusive discounts from top partners
          </p>
          <div className="rewards-hero-ctas flex">
            <button className="rewards-btn-primary" onClick={() => scrollTo("quick-convert")}>
              Start Converting →
            </button>
            <button className="rewards-btn-outline" onClick={() => scrollTo("marketplace")}>
              Browse Catalog
            </button>
          </div>
        </div>
      </section>

      <div className="rewards-body wrap">
        {/* ── Balance ──────────────────────────────────────────────────────── */}
        <section className="rewards-balance-card">
          <div className="rewards-balance-top flex">
            <div className="rewards-balance-icon">
              <IconWallet />
            </div>
            <div>
              <p className="rewards-balance-label">Your Balance</p>
              <p className="rewards-balance-sublabel">
                Available to Convert
                <span className="rewards-info-icon" title="Points available for conversion">ⓘ</span>
              </p>
            </div>
          </div>

          <div className="rewards-balance-amount">
            {pointBalance != null ? (
              <>
                <span className="rewards-balance-num">
                  {pointBalance.toLocaleString()}
                </span>
                <span className="rewards-balance-unit"> pts</span>
              </>
            ) : (
              <span className="rewards-spinner-sm" />
            )}
          </div>

          <div className="rewards-naira-tag">
            ≈ ₦{nairaValue.toLocaleString()} Value
          </div>

          <button className="rewards-convert-btn" onClick={() => scrollTo("quick-convert")}>
            Convert Points Now
          </button>
          <p className="rewards-rate-note">Conversion rate: 100pts = ₦10</p>
        </section>

        {/* ── Quick Convert ─────────────────────────────────────────────────── */}
        <section className="rewards-card" id="quick-convert">
          <div className="rewards-card-header flex">
            <span className="rewards-card-icon"><IconArrows /></span>
            <div className="flex-1">
              <h2 className="rewards-card-title">Quick Convert</h2>
              <p className="rewards-card-sub">Turn into cash Vouchers instantly</p>
            </div>
            <span
              className="rewards-info-icon"
              title="Convert points into a cash voucher redeemable at partner stores"
            >ⓘ</span>
          </div>

          <div className="rewards-qc-body flex">
            {/* Input + slider */}
            <div className="rewards-qc-left">
              <div className="rewards-qc-label-row flex">
                <label className="rewards-qc-label">Amount to Convert</label>
                <button
                  className="rewards-max-btn"
                  onClick={() => setConvertAmount(maxBalance)}
                >
                  Max ({maxBalance.toLocaleString()})
                </button>
              </div>
              <div className="rewards-pts-input flex">
                <input
                  type="number"
                  value={convertAmount}
                  onChange={handleAmountInput}
                  min={0}
                  max={maxBalance}
                  className="rewards-amount-field"
                />
                <span className="rewards-pts-unit">pts</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxBalance || 12500}
                value={convertAmount}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="rewards-slider"
              />
              <div className="rewards-slider-marks flex">
                <span>0</span>
                <span>{Math.floor((maxBalance || 12500) / 2).toLocaleString()}</span>
                <span>{(maxBalance || 12500).toLocaleString()}</span>
              </div>
            </div>

            {/* Result */}
            <div className="rewards-qc-result">
              <p className="rewards-result-label">YOU WILL RECEIVE</p>
              <div className="rewards-result-amount flex">
                <span className="rewards-result-currency">₦</span>
                <span className="rewards-result-value">{convertedNaira.toLocaleString()}</span>
              </div>
              <span className="rewards-result-badge flex">
                <IconCheck />
                Instantly Available
              </span>
            </div>
          </div>

          <button
            className={`rewards-generate-btn${isGenerateDisabled ? " inactive" : ""}`}
            onClick={handleGenerateVoucher}
            disabled={isGenerateDisabled}
          >
            {isGenerating ? "Generating..." : "Generate Voucher →"}
          </button>
        </section>

        {/* ── Rewards Marketplace ───────────────────────────────────────────── */}
        <section className="rewards-card" id="marketplace">
          <div className="rewards-card-header flex">
            <span className="rewards-card-icon"><IconShop /></span>
            <div className="flex-1">
              <h2 className="rewards-card-title">Rewards Marketplace</h2>
              <p className="rewards-card-sub">Exchange points directly for discounted products</p>
            </div>
            {/* Category tabs */}
            <div className="rewards-cat-tabs flex">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`rewards-cat-tab${activeCategory === cat.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rewards-market-grid">
            {filteredItems.map((item) => (
              <div className="rewards-market-card" key={item.id}>
                <span className="rewards-discount-badge">{item.discount}% OFF</span>
                <div className="rewards-market-img">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="rewards-img-placeholder">
                      <IconImage />
                    </div>
                  )}
                </div>
                <div className="rewards-market-info">
                  <p className="rewards-market-brand">{item.brand}</p>
                  <p className="rewards-market-name">{item.name}</p>
                  <div className="rewards-market-footer flex">
                    <div>
                      <p className="rewards-cost-label">Cost</p>
                      <p className="rewards-cost-val">₦ {item.cost.toLocaleString()}</p>
                    </div>
                    <button
                      className="rewards-redeem-item-btn"
                      onClick={() => handleRedeem(item.id)}
                      disabled={isRedeeming === item.id}
                    >
                      {isRedeeming === item.id ? "..." : "Redeem"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Premium Upgrades ─────────────────────────────────────────────── */}
        <section className="rewards-card">
          <div className="rewards-card-header flex">
            <span className="rewards-card-icon rewards-card-icon--star">✨</span>
            <div>
              <h2 className="rewards-card-title">Premium Upgrades</h2>
              <p className="rewards-card-sub">Enhancing your earning experience with exclusive perks</p>
            </div>
          </div>

          <div className="rewards-plans-grid">
            {PREMIUM_PLANS.map((plan) => (
              <div className={`rewards-plan-card ${plan.colorClass}`} key={plan.id}>
                <div className="rewards-plan-top flex">
                  <span className="rewards-plan-icon">{PLAN_ICONS[plan.id]}</span>
                  <div className="rewards-plan-cost-box">
                    <span className="rewards-plan-cost-label">COST</span>
                    <span className="rewards-plan-cost-val">{plan.cost.toLocaleString()} pts</span>
                  </div>
                </div>
                <h3 className="rewards-plan-name">{plan.name}</h3>
                {plan.subtitle && <p className="rewards-plan-subtitle">{plan.subtitle}</p>}
                <ul className="rewards-plan-features">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex">
                      <span className="rewards-check-icon"><IconCheck /></span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className="rewards-unlock-btn"
                  onClick={() => handleUnlock(plan.id)}
                  disabled={isUnlocking === plan.id}
                >
                  {isUnlocking === plan.id ? "Unlocking..." : "Unlock Now"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Voucher Wallet ───────────────────────────────────────────────── */}
        <section className="rewards-card">
          <div className="rewards-card-header flex">
            <span className="rewards-card-icon"><IconWallet /></span>
            <div className="flex-1">
              <h2 className="rewards-card-title">Voucher Wallet</h2>
              <p className="rewards-card-sub">Your generated and redeemed rewards</p>
            </div>
            {activeVouchersCount > 0 && (
              <span className="rewards-wallet-count">{activeVouchersCount} Active</span>
            )}
          </div>

          {isLoadingVouchers ? (
            <div className="rewards-loading-row flex">
              <span className="rewards-spinner" />
              <span>Loading vouchers...</span>
            </div>
          ) : vouchers.length === 0 ? (
            <p className="rewards-empty-msg">
              No vouchers yet. Convert your points above to generate one!
            </p>
          ) : (
            <div className="rewards-voucher-list">
              {vouchers.map((v) => (
                <div className="rewards-voucher-card" key={v._id || v.code}>
                  <div className="rewards-voucher-top flex">
                    <span className="rewards-voucher-reward-label">REWARD</span>
                    <span
                      className={`rewards-voucher-status ${
                        v.status === "active" ? "status-active" : "status-used"
                      }`}
                    >
                      {v.status === "active" ? "Active" : "Used"}
                    </span>
                  </div>
                  <h3 className="rewards-voucher-title">
                    ₦{(v.amount ?? 0).toLocaleString()} Cash Voucher
                  </h3>
                  <div className="rewards-code-row flex">
                    <div className="rewards-code-box">
                      <p className="rewards-code-label">Voucher Code</p>
                      <p className="rewards-code-value">{v.code}</p>
                    </div>
                    <button
                      className="rewards-copy-btn"
                      onClick={() => handleCopyCode(v.code)}
                      title="Copy code"
                    >
                      {copiedCode === v.code ? <IconCopied /> : <IconCopy />}
                    </button>
                  </div>
                  <p className="rewards-voucher-date">
                    Generated{" "}
                    {v.createdAt
                      ? new Date(v.createdAt).toLocaleDateString("en-GB")
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Activity ──────────────────────────────────────────────── */}
        <section className="rewards-card rewards-card--last">
          <div className="rewards-card-header flex">
            <span className="rewards-card-icon"><IconActivity /></span>
            <div className="flex-1">
              <h2 className="rewards-card-title">Recent Activity</h2>
              <p className="rewards-card-sub">Track your points, Earnings and Spending</p>
            </div>
            <Link to="/notifications" className="rewards-view-all">
              View All ...
            </Link>
          </div>

          {activities.length === 0 ? (
            <p className="rewards-empty-msg">No recent activity to display.</p>
          ) : (
            <div className="rewards-activity-list">
              {activities.slice(0, 5).map((act, i) => (
                <div className="rewards-activity-row flex" key={i}>
                  <div
                    className={`rewards-activity-icon ${
                      act.type === "earn" ? "icon-earn" : "icon-spend"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      {act.type === "earn" ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                  </div>
                  <div className="rewards-activity-info flex-1">
                    <p className="rewards-activity-name">{act.description}</p>
                    <div className="flex rewards-activity-meta">
                      <span className="rewards-activity-date">
                        {act.date
                          ? new Date(act.date).toLocaleDateString("en-GB")
                          : "—"}
                      </span>
                      <span className="rewards-activity-badge status-active-dot">
                        Completed
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rewards-activity-pts ${
                      act.type === "earn" ? "pts-earn" : "pts-spend"
                    }`}
                  >
                    {act.type === "earn" ? "+" : "-"}
                    {Math.abs(act.points).toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Rewards;
