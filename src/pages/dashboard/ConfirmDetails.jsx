import React, { useEffect, useState} from "react";
import axios from "axios";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";
import useAppStore from "../../store/useAppStore";
import useAuthStore from "../../store/useAuthStore";
import { toast } from 'react-toastify';
import config from "../../config/config";

const serviceProviders = [
  { name: "MTN", logo: "./MTN-logo.svg" },
  { name: "AIRTEL", logo: "./airtel logo.svg" },
  { name: "9MOBILE", logo: "./9mobile.svg" },
  { name: "GLO", logo: "./glo-logo.svg" },
];
const NETWORK_CODES = {
  0: "1", // MTN
  1: "2", // Airtel
  2: "3", // 9mobile
  3: "4"  // Glo
};
export default function ConfirmDetails() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const API_URL = config.API_URL

  const [isProcessing, setIsProcessing] = useState(false);
  const { redeemModalState } = useModalStore();
  const { setConfirmModalOpen, setReportModalOpen } = useModalStore();
  const { authToken } = useAuthStore();
  const {
    pointBalance,
    phoneNumber,
    selectedPlan,
    selectedPlanPrice,
    providerIndex,
  } = useAppStore();

  const openReportModal = () => {
    setConfirmModalOpen(false);
    setReportModalOpen(true);
  };
  // useEffect(() => {
  //   console.log({
  //     planId: selectedPlan.planid,
  //     network: `${providerIndex + 1}`,
  //     phoneNumber,
  //   });
  // }, [selectedPlan, providerIndex, phoneNumber]);

  // EDIT change data to points so both can work
  const redeemPoints = async () => {
    setIsProcessing(true);
    try {
      // Phone validation
      const phoneRegex = /^(?:\+234|0)(70|80|81|90|91)\d{8}$/;
      if (!phoneRegex.test(phoneNumber)) {
        toast.error("Invalid Nigerian phone number");
        return;
      }
      // Add balance check first
      if (pointBalance < selectedPlanPrice) {
        toast.error("Insufficient points balance");
        return;
      }
      
      // Format phone number according to the new requirements
      let formattedPhone;
      if (phoneNumber.startsWith("+234")) {
        // If starts with +234, replace with 0
        formattedPhone = "0" + phoneNumber.slice(4);
      } else if (phoneNumber.startsWith("0")) {
        // If starts with 0, keep as is
        formattedPhone = phoneNumber;
      } else {
        // Any other format is invalid
        toast.error("Phone number must start with +234 or 0");
        setIsProcessing(false);
        return;
      }

      const payload = redeemModalState === "data"
        ? {
          planId: selectedPlan.planid,
          network: NETWORK_CODES[providerIndex],
          phoneNumber: formattedPhone
        } : {
          amount: Number(selectedPlanPrice),
          network: NETWORK_CODES[providerIndex],
          phoneNumber: formattedPhone
        }
      const endpoint = redeemModalState === "data"
        ? "/redemption/data"
        : "/redemption/airtime";

      if (!NETWORK_CODES[providerIndex]) {
        toast.error("Select a network provider");
        return;
      }
      if (redeemModalState === "airtime") {
        if (selectedPlanPrice < 100) {
          toast.error("Minimum airtime amount is 100");
          return;
        }
      }
      if (redeemModalState === "data" && !selectedPlan?.planid) {
        toast.error("Please select a valid data plan");
        return;
      }
      const response = await axios.post(
        `${API_URL}${endpoint}`,
        payload,
        {
          headers: {
            // 'Access-Control-Allow-Origin': "*",
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
        }
      );
      console.log("API returned:", response.data);
      if (response.data.success) {
        console.log("Opening report modal…");
        // Update points balance
        useAppStore.setState({
          pointBalance: pointBalance - selectedPlanPrice
        });
        openReportModal();
        // setConfirmModalOpen(false);
      } else {
        toast.error(response.data.message || "Redemption failed");
        console.log(response.data.message)
      }
    } catch (err) {
      console.error("Redemption error:", err.response?.data);
      toast.error("Error: An error occurred. Try a different plan or try again later" || err.response?.data?.message);
    } finally {
      setIsProcessing(false);
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
              {redeemModalState === "data" ? (
                <div>Data Plan: {selectedPlan?.name}</div>
              ) : (
                <div>Network: {serviceProviders[providerIndex].name || "Unknown Network"}</div>
              )}
              <div>Price: {selectedPlanPrice}</div>
              <div>Phone number: {phoneNumber}</div>
              <div className={pointBalance < selectedPlanPrice ? "text-red-500" : ""}>
                Points: {pointBalance}
              </div>
            </div>
          </div>
          <button className="button-main redeem-button"
            onClick={redeemPoints}
            disabled={isProcessing}>
            {isProcessing ? "Processing..." :
              redeemModalState === "data" ? "Redeem Data Reward" : "Redeem Airtime Reward"}
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
