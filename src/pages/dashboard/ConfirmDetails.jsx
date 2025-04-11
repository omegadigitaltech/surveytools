import React, { useEffect, useMemo } from "react";
import axios from "axios";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";
import useAppStore from "../../store/useAppStore";
import useAuthStore from "../../store/useAuthStore";

export default function ConfirmDetails() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const { setConfirmModalOpen, setReportModalOpen } = useModalStore();
  const { authToken } = useAuthStore();
  const {
    pointBalance,
    phoneNumber,
    setPhoneNumber,
    selectedPlan,
    setSelectedPlan,
    selectedPlanPrice,
    setSelectedPlanPrice,
    providerIndex,
    setProviderIndex,
  } = useAppStore();

  const openReportModal = () => {
    setConfirmModalOpen(false);
    setReportModalOpen(true);
  };
  useEffect(() => {
    console.log({
      plainId: selectedPlan.id,
      network: `${providerIndex + 1}`,
      phoneNumber,
    });
  }, [selectedPlan, providerIndex, phoneNumber]);

  const redeemData = async () => {
    // setDataPlans("loading");
    try {
      const response = await axios.post(
        `${apiUrl}/redemption/data`,
        {
          plainId: selectedPlan.id,
          network: `${providerIndex + 1}`,
          phoneNumber,
        },
        {
          headers: {
            'Access-Control-Allow-Origin': "*",
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
        }
      );
      if (response && response.data) {
        console.log(response.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Overlay />
      <div className="modal confirm-modal overlay-active">
        <div className="mb-8">
          <h2>Confirm Details</h2>
          <div className="check-txt">Double-Check your details before proceeding</div>
        </div>
        <div className="content">
          <div className="converter">
            <div className="title">Summary</div>
            <div className="summary-content">
              <div>Data Plan: {selectedPlan?.name}</div>
              <div>Price: {selectedPlanPrice}</div>
              <div>Phone number: {phoneNumber}</div>
            </div>
          </div>
          <button className="button-main redeem-button" onClick={redeemData}>
            Redeem Data Reward
          </button>
          <button
            className="button-tertiary cancel-button"
            onClick={() => setConfirmModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
