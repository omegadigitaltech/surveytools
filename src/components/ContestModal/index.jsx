import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Overlay from "../../pages/dashboard/Overlay";
import useAppStore from "../../store/useAppStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import "./style.css";

const ContestModal = () => {
  const { contestModalOpen, setContestModalOpen } = useAppStore();
  const [contestParentOpen, setContestParentOpen] = useState(true);

  const contestModal = useRef(null);

  useOutsideClick(contestModal, () => setContestModalOpen(false));

  useEffect(() => {
    if (contestModalOpen) {
      setContestParentOpen(true);
    } else {
      const timeout = setTimeout(() => setContestParentOpen(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [contestModalOpen]);
  const referralInstructions = [
    <>
      You have to create an account on SurveyTools{" "}
      <a
        href="https://surveyprotools.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://surveyprotools.com/
      </a>{" "}
      to be eligible to participate.
    </>,
    <>
      To participate, send a DM to{" "}
      <a
        href="https://wa.me/+2348107002104"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://wa.me/+2348107002104
      </a>
      . You'll receive a referral code that we can use to track your total
      number of valid referrals.
    </>,
    "Share your referral code to your invites and ask them to message the number you will be given with your code.",
    "For a referral to be valid, your invites must provide your referral code with evidence of their uploaded questionnaire.",
    "You earn 1k per person you bring. Unlimited referrals!",
  ];
  return (
    <>
      {contestParentOpen && <Overlay />}
      {contestParentOpen && (
        <div className="fixed inset-0 z-[999] flex justify-center items-center">
          <AnimatePresence>
            {contestModalOpen && (
              <motion.div
                ref={contestModal}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ duration: 0.3 }}
                className={`modal referral-modal`}
              >
                <div className="flex justify-between items-center">
                  <h2>SurveyTools Referral Contest🥳🎉</h2>
                  <img
                    onClick={() => setContestModalOpen(false)}
                    src="./close-filled.svg"
                    alt="close"
                  />
                </div>
                <p>
                  Get a chance to earn <span className="">BIG</span> money while
                  helping others.
                </p>
                <div className="content pt-4">
                  <div className="font-bold">Rules</div>
                  <ol>
                    {referralInstructions.map((instruction, index) => (
                      <li className="py-1">
                        <span>{index + 1}. </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default ContestModal;
