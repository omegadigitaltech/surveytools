import React, { useRef, useState, useEffect, useMemo } from "react";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";
import useAuthStore from "../../store/useAuthStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import axios from "axios";
import useAppStore from "../../store/useAppStore";
import config from "../../config/config";
import { ColorRing } from "react-loader-spinner";
import { toast } from 'react-toastify';

const serviceProviders = [
  { name: "MTN", logo: "./MTN-logo.svg" },
  { name: "AIRTEL", logo: "./airtel logo.svg" },
  { name: "9MOBILE", logo: "./9mobile.svg" },
  { name: "GLO", logo: "./glo-logo.svg" },
];

const RedeemModal = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const API_URL = config.API_URL
  // states
  const {
    setRedeemModalOpen,
    setConfirmModalOpen,
    openModalAnimate,
    redeemModalState,
    setRedeemModalState,
  } = useModalStore();
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

  const { authToken } = useAuthStore();
  const [servicesDpwnOpen, setServicesDpwnOpen] = useState(false);
  const [balanceSufficient, setBalanceSufficient] = useState(true);
  const [buttonActive, setButtonActive] = useState(false);
  const [airtimeAmount, setAirtimeAmount] = useState(0);

  // refs
  const providersSelectorRef = useRef(null);
  const phoneWrapperRef = useRef(null);
  const modalRef = useRef(null);

  // functions
  const submitEligibility = (e) => {
    const value = e.target.value;
    const nigerianPhoneRegex = /^(?:\+234|0)?(?:70|80|81|90|91)\d{8}$/;
    const isValid = nigerianPhoneRegex.test(value);

    setPhoneNumber(value);
    setButtonActive(isValid && balanceSufficient);
  };

  const changeProviderIndex = (value) => {
    setProviderIndex(value);
    setServicesDpwnOpen(false);
  };

  const openConfirmModal = () => {
    if (!buttonActive) return;
    setRedeemModalOpen(false);
    setConfirmModalOpen(true);
  };

  // hooks
  useOutsideClick(phoneWrapperRef, () => setServicesDpwnOpen(false));
  useOutsideClick(modalRef, () => setRedeemModalOpen(false));

  useEffect(() => {
    if (pointBalance >= selectedPlanPrice) {
      setBalanceSufficient(true);
    } else {
      setBalanceSufficient(false);
    }
  }, [pointBalance, selectedPlanPrice]);

  const handleAirtimeAmount = (e) => {
    const value = Math.max(100, Number(e.target.value));
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    setAirtimeAmount(value);
    setSelectedPlanPrice(value);
    setButtonActive(value > 0 && balanceSufficient);
  };

  return (
    <>
      <Overlay />
      <div
        className={`modal ${openModalAnimate ? "modal-active" : ""}`}
        ref={modalRef}
      >
        <div className="top">
          <h2>Redeem Your Points</h2>
          <img
            src="./close-filled.svg"
            onClick={() => setRedeemModalOpen(false)}
            alt="close"
          />
        </div>
        <div className="content">
          <p>Convert your points to airtime or data.</p>
          
          <div className="conversion-rate-wrapper">
            <div className="conversion-rate-title">Conversion Rates</div>
            <div className="flex items-center">
              <span>1 point = </span>
              <img
                src="./naira-sign-solid.svg"
                className="h-4 inline-block"
                alt="naira sign"
              />
              <span>1</span>
            </div>
          </div>

          <div className="converter">
            <div className="mb-4">
              <div className="title">Your balance is:</div>
              <div className="font-bold flex items-center">
                <img
                  src="./naira-sign-solid.svg"
                  className="h-4 inline-block"
                  alt="naira sign"
                />
                <span>{pointBalance ? pointBalance : "0.00"}</span>
              </div>
            </div>

            <div className="modal-state-selector flex mb-4">
              <div
                onClick={() => setRedeemModalState("data")}
                className={`${redeemModalState == "data" ? "border-b" : ""}`}
              >
                Data
              </div>
              <div
                onClick={() => setRedeemModalState("airtime")}
                className={`${redeemModalState == "airtime" ? "border-b" : ""}`}
              >
                Airtime
              </div>
            </div>

            {redeemModalState === "data" ? (
              <>
                {/* Network Selector */}
                <div className="provider-selection mb-4" ref={phoneWrapperRef}>
                  <button 
                    type="button"
                    className="provider-button flex" 
                    onClick={() => setServicesDpwnOpen(!servicesDpwnOpen)}
                  >
                    <div className="flex items-center gap-2 provider-select">
                      <img 
                        src={serviceProviders[providerIndex].logo} 
                        alt={serviceProviders[providerIndex].name} 
                        className="provider-logo-image" 
                      />
                      <span>{serviceProviders[providerIndex].name}</span>
                    </div>
                    <img src="./chevron-down.svg" alt="chevron" />
                  </button>
                  
                  {servicesDpwnOpen && (
                    <ul className="modal-selector shadow-md" ref={providersSelectorRef}>
                      {serviceProviders.map((provider, index) => (
                        <li key={index} onClick={() => changeProviderIndex(index)}>
                          {provider.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Amount Input */}
                <div className="data-amount mb-4">
                  <input
                    className="phone-number-input"
                    type="number"
                    min="100"
                    onChange={handleAirtimeAmount}
                    placeholder="Enter amount (Min ₦100)"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Add network selector for airtime */}
                <div className="provider-selection mb-4" ref={phoneWrapperRef}>
                  <button
                    type="button"
                    className="provider-button flex"
                    onClick={() => setServicesDpwnOpen(!servicesDpwnOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={serviceProviders[providerIndex].logo}
                        alt={serviceProviders[providerIndex].name}
                        className="provider-logo-image"
                      />
                      <span>{serviceProviders[providerIndex].name}</span>
                    </div>
                    <img src="./chevron-down.svg" alt="chevron" />
                  </button>
                  
                  {servicesDpwnOpen && (
                    <ul className="modal-selector shadow-md" ref={providersSelectorRef}>
                      {serviceProviders.map((provider, index) => (
                        <li key={index} onClick={() => changeProviderIndex(index)}>
                          {provider.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="airtime-amount mb-4">
                  <input
                    className="phone-number-input"
                    type="number"
                    min="100"
                    onChange={handleAirtimeAmount}
                    placeholder="Enter amount (Min ₦100)"
                  />
                </div>
              </>
            )}

            {selectedPlanPrice > 0 && (
              <div className="mb-4">Price: ₦{selectedPlanPrice}</div>
            )}

            {/* INSUFFICIENT MESSAGE */}
            {(!balanceSufficient || (redeemModalState === "airtime" && selectedPlanPrice < 100)) && (
              <div className="text-red-500 mb-4 font-medium insufficent-alert">
                {redeemModalState === "airtime" && selectedPlanPrice < 100
                  ? "Minimum airtime amount is ₦100."
                  : `Insufficient points${selectedPlanPrice ? ` for ₦${selectedPlanPrice}` : ""}.`}
              </div>
            )}

            <div>
              <input
                className="phone-number-input"
                type="number"
                onChange={submitEligibility}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <button
            className={`button-main redeem-button ${!buttonActive ? "inactive" : ""}`}
            onClick={openConfirmModal}
          >
            {redeemModalState === "data" ? "Redeem Data" : "Redeem Airtime"}
          </button>
        </div>
      </div>
    </>
  );
};

export default RedeemModal;