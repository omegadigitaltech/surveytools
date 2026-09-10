import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

function ProgressTracker({ step, totalSteps, showSaved = true }) {
  const percentComplete = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full mb-1">
      {/* Top bar: logo + progress */}
      
        <p className="text-sky-600 text-xs font-semibold tracking-wide">
          STEP {step} OF {totalSteps}
        </p>
       <div className="flex justify-between">
         <p className="text-slate-400 text-xs mt-1">
          {percentComplete}% Complete
        </p>
      {showSaved && (
        <div className="flex items-center gap-1.5 text-emerald-500 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          Progress Saved
        </div>  
      )}
</div>
      <div className="flex items-start justify-between mb-2">
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProgressTracker;
