import React, { useRef, useState, useEffect, useMemo } from "react";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";
import useAuthStore from "../../store/useAuthStore";
import useOutsideClick from "../../hooks/useOutsideClick";
import axios from "axios";
import useAppStore from "../../store/useAppStore";

const serviceProviders = [
  { name: "MTN", logo: "./MTN-logo.svg" },
  { name: "AIRTEL", logo: "./airtel logo.svg" },
  { name: "9MOBILE", logo: "./9mobile.svg" },
  { name: "GLO", logo: "./glo-logo.svg" },
];
const RedeemModal = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // states
  const {
    setRedeemModalOpen,
    setConfirmModalOpen,
    balance,
    setBalance,
    openModalAnimate,
  } = useModalStore();
  const { pointBalance } = useAppStore;
  const { authToken } = useAuthStore();
  const [servicesDpwnOpen, setServicesDpwnOpen] = useState(false);
  const [plansDpwnOpen, setPlansDpwnOpen] = useState(false);
  const [balanceSufficient, setBalanceSufficient] = useState(true);
  const [buttonActive, setButtonActive] = useState(false);
  const [providerIndex, setProviderIndex] = useState(0);
  const [dataPlans, setDataPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPlanPrice, setSelectedPlanPrice] = useState("");

  // refs
  const providersSelectorRef = useRef(null);
  const plansSelector = useRef(null);
  const phoneWrapperRef = useRef(null);
  const modalRef = useRef(null);

  // functions
  useOutsideClick(phoneWrapperRef, () => setServicesDpwnOpen(false));
  useOutsideClick(plansSelector, () => setPlansDpwnOpen(false));
  useOutsideClick(modalRef, () => setRedeemModalOpen(false));
  const compareToBalance = (e) => {
    if (balance >= e.target.value) {
      setBalanceSufficient(true);
    } else {
      setBalanceSufficient(false);
    }
  };
  const submitEligibility = (e) => {
    const nigerianPhoneRegex = /^(?:\+234|0)?[789][01]\d{8}$/;
    if (!balanceSufficient) return setButtonActive(false);
    if (!nigerianPhoneRegex.test(e.target.value)) return setButtonActive(false);
    else setButtonActive(true);
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
    try {
      const response = await axios.get(`${apiUrl}/redemption/plans`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response && response.data) {
        const chosenDataPlans = response.data.data.filter(
          (plan) => plan.network === `${providerIndex + 1}`
        );
        setDataPlans(chosenDataPlans);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // hooks
  useMemo(() => {
    if (selectedPlan.price) {
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
            {/* <div>
              <div className="title">Points to redeem</div>
              <div className="input-wrapper flex">
                <input
                  type="number"
                  className={`${
                    !balanceSufficient ? "insufficient-points" : ""
                  }`}
                  onChange={compareToBalance}
                  defaultValue={0.0}
                />
                <div>=500mb</div>
              </div>
            </div> */}
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
                  <ul className="modal-selector plans-selector absolute top-0 left-0 bg-white shadow-md max-h-[10rem] overflow-y-auto">
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
                    ? "Select a data plan"
                    : selectedPlan.name}
                </button>
              </div>
            </div>
            {selectedPlan.price ? (
              <div className="mb-4">Price: {selectedPlanPrice}</div>
            ) : (
              <></>
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
            className={`button-main redeem-button ${
              !buttonActive ? "inactive" : ""
            }`}
            onClick={openConfirmModal}
          >
            Redeem Data Reward
          </button>
        </div>
      </div>
    </>
  );
};

export default RedeemModal;
