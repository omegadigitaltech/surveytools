import { Flame, Trophy, Star, FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";

export default function DashboardMain() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex gap-4">
          <button className="text-sm text-green-600 hover:underline">
            Create a Form
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-blue-700">
            Create Questionnaire
          </button>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level card */}
        <div className="rounded-2xl p-6 text-white bg-linear-to-r from-green-700 to-green-400 shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">Current Level</p>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6" /> Level 2
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Next Level</p>
              <p className="text-xl font-semibold">500 pts</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full h-2 bg-white/30 rounded-full">
              <div className="h-2 w-1/2 bg-white rounded-full" />
            </div>
            <p className="text-xs mt-2 opacity-80">0 / 500 XP</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <Star className="w-4 h-4 text-white/50" />
            </div>
            <button className="text-xs underline">Leaderboard</button>
          </div>
        </div>

        {/* Streak card */}
        <div className="rounded-2xl p-6 bg-sky-500 text-white shadow">
          <div className="flex justify-between">
            <div>
              <p className="text-sm opacity-80">Current Streak</p>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <Flame className="w-6 h-6" /> 7 days
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Best Streak</p>
              <p className="text-xl font-semibold">12 days</p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  ✓
                </div>
                <span className="text-xs mt-1">{d}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-4 opacity-90">
            Complete a survey today to keep your streak alive!
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Available Surveys" value="12" icon={FileText} />
        <StatCard title="Active Surveys" value="6" icon={Clock} />
        <StatCard title="Completed Surveys" value="12" icon={CheckCircle} />
        <StatCard title="Trending Surveys" value="2" icon={TrendingUp} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className="p-3 rounded-full bg-gray-100">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
