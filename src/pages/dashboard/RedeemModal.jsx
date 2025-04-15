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
const NETWORK_CODES = {
  0: "1", // MTN
  1: "2", // Airtel
  2: "3", // 9mobile
  3: "4"  // Glo
};

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
  const [plansDpwnOpen, setPlansDpwnOpen] = useState(false);
  const [balanceSufficient, setBalanceSufficient] = useState(true);
  const [buttonActive, setButtonActive] = useState(false);
  const [dataPlans, setDataPlans] = useState([]);
  const [airtimeAmount, setAirtimeAmount] = useState(0);

  // refs
  const providersSelectorRef = useRef(null);
  const plansSelector = useRef(null);
  const phoneWrapperRef = useRef(null);
  const modalRef = useRef(null);

  // functions

  const submitEligibility = (e) => {
    const value = e.target.value;
    // const nigerianPhoneRegex = /^(\+234|0)?[7-9][0-1]\d{8}$/;
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
  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    setPlansDpwnOpen(false);
  };

  // async functions
  const getDataPlans = async () => {
    setDataPlans("loading");
    try {
      const response = await axios.get(`${API_URL}/redemption/plans`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data?.data) {
        const chosenDataPlans = response.data.data.filter(
          plan => plan.network === NETWORK_CODES[providerIndex].toString() // Ensure string comparison
        );
        setDataPlans(chosenDataPlans);
      }
    } catch (err) {
      console.log(err);
      setDataPlans([]);
    }
  };

  // hooks
  useMemo(() => {
    if (selectedPlan?.price) {
      setSelectedPlanPrice(selectedPlan.price);
    }
  }, [selectedPlan]);
  useMemo(() => {
    if (plansDpwnOpen) {
      getDataPlans();
    }
  }, [plansDpwnOpen, providerIndex]);

  useMemo(() => {
    setSelectedPlan("");
  }, [providerIndex]);

  useOutsideClick(phoneWrapperRef, () => setServicesDpwnOpen(false));
  useOutsideClick(plansSelector, () => setPlansDpwnOpen(false));
  useOutsideClick(modalRef, () => setRedeemModalOpen(false));

  useEffect(() => {
    if (pointBalance >= selectedPlanPrice) {
      setBalanceSufficient(true);
    } else {
      setBalanceSufficient(false);
    }
  }, [pointBalance, selectedPlanPrice]);

  const handleAirtimeAmount = (e) => {
    const value = Math.max(100, Number(e.target.value)); // Minimum ₦100
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
                className={`p-2 px-4 cursor-pointer bg-gray-200 ${redeemModalState == "data" ? "border-b" : ""
                  }`}
              >
                Data
              </div>
              <div
                onClick={() => setRedeemModalState("airtime")}
                className={`p-2 px-4 cursor-pointer bg-gray-200 ${redeemModalState == "airtime" ? "border-b" : ""
                  }`}
              >
                Airtime
              </div>
            </div>

            {/* Input for amount you want to buy */}
            {redeemModalState === "data" ? (
              <div
                ref={phoneWrapperRef}
                className="phone-input-wrapper flex mb-4"
              >
                {servicesDpwnOpen && (
                  <ul
                    ref={providersSelectorRef}
                    className="modal-selector shadow-md"
                  >
                    <li onClick={() => changeProviderIndex(0)}>MTN</li>
                    <li onClick={() => changeProviderIndex(1)}>Airtel</li>
                    <li onClick={() => changeProviderIndex(2)}>9mobile</li>
                    <li onClick={() => changeProviderIndex(3)}>GLO</li>
                  </ul>
                )}
                <button
                  type="button"
                  className="provider-button flex"
                  onClick={() => setServicesDpwnOpen(!servicesDpwnOpen)}
                >
                  <img
                    src={serviceProviders[providerIndex].logo}
                    alt={`${serviceProviders[providerIndex].name} logo`}
                    className="provider-logo-image"
                  />
                  <img src="./chevron-down.svg" alt="chevron-down" />
                </button>
                <div className="relative ml-4" ref={plansSelector}>
                  {plansDpwnOpen ? (
                    <ul
                      className={`modal-selector plans-selector absolute top-0 left-0 bg-white shadow-md max-h-[10rem] overflow-y-auto ${dataPlans === "loading"
                        ? "w-full flex justify-center"
                        : ""
                        } `}
                    >
                      {dataPlans === "loading" ? (
                        <ColorRing
                          visible={true}
                          height="30"
                          width="30"
                          ariaLabel="color-ring-loading"
                          wrapperStyle={{}}
                          wrapperClass="color-ring-wrapper"
                          colors={["gray", "gray", "gray", "gray", "gray"]}
                        />
                      ) : (
                        <>
                          {dataPlans && dataPlans.length ? (
                            <>
                              {dataPlans.map((plan, id) => (
                                <li
                                  onClick={() => selectPlan(plan)}
                                  key={id}
                                  className=""
                                >
                                  {plan.name}
                                </li>
                              ))}
                            </>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </ul>
                  ) : (
                    <></>
                  )}
                  <button
                    type="button"
                    className="cursor-pointer provider-button flex bg-gray-200 px-4 py-2"
                    onClick={() => setPlansDpwnOpen(!plansDpwnOpen)}
                  >
                    {selectedPlan === ""
                      ? "Select data plan"
                      : selectedPlan.name}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Add network selector for airtime */}
                {redeemModalState === "airtime" && (
                  <div className="provider-selection mb-4">
                    <button
                      className="provider-button flex"
                      onClick={() => setServicesDpwnOpen(!servicesDpwnOpen)}
                    >
                      <img
                        src={serviceProviders[providerIndex].logo}
                        alt={serviceProviders[providerIndex].name}
                        className="provider-logo-image"
                      />
                      <img src="./chevron-down.svg" alt="chevron" />
                    </button>
                    <div className="relative" ref={plansSelector}>
                      {servicesDpwnOpen && (
                        <ul className="provider-list modal-selector plans-selector absolute top-0 left-0 bg-white shadow-md max-h-[10rem] overflow-y-auto">
                          {serviceProviders.map((provider, index) => (
                            <li key={index} onClick={() => setProviderIndex(index)}>
                              {provider.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="airtime-amount mb-4">
                  <input
                    className="phone-number-input"
                    type="number"
                    min="100"
                    // onChange={submitEligibility}
                    onChange={handleAirtimeAmount}
                    placeholder="Amount. Min = #100"
                  />
                </div>
              </>
            )}

            {redeemModalState === "data" && selectedPlan.price ? (
              // selectedPlan.price ? (
              <div className="mb-4">Price: {selectedPlanPrice}</div>
            ) : null}
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
            className={`button-main redeem-button ${!buttonActive ? "inactive" : ""
              }`}
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
