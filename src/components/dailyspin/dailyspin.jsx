// DailyWheelSpin.jsx
// Self-contained Daily Wheel Spin component.
// Import: import DailyWheelSpin from './DailyWheelSpin';
// Usage:  <DailyWheelSpin spinsPerDay={1} onClose={() => {}} onResult={(r) => console.log(r)} />

import { useRef, useEffect, useState, useCallback } from "react";
import "./dailyspin.css";

// ─── Wheel segments ────────────────────────────────────────────────────────────
const SEGMENTS = [
  { label: "JackPot",       icon: "🎰", color: "#2DA6B0", textColor: "#fff", type: "jackpot"  },
  { label: "Try Again",     icon: "",   color: "#FFFFFF", textColor: "#1A1A1A", type: "try"   },
  { label: "150 Points",    icon: "🪙", color: "#2B8A3E", textColor: "#fff", type: "points", value: 150 },
  { label: "100 Points",    icon: "💰", color: "#C9A820", textColor: "#fff", type: "points", value: 100 },
  { label: "1x Multiplier", icon: "",   color: "#2DA6B0", textColor: "#fff", type: "multiplier", value: 1 },
  { label: "Try Again",     icon: "",   color: "#FFFFFF", textColor: "#1A1A1A", type: "try"   },
  { label: "50 Points",     icon: "💵", color: "#2B8A3E", textColor: "#fff", type: "points", value: 50  },
  { label: "2x Multiplier", icon: "",   color: "#C9A820", textColor: "#fff", type: "multiplier", value: 2 },
];

const TOTAL     = SEGMENTS.length;
const SLICE_DEG = 360 / TOTAL;           // 45° per slice
const SPIN_DURATION = 4000;              // ms
const MIN_EXTRA_SPINS = 5;              // full rotations before landing

// ─── Weighted random segment picker ───────────────────────────────────────────
const WEIGHTS = [1, 3, 2, 3, 2, 3, 3, 1]; // jackpot is rare; try-again more common

function weightedRandom() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return i;
  }
  return WEIGHTS.length - 1;
}

// ─── Easing: ease-out cubic ───────────────────────────────────────────────────
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ─── Draw wheel on canvas ─────────────────────────────────────────────────────
function drawWheel(canvas, rotation = 0) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 2;

  ctx.clearRect(0, 0, size, size);

  SEGMENTS.forEach((seg, i) => {
    const startAngle = (rotation + i * SLICE_DEG - 90) * (Math.PI / 180);
    const endAngle   = startAngle + SLICE_DEG * (Math.PI / 180);
    const midAngle   = (startAngle + endAngle) / 2;

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    // Slice border
    ctx.strokeStyle = "#e8e8e8";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(midAngle);

    const textR = r * 0.62;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = seg.textColor;

    // Icon (if any)
    if (seg.icon) {
      ctx.font = `${size * 0.065}px sans-serif`;
      ctx.fillText(seg.icon, textR * 0.7, -size * 0.055);
    }

    // Label — wrap long text
    const words = seg.label.split(" ");
    ctx.font = `bold ${size * 0.057}px -apple-system, sans-serif`;
    if (words.length === 1) {
      ctx.fillText(words[0], textR * 0.7, seg.icon ? size * 0.03 : 0);
    } else {
      const y0 = seg.icon ? size * 0.025 : -size * 0.028;
      words.forEach((w, wi) => {
        ctx.fillText(w, textR * 0.7, y0 + wi * size * 0.065);
      });
    }

    ctx.restore();
  });

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#d0d0d0";
  ctx.lineWidth = 3;
  ctx.stroke();
}

// ─── Result helpers ────────────────────────────────────────────────────────────
function resultStyle(seg) {
  if (seg.type === "try")        return "try";
  if (seg.type === "multiplier") return "mult";
  return "win";
}

function resultMessage(seg) {
  if (seg.type === "jackpot")    return "🎰 JACKPOT! You hit the big one!";
  if (seg.type === "try")        return "😅 No luck this time — try again tomorrow!";
  if (seg.type === "points")     return `🎉 You won ${seg.value} Points!`;
  if (seg.type === "multiplier") return `✨ ${seg.value}x Multiplier activated!`;
  return seg.label;
}

// ─── Sparkle SVG (app icon & hub) ─────────────────────────────────────────────
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5Z" />
    <path d="M18 2l.8 3.2L22 6l-3.2.8L18 10l-.8-3.2L14 6l3.2-.8Z" opacity="0.7" />
    <path d="M6 14l.6 2.4L9 17l-2.4.6L6 20l-.6-2.4L3 17l2.4-.6Z" opacity="0.7" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * DailyWheelSpin
 *
 * Props:
 *   spinsPerDay  {number}   – spins allowed per session (default: 1)
 *   onClose      {function} – called when close button is clicked
 *   onResult     {function} – called with the winning segment object
 */
export default function DailyWheelSpin({
  spinsPerDay = 1,
  onClose     = () => {},
  onResult    = () => {},
}) {
  const canvasRef    = useRef(null);
  const rafRef       = useRef(null);
  const startRef     = useRef(null);
  const currentAngle = useRef(0);   // current visual rotation in degrees

  const [spinning,    setSpinning]    = useState(false);
  const [spinsLeft,   setSpinsLeft]   = useState(spinsPerDay);
  const [result,      setResult]      = useState(null);

  // Initial draw
  useEffect(() => {
    drawWheel(canvasRef.current, 0);
  }, []);

  // ── Core spin animation ──────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (spinning || spinsLeft <= 0) return;

    setResult(null);
    setSpinning(true);

    const segIndex   = weightedRandom();
    const segCenter  = segIndex * SLICE_DEG + SLICE_DEG / 2; // degrees from top (0°)

    // We want the wheel to stop so segCenter is at the top (pointer).
    // The pointer is at 270° in canvas coords (top = -90° → 270°).
    // target rotation = 360 * extraSpins + (270 - segCenter) mod 360
    const extraSpins  = MIN_EXTRA_SPINS + Math.floor(Math.random() * 3);
    const landing     = ((270 - segCenter) % 360 + 360) % 360;
    const totalDeg    = extraSpins * 360 + landing;
    const startDeg    = currentAngle.current;
    const endDeg      = startDeg + totalDeg;

    startRef.current = null;

    function frame(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const ease     = easeOut(progress);
      const angle    = startDeg + (endDeg - startDeg) * ease;

      currentAngle.current = angle;
      drawWheel(canvasRef.current, angle % 360);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        currentAngle.current = endDeg % 360;
        setSpinning(false);
        setSpinsLeft(prev => prev - 1);
        const won = SEGMENTS[segIndex];
        setResult(won);
        onResult(won);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }, [spinning, spinsLeft, onResult]);

  // Cleanup RAF on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const canSpin = spinsLeft > 0 && !spinning;

  return (
    <div className="dws-overlay" onClick={onClose}>
      <div className="dws-card" role="dialog" aria-label="Daily Wheel Spin" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="dws-close" onClick={onClose} aria-label="Close">✕</button>

        {/* App icon */}
        <div className="dws-icon" aria-hidden="true"><SparkleIcon /></div>

        {/* Heading */}
        <h2 className="dws-title">Daily Wheel Spin</h2>
        <p  className="dws-subtitle">Spin the wheel to get amazing rewards</p>

        {/* Wheel */}
        <div className="dws-wheel-wrap" aria-live="polite">
          <div className="dws-pointer" aria-hidden="true" />

          <canvas
            ref={canvasRef}
            className="dws-canvas"
            width={280}
            height={280}
          />

          {/* Hub */}
          <div className="dws-hub" aria-hidden="true"><SparkleIcon /></div>
        </div>

        {/* Spin button */}
        <button
          className="dws-btn"
          onClick={spin}
          disabled={!canSpin}
          aria-label={canSpin ? "Spin the wheel" : "No spins remaining"}
        >
          {spinning ? "Spinning…" : "Spin Now"}
        </button>

        {/* Remaining */}
        <p className="dws-remaining">
          Spin remaining : {spinsLeft}
        </p>

        {/* Result */}
        {result && (
          <div className={`dws-result ${resultStyle(result)}`} role="status">
            {resultMessage(result)}
          </div>
        )}

        {/* Tip */}
        <div className="dws-tip">
          <span className="dws-tip-icon">💡</span>
          <span><strong>Tip</strong> : Come back daily to spin the wheel and win more rewards</span>
        </div>

      </div>
    </div>
  );
}