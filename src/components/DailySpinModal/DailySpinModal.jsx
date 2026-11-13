import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';
import useAppStore from '../../store/useAppStore';
import useDashboardStore from '../../store/useDashboardStore';
import * as api from '../../pages/rewards/rewardsApi';

const SPIN_DURATION_MS = 3000; // matches the CSS transition on the wheel

const isToday = (d) => {
  if (!d) return false;
  const date = new Date(d);
  return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
};

const DailySpinModal = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinRemaining, setSpinRemaining] = useState(1);
  const { authToken } = useAuthStore();
  const { setPointBalance } = useAppStore();
  const bumpStatsVersion = useDashboardStore((s) => s.bumpStatsVersion);
  // The latest spin's result, shown under the button (boost message lives here)
  const [lastResult, setLastResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const mounted = useRef(true);
  const timer = useRef(null);
  const hasSpun = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  // Load spins left (dashboard) and past spins (history) when the modal opens
  useEffect(() => {
    if (!authToken) return;
    setHistoryLoading(true);
    setHistoryError(null);

    Promise.allSettled([
      api.getDashboard(authToken),
      api.getSpinHistory(authToken),
    ]).then(([dashRes, histRes]) => {
      if (!mounted.current) return;

      const entries = histRes.status === 'fulfilled' ? histRes.value : [];
      setHistoryError(histRes.status === 'rejected' ? histRes.reason : null);
      setHistory(entries);
      setHistoryLoading(false);

      // Don't overwrite the count if the user has already spun while this loaded
      if (hasSpun.current) return;
      const fromDashboard = api.readSpinsLeft(dashRes.value);
      if (fromDashboard !== undefined) {
        setSpinRemaining(fromDashboard);
      } else if (entries.length > 0) {
        // No count from the backend: assume one spin a day and check today's history
        const spunToday = entries.some((e) => isToday(api.readSpinResult(e).date));
        if (spunToday) setSpinRemaining(0);
      }
    });
  }, [authToken]);

  const handleSpin = async () => {
    if (spinRemaining <= 0) {
      toast.error("No spins remaining today!");
      return;
    }

    hasSpun.current = true;
    setLastResult(null);
    setSpinning(true);
    const startedAt = Date.now();
    // Add extra rotations for effect
    const newRotation = rotation + 1440 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    // Let the wheel finish turning before showing the result, however fast the API answers
    const afterSpin = (fn) => {
      const wait = Math.max(0, SPIN_DURATION_MS - (Date.now() - startedAt));
      timer.current = setTimeout(() => {
        if (mounted.current) fn();
      }, wait);
    };

    try {
      const { data } = await api.spin(authToken);

      afterSpin(() => {
        setSpinning(false);
        const spun = api.readSpinResult(data, { fromSpin: true });
        setLastResult(spun);

        setSpinRemaining((prev) =>
          spun.spinsLeft !== undefined ? spun.spinsLeft : Math.max(0, prev - 1),
        );

        if (spun.won) toast.success(`You won: ${spun.label}`);
        else toast.info(`${spun.label}. Come back tomorrow for another spin!`);
        setHistory((prev) => [
          { ...data, _id: `local-${Date.now()}`, spinDate: new Date().toISOString() },
          ...prev,
        ]);

        // Winnings change the balance, XP and boosts: re-sync them
        bumpStatsVersion();
        api
          .getPoints(authToken)
          .then((value) => {
            if (typeof value === 'number' && mounted.current) setPointBalance(value);
          })
          .catch(() => {});
      });
    } catch (err) {
      afterSpin(() => {
        setSpinning(false);
        const message = err.status ? err.message : '';
        // "Already spun today" style answers mean there is nothing left to try
        if (err.status === 429 || /already|no spins|limit|used all/i.test(message)) {
          setSpinRemaining(0);
        }
        toast.error(message || "Failed to spin. Try again.");
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm relative max-h-[calc(100vh-2rem)] overflow-y-auto border-4 border-[#00A5B5] shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 z-10"
        >
          <span className="material-icons text-gray-500 text-sm">close</span>
        </button>

        <div className="p-6 pb-2 text-center">
          <div className="w-16 h-16 bg-[#00A5B5] rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-[#00A5B5]/30">
            <span className="material-icons text-3xl">auto_awesome</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Daily Wheel Spin</h2>
          <p className="text-sm text-gray-500 mb-6">Spin the wheel to get amazing rewards</p>
        </div>

        <div className="relative w-64 h-64 mx-auto mb-6">
          {/* Wheel Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-[#00A5B5]">
            <span className="material-icons text-4xl">arrow_drop_down</span>
          </div>

          {/* Wheel Container */}
          <div
            className="w-full h-full rounded-full border-4 border-gray-200 overflow-hidden relative shadow-inner"
            style={{
              transition: 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              transform: `rotate(${rotation}deg)`
            }}
          >
            {/* The wheel is split into 8 sections. For simplicity, we use conic-gradient */}
            <div className="w-full h-full rounded-full"
                 style={{
                   background: 'conic-gradient(#007D8C 0deg 45deg, #00A5B5 45deg 90deg, #F3F4F6 90deg 135deg, #00D16B 135deg 180deg, #EAB308 180deg 225deg, #00A5B5 225deg 270deg, #F3F4F6 270deg 315deg, #00D16B 315deg 360deg)'
                 }}
            ></div>

            {/* Inner Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-md">
               <span className="material-icons text-[#00A5B5] text-sm">auto_awesome</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <button
            onClick={handleSpin}
            disabled={spinning || spinRemaining <= 0}
            className={`w-full py-3 rounded-lg font-bold text-white text-lg shadow-lg mb-3 ${spinning || spinRemaining <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00A5B5] hover:bg-[#008F9C]'}`}
          >
            {spinning ? 'Spinning...' : 'Spin Now'}
          </button>
          <div className="text-sm text-gray-500 font-semibold mb-4">Spin remaining : {spinRemaining}</div>

          {lastResult?.boostApplied && (
            <div className="flex items-start gap-2 text-xs text-left text-white bg-gradient-to-r from-[#008303] to-[#0096B8] p-3 rounded-lg mb-3">
              <span className="material-icons text-sm">bolt</span>
              <p>
                {lastResult.boostMultiplier ? (
                  <>
                    <span className="font-bold">{lastResult.boostMultiplier}x Points Boost activated!</span>{' '}
                    Points from surveys you complete in the next 24 hours are multiplied by {lastResult.boostMultiplier}.
                  </>
                ) : (
                  <>
                    <span className="font-bold">Boost applied!</span> It has been added to your account.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-left bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="material-icons text-yellow-500 text-sm">lightbulb</span>
            <p><span className="font-bold">Tip:</span> Come back daily to spin the wheel and win more rewards</p>
          </div>

          {/* Spin history */}
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="mt-3 text-xs font-semibold text-[#00A5B5] hover:underline inline-flex items-center gap-1"
          >
            <span className="material-icons text-sm">history</span>
            {showHistory ? 'Hide spin history' : 'View spin history'}
          </button>
          {showHistory && (
            <div className="mt-2 text-left text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 max-h-40 overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 text-gray-500 py-2">
                  <span className="material-icons animate-spin text-sm">refresh</span>
                  Loading history...
                </div>
              ) : historyError ? (
                <p className="text-center text-gray-500 py-2">
                  Couldn't load your spin history.{' '}
                  {historyError.status
                    ? `${historyError.message} (${historyError.status})`
                    : 'Please check your connection.'}
                </p>
              ) : history.length === 0 ? (
                <p className="text-center text-gray-500 py-2">
                  No spins yet. Take your first spin to see it here!
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((h, i) => {
                    const { label, date: when } = api.readSpinResult(h);
                    return (
                      <li
                        key={h._id || h.id || i}
                        className="flex items-center justify-between gap-2 border-b border-gray-100 last:border-0 pb-2 last:pb-0"
                      >
                        <span className="font-semibold text-gray-700 min-w-0 truncate">{label}</span>
                        {when && (
                          <span className="text-gray-400 flex-shrink-0">
                            {new Date(when).toLocaleDateString('en-GB')}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySpinModal;
