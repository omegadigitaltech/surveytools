import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Info } from "lucide-react";
import backaro from "../../../assets/img/backaro.svg";

import "../card.css";

const Card = (props) => {
  const {
    title,
    description,
    destination,
    optional = false,
    showContinue = true,
    children,
  } = props;
  const [gender, setGender] = useState("");
  return (
    <div className="form-card w-full bg-white rounded-t-2xl sm:px-10 p-4 sm:pt-8 pb-6">
      {/* Card */}
      <div className="bg-white rounded-b-2xl ">
        <button
          type="button"
          className="flex items-center  gap-1 text-slate-900 mb-1 "
          aria-label="Go back"
        >
          {/* <ChevronLeft className="w-6 h-6" strokeWidth={2} /> */}
          <img
            src={backaro}
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            alt=""
          />
          <h1 className="text-xl sm:text-3xl font-semibold">
            {title}{" "}
            {optional ? (
              <span className="text-slate-400 font-normal text-md sm:text-2xl">
                (Optional)
              </span>
            ) : (
              ""
            )}
          </h1>
        </button>
        <p className="text-sm text-slate-500 mb-8">{description}</p>
        {optional ? <div className="flex  gap-2 bg-sky-50 border border-sky-100 text-sky-700 text-xs rounded-lg px-4 py-2 mb-6">
          <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
          <p>
            This information helps us improve research quality. You may skip any
            question or the entire section.
          </p>
        </div> : <></>}

        {children}
      </div>

      {/* Footer action bar */}
      {showContinue && (
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 transition-colors text-white font-medium px-4 py-1 rounded-lg"
          >
            Continue
            <ChevronRight
              className="chevron-continue w-4 !h-8 border-none"
              strokeWidth={2.5}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;