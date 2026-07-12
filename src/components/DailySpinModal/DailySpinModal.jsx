import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/useAuthStore';
import config from '../../config/config';

const DailySpinModal = ({ onClose }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinRemaining, setSpinRemaining] = useState(1);
  const { authToken } = useAuthStore();

  const handleSpin = async () => {
    if (spinRemaining <= 0) {
      toast.error("No spins remaining today!");
      return;
    }

    setSpinning(true);
    // Add extra rotations for effect
    const newRotation = rotation + 1440 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    try {
      const res = await axios.post(`${config.API_URL}/gamification/spin`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      setTimeout(() => {
        setSpinning(false);
        setSpinRemaining(spinRemaining - 1);
        const reward = res.data?.data?.reward || "Some Points!";
        toast.success(`You won: ${reward}`);
      }, 3000); // 3s spin duration
    } catch (err) {
      setTimeout(() => {
        setSpinning(false);
        toast.error(err.response?.data?.message || "Failed to spin. Try again.");
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm relative overflow-hidden border-4 border-[#00A5B5] shadow-2xl">
        <button
          onClick={onClose}
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

          <div className="flex items-start gap-2 text-xs text-left bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="material-icons text-yellow-500 text-sm">lightbulb</span>
            <p><span className="font-bold">Tip:</span> Come back daily to spin the wheel and win more rewards</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySpinModal;
