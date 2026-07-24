import React from "react";
import { Link } from "react-router-dom";

export default function DashboardMain({ pointBalance, stats }) {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col md:flex-row md:items-center items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Respond to surveys and earn rewards
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* <Link to="/create-form" className="text-red-500 hover:underline text-sm font-semibold">
            Create A Form
          </Link> */}
          <Link
            to="/postsurvey"
            className="bg-[#00A5B5] hover:bg-[#008F9C] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow flex items-center gap-2"
          >
            <span className="material-icons text-sm">edit</span> Create
            Questionnaire
          </Link>
        </div>
      </div>

      <div className="point-boost bg-gradient-to-r from-[#008303] to-[#0096B8] rounded-2xl p-10 text-white flex flex-col md:flex-row justify-between items-center shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-4 z-10 relative">
          <div className="boost-icon w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="material-icons text-white text-2xl">bolt</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">2x Points Boost Active</h2>
            <p className="text-sm opacity-90">
              Complete Surveys now to earn double points
            </p>
          </div>
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg font-mono font-bold tracking-wider mt-4 md:mt-0 z-10 relative flex items-center gap-2">
          <span className="material-icons text-sm">schedule</span> 01 : 37 : 06
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-[-50px] top-[-50px] w-48 h-48 bg-white/10 rounded-full"></div>
      </div>

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
                {pointBalance ? pointBalance.toLocaleString() : "2,450"}
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
                Level {stats?.currentLevel || 1}
              </p>
              <h3 className="dsh_level text-xl font-bold text-gray-800">
                {stats?.levelName || "Novice"}
              </h3>
            </div> 
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
              <span>
                {stats?.currentXP || 0} / {stats?.nextLevelXP || 1000} XP
              </span>
              <span className="text-purple-600">
                {Math.min(
                  ((stats?.currentXP || 0) / (stats?.nextLevelXP || 1000)) *
                    100,
                  100,
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{
                  width: `${Math.min(((stats?.currentXP || 0) / (stats?.nextLevelXP || 1000)) * 100, 100)}%`,
                }}
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
                {stats?.currentStreak || 0} Days
              </h3>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
              // Simple logic to show a few green days based on streak for visual effect
              const isStreakDay = idx < (stats?.currentStreak || 0) % 7;
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isStreakDay ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}
                  >
                    <span className="material-icons text-[14px]">
                      local_fire_department
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
