import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../store/useAuthStore";
import useAppStore from "../../store/useAppStore";
import { toast } from "react-toastify";

const Rewards = () => {
  const [activeTab, setActiveTab] = useState("missions");
  const { token } = useAuthStore();
  const { pointBalance } = useAppStore();
  
  return (
    <div className="p-4 md:p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-8  mb-6">
          <button
            onClick={() => setActiveTab("missions")}
            className={`pb-2 px-2 flex items-center gap-2 ${
              activeTab === "missions"
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="material-icons text-sm">track_changes</span>
            Missions
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`pb-2 px-2 flex items-center gap-2 ${
              activeTab === "levels"
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="material-icons text-sm">trending_up</span>
            Levels
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`pb-2 px-2 flex items-center gap-2 ${
              activeTab === "marketplace"
                ? "border-b-2 border-black font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="material-icons text-sm">storefront</span>
            Marketplace
          </button>
        </div>

        {activeTab === "missions" && <MissionsTab token={token} />}
        {activeTab === "levels" && <LevelsTab token={token} />}
        {activeTab === "marketplace" && <MarketplaceTab token={token} pointBalance={pointBalance} />}
      </div>
    </div>
  );
};

const MissionsTab = ({ token }) => {
  const [missionsType, setMissionsType] = useState("daily");
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await axios.get("http://localhost:1574/gamification/missions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMissions(res.data.data || []);
      } catch (err) {
        console.error("Error fetching missions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchMissions();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Missions and Challenges</h1>
      <p className="text-gray-500 text-sm mb-6">Complete missions to earn bonus points and rewards</p>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMissionsType("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            missionsType === "daily"
              ? "bg-[#00A5B5] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Daily Missions <span className="bg-white/20 px-2 rounded-full text-xs">4</span>
        </button>
        <button
          onClick={() => setMissionsType("weekly")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            missionsType === "weekly"
              ? "bg-[#00A5B5] text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Weekly Challenge <span className="bg-white/20 px-2 rounded-full text-xs">4</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 py-8 text-center text-gray-500">Loading missions...</div>
        ) : missions.length === 0 ? (
          <div className="col-span-1 md:col-span-2 py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="material-icons text-4xl mb-2 opacity-50">track_changes</span>
            <p className="font-semibold text-lg">No missions available right now.</p>
            <p className="text-sm mt-1">Check back later for new challenges!</p>
          </div>
        ) : (
          missions.map((mission) => (
            <MissionCard 
              key={mission._id} 
              title={mission.title} 
              desc={mission.description} 
              points={mission.pointsReward} 
              progress={mission.currentValue || 0} 
              total={mission.targetValue} 
            />
          ))
        )}
      </div>

      <div className="mt-6 bg-[#009E96] text-white p-6 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Complete all {missionsType === "daily" ? "Daily Missions" : "Weekly Missions"}</h3>
          <p className="text-sm opacity-90 mt-1">Earn a bonus of <span className="text-yellow-300 font-bold">500 points</span> when you complete all {missionsType} missions!</p>
        </div>
        <div className="bg-white/20 w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold">
          <span className="text-2xl">1</span>
          <span className="text-[10px]">of 4 complete</span>
        </div>
      </div>
    </div>
  );
};

const MissionCard = ({ title, desc, points, progress, total }) => {
  const percent = Math.min((progress / total) * 100, 100);
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg w-2/3 leading-tight">{title}</h3>
          <div className="bg-blue-50 text-blue-500 px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1">
            <span className="material-icons text-sm">stars</span> + {points}
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">{desc}</p>
      </div>
      <div>
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-gray-500">Progress</span>
          <span>{progress}/{total}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#00A5B5] rounded-full" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const LevelsTab = ({ token }) => {
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get("http://localhost:1574/gamification/levels", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLevels(res.data.data || []);
      } catch (err) {
        console.error("Error fetching levels:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchLevels();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Levels and Progression</h1>
      <p className="text-gray-500 text-sm mb-6">Track your progress and unlock exclusive benefits</p>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-gradient-to-br from-[#00D16B] to-[#007D8C] text-white p-6 rounded-2xl relative overflow-hidden">
          <div className="text-sm opacity-80 mb-1">Current Level</div>
          <h2 className="text-3xl font-bold mb-1 relative z-10">Level 2 - Explorer</h2>
          <p className="text-sm opacity-80 mb-6 relative z-10">Keep earning XP to reach the next level</p>
          
          <div className="relative z-10">
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Progress to level 3</span>
              <span>500 / 2000 XP</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-white rounded-full" style={{ width: '25%' }}></div>
            </div>
            <p className="text-xs opacity-80">2000 XP needed to unlock Achiever</p>
          </div>
          
          {/* Abstract background shape */}
          <div className="absolute right-[-20px] top-[20px] opacity-20">
            <span className="material-icons" style={{ fontSize: '150px' }}>trending_up</span>
          </div>
        </div>

        <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="material-icons text-[#00A5B5]">workspace_premium</span> Current Benefits
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="material-icons text-green-500 text-lg">check_circle</span>
              Access to premium surveys
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="material-icons text-green-500 text-lg">check_circle</span>
              1.0 x points multiplier
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="material-icons text-green-500 text-lg">check_circle</span>
              Weekly bonus mission
            </li>
          </ul>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">All Levels</h3>
      <div className="space-y-4 mb-8">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading levels...</div>
        ) : levels.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
            <span className="material-icons text-4xl mb-2 opacity-50">trending_up</span>
            <p className="font-semibold text-lg">No levels available right now.</p>
            <p className="text-sm mt-1">Check back later for progression updates!</p>
          </div>
        ) : (
          levels.map((lvl, idx) => (
            <div key={lvl._id || idx} className={`p-4 rounded-xl border flex items-center gap-4 border-gray-200 bg-white`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gray-400`}>
                <span className="material-icons">star</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold">Level {lvl.level} - {lvl.name}</h4>
                </div>
                <p className="text-xs text-gray-500 mb-2">Unlocked at {lvl.minXP} xp</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  {(lvl.benefits || []).map((b, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="material-icons text-[14px] text-gray-400">check_circle_outline</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <h3 className="text-xl font-bold mb-4">VIP Tier System</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "Bronze", points: "0 - 1000", color: "bg-yellow-600", border: "border-gray-200" },
          { name: "Silver", points: "1001 - 5000", color: "bg-gray-400", border: "border-yellow-400 border-2" },
          { name: "Gold", points: "5001 - 10000", color: "bg-yellow-500", border: "border-gray-200" },
          { name: "Platinum", points: "10001 - 15000", color: "bg-purple-500", border: "border-gray-200" }
        ].map((tier, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-4 flex flex-col items-center text-center ${tier.border}`}>
            <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center text-white mb-3`}>
              <span className="material-icons text-xl">{tier.name === 'Bronze' ? 'military_tech' : tier.name === 'Silver' ? 'star' : tier.name === 'Gold' ? 'workspace_premium' : 'diamond'}</span>
            </div>
            <h4 className="font-bold">{tier.name}</h4>
            <p className="text-[10px] text-gray-500 mb-4">{tier.points} points earned</p>
            <ul className="text-left text-[11px] text-gray-600 space-y-2 w-full">
              <li className="flex gap-1"><span className="material-icons text-[14px] text-gray-400">check_circle_outline</span> Faster conversion rate</li>
              <li className="flex gap-1"><span className="material-icons text-[14px] text-gray-400">check_circle_outline</span> 2% bonus on rewards</li>
              <li className="flex gap-1"><span className="material-icons text-[14px] text-gray-400">check_circle_outline</span> Standard support</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const MarketplaceTab = ({ token, pointBalance }) => {
  const [listings, setListings] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const [listingsRes, walletRes] = await Promise.all([
          axios.get("http://localhost:1574/marketplace/listings", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } })),
          axios.get("http://localhost:1574/marketplace/wallet", { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { data: [] } }))
        ]);
        setListings(listingsRes.data.data || []);
        setWallet(walletRes.data.data || []);
      } catch (err) {
        console.error("Error fetching marketplace:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchMarketplace();
  }, [token]);

  return (
    <div>
      <div 
        className="text-white p-8 rounded-2xl mb-6 flex justify-between items-center relative overflow-hidden bg-cover bg-center"
        style={{ 
            backgroundImage: "linear-gradient(to right, rgba(11, 148, 83, 0.9), rgba(1, 94, 49, 0.9)), url('/rewards-bg.jpg')",
        }}
      >
        <div className="relative z-10 w-2/3">
          <span className="bg-white/20 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wide inline-block mb-3">Rewards Season is Here</span>
          <h1 className="text-3xl font-bold mb-3">Convert Your Points Into <span className="text-[#00D16B]">Real</span> Rewards</h1>
          <p className="text-sm opacity-90 mb-6 w-[80%]">Your opinion matters, and so do your rewards. Easily exchange your hard-earned survey points for cash vouchers, premium subscriptions, and exclusive discounts from top partners!</p>
          <div className="flex gap-4">
            <button className="bg-[#00A5B5] hover:bg-[#008F9C] transition-colors border border-white/30 text-white px-6 py-2 rounded font-semibold text-sm">Start Converting &rarr;</button>
            <button className="bg-transparent border border-white/50 text-white px-6 py-2 rounded font-semibold text-sm hover:bg-white/10 transition-colors">Browse Catalog</button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-30" style={{ background: "radial-gradient(circle, #00D16B 0%, transparent 70%)" }}></div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <span className="material-icons">account_balance_wallet</span>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-600 font-semibold text-sm">Your Balance <span className="material-icons text-sm">info</span></div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-bold">{pointBalance ? pointBalance.toLocaleString() : "0"}</span> <span className="text-gray-500 font-semibold mb-1">pts</span>
              </div>
              <div className="mt-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-semibold inline-flex items-center gap-1">
                <span className="material-icons text-[14px]">trending_up</span> ~ #1,250 Value
              </div>
            </div>
          </div>
        </div>
        <button className="w-full bg-[#00A5B5] text-white py-3 rounded-lg font-bold">Convert Points Now</button>
        <p className="text-center text-xs text-gray-500 mt-2">Conversion rate: 100pts = #10</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
              <span className="material-icons text-sm">currency_exchange</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Quick Convert</h3>
              <p className="text-xs text-gray-500">Turn into cash vouchers instantly <span className="material-icons text-[12px]">info</span></p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full">
             <div className="flex justify-between text-xs font-semibold mb-2 text-gray-600">
               <span>Amount to Convert</span>
               <span className="text-blue-500">Max (12,500)</span>
             </div>
             <div className="border border-gray-200 rounded p-3 flex justify-between items-center">
               <span className="font-bold text-lg">1000</span>
               <span className="text-gray-400 font-semibold">pts</span>
             </div>
             <div className="mt-4">
                <input type="range" min="0" max="12500" defaultValue="1000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0</span>
                  <span>6250</span>
                  <span>12500</span>
                </div>
             </div>
          </div>
          <div className="hidden md:flex justify-center items-center">
             <span className="material-icons text-gray-300 transform rotate-90 md:rotate-0">sync_alt</span>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-6 flex flex-col items-center justify-center w-full">
            <span className="text-xs font-bold text-green-600 mb-1 uppercase">You will receive</span>
            <span className="text-3xl font-bold text-green-700 mb-2"># 100</span>
            <span className="text-xs text-green-600 flex items-center gap-1 bg-white px-2 py-1 rounded-full"><span className="material-icons text-[14px]">check_circle</span> Instantly Available</span>
          </div>
        </div>
        <button className="w-full bg-[#00A5B5] text-white py-3 rounded-lg font-bold mt-6 flex justify-center items-center gap-1">Generate Voucher <span className="material-icons text-sm">chevron_right</span></button>
      </div>

      <div className="mb-8">
         <div className="flex justify-between items-center mb-4">
           <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="material-icons text-[#00A5B5]">storefront</span> Rewards Marketplace
           </h3>
           <div className="flex gap-2">
              <button className="bg-[#00A5B5] text-white text-xs px-3 py-1 rounded font-semibold">All</button>
              <button className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded font-semibold">Electronics</button>
              <button className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded font-semibold">Food & Drink</button>
           </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-1 md:col-span-2 py-8 text-center text-gray-500">Loading marketplace listings...</div>
            ) : listings.length === 0 ? (
              <div className="col-span-1 md:col-span-2 py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                <span className="material-icons text-4xl mb-2 opacity-50">storefront</span>
                <p className="font-semibold text-lg">No listings available right now.</p>
                <p className="text-sm mt-1">Check back later for new rewards to redeem!</p>
              </div>
            ) : (
              listings.map((item) => (
                <MarketplaceItem key={item._id} title={item.title} category={item.partnerName || "REWARD"} cost={item.pointsCost} discount={item.value || ""} />
              ))
            )}
         </div>
      </div>

      <div>
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
           <span className="material-icons text-yellow-500">auto_awesome</span> Premium Upgrades
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UpgradeItem title="Pro Member" cost="5000" duration="1 Month" color="text-green-500" border="border-green-400" icon="workspace_premium" />
          <UpgradeItem title="Survey Boost" cost="1000" duration="7 Days" color="text-blue-500" border="border-blue-400 border-2 border-dashed" icon="bolt" />
          <UpgradeItem title="Ad-Free Pass" cost="2000" duration="Lifetime" color="text-purple-500" border="border-purple-400" icon="shield" />
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
           <span className="material-icons text-purple-500">local_activity</span> Voucher Wallet
           <span className="ml-auto bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded font-bold">{wallet.length} Active</span>
        </h3>
        {wallet.length === 0 ? (
          <div className="py-8 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
             <p className="font-semibold">Your wallet is empty</p>
             <p className="text-xs mt-1">Convert your points into vouchers to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wallet.map((voucher, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 border-dashed relative">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <div className="text-xs text-gray-500 font-semibold mb-1">REWARD</div>
                     <div className="font-bold text-lg">{voucher.title || "Reward Voucher"}</div>
                   </div>
                   <div className="bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-bold border border-green-200 flex items-center gap-1"><span className="material-icons text-[12px]">check_circle</span> Active</div>
                 </div>
                 <div>
                   <div className="text-xs text-gray-500 mb-1">Voucher Code</div>
                   <div className="bg-gray-100 p-2 rounded text-center font-mono font-bold tracking-widest text-lg flex justify-between items-center">
                     {voucher.code || "XXX-YYY-ZZZ"}
                     <span className="material-icons text-gray-400 text-sm cursor-pointer hover:text-gray-600">content_copy</span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MarketplaceItem = ({ title, category, cost, discount, img }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
       <div className="h-40 bg-gray-200 relative">
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">{discount}</div>
          {/* Using a placeholder background or an image */}
          <div className="w-full h-full bg-slate-800 flex items-center justify-center opacity-80">
            <span className="material-icons text-white text-4xl opacity-50">image</span>
          </div>
       </div>
       <div className="p-4 flex-1 flex flex-col justify-between">
         <div>
           <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{category}</div>
           <h4 className="font-bold text-sm mb-4 leading-tight">{title}</h4>
         </div>
         <div className="flex justify-between items-end">
           <div>
             <div className="text-[10px] text-gray-500">Cost</div>
             <div className="font-bold text-sm">{cost} pts</div>
           </div>
           <button className="text-[#00A5B5] bg-blue-50 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#00A5B5] hover:text-white transition-colors">Redeem</button>
         </div>
       </div>
    </div>
  );
}

const UpgradeItem = ({ title, cost, duration, color, border, icon }) => {
  return (
    <div className={`bg-white p-4 rounded-xl border ${border} relative`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${color}`}>
          <span className="material-icons">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 font-semibold uppercase">Cost</div>
          <div className="font-bold text-sm">{cost} <span className="text-xs text-gray-500">pts</span></div>
        </div>
      </div>
      <h4 className="font-bold mb-1">{title}</h4>
      <div className="text-xs text-gray-500 mb-4">{duration}</div>
      <button className={`w-full py-2 rounded border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50`}>Unlock Now</button>
    </div>
  )
}

export default Rewards;
