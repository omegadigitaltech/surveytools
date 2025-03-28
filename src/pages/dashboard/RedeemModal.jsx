import React, { useRef, useState, useEffect } from "react";
import Overlay from "./Overlay";
import useModalStore from "../../store/useModalStore";
import useOutsideClick from "../../hooks/useOutsideClick";

const serviceProviders = [
  { name: "MTN", logo: "./MTN-logo.svg" },
  { name: "GLO", logo: "./glo-logo.svg" },
  { name: "AIRTEL", logo: "./airtel logo.svg" },
];
const RedeemModal = () => {
  const { setRedeemModalOpen, setConfirmModalOpe, balance, setBalance, openModalAnimate } = useModalStore();
  const openConfirmModal = () => {
    setRedeemModalOpen(false);
    setConfirmModalOpen(true);
  };
  const [servicesDpwnOpen, setServicesDpwnOpen] = useState(false);
  const [balanceSufficient, setBalanceSufficient] = useState(true);
  const [buttonActive, setButtonActive] = useState(false);
  const [providerIndex, setProviderIndex] = useState(0);
  // refs
  const providersSelectorRef = useRef(null);
  const phoneWrapperRef = useRef(null);
  const modalRef = useRef(null)

  // functions
  useOutsideClick(phoneWrapperRef, () => setServicesDpwnOpen(false));
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

  return (
    <>
      <Overlay />
      <div className={`modal ${openModalAnimate ? 'modal-active' : ''}`} ref={modalRef}>
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
            <div>100 points = 500mb</div>
          </div>
          <div className="converter">
            <div className="title">Points to redeem</div>
            <div className="input-wrapper flex">
              <input
                type="number"
                className={`${!balanceSufficient ? "insufficient-points" : ""}`}
                onChange={compareToBalance}
                defaultValue={0.0}
              />
              <div>=500mb</div>
            </div>
            <div ref={phoneWrapperRef} className="phone-input-wrapper flex">
              {servicesDpwnOpen && (
                <ul ref={providersSelectorRef} className="services-selector">
                  <li onClick={() => changeProviderIndex(0)}>MTN</li>
                  <li onClick={() => changeProviderIndex(1)}>GLO</li>
                  <li onClick={() => changeProviderIndex(2)}>Airtel</li>
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
