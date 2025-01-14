import React, { useState } from "react";
import "./complete.css";
import tick from "../../assets/img/tick.svg";

const Complete = ({ points, onDone }) => {

    return (
        showMessage && (
            <section className="complete-box flex">
                <div className="complete-msg flex">
                    <img src={tick} alt="Success" />
                    <p className="success-msg">You have successfully completed this survey</p>
                    <p className="thank-you">Thank you for your participation. You have been awarded <span>{points}</span> points</p>
                    <button type="button" className="post-btn" onClick={handleClose}>
                        Done
                    </button>
                </div>
            </section>
        )
    );
};

export default Complete;
