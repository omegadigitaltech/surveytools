import React from "react";

const RedeemModal = () => {
  return (
    <>
      <div className="overlay"></div>
      <div className="modal">
        <div className="top">
          <h2>Redeem Your Points</h2>
          <img src="./close-filled.svg" alt="close" />
        </div>
        <div className="content">
          <div className="conversion-rate-wrapper">
            <div className="conversion-rate-title">Conversion Rates</div>
            <div>100 points = 500mb</div>
          </div>
          <div className="converter">
            <div className="title">Points to redeem</div>
            <div className="input-wrapper flex">
              <input type="text" placeholder="100" />
              <div>=500mb</div>
            </div>
            <div className="phone-input-wrapper flex">
              <div className="provider-logo flex">
                <img src="airtel logo.svg" alt="airtel logo" />
                <img src="./chevron-down.svg" alt="chevron-down" />
              </div>
              <input className="input-result" placeholder="Your phone number"/>
            </div>
          </div>
          <button className="button-main redeem-button">Redeem Data Reward</button>
        </div>
      </div>
    </>
  );
};

export default RedeemModal;
