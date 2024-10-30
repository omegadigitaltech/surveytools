import React, { useState } from "react";
import "./complete.css";
import tick from "../../assets/img/tick.svg";

const Complete = () => {
    // State to control message visibility
    const [showMessage, setShowMessage] = useState(true);

    // Function to hide the message
    const handleClose = () => {
        setShowMessage(false);
    };

    // Only render the message if showMessage is true
    return (
        showMessage && (
            <section className="complete-box flex">
                <div className="complete-msg flex">
                    <img src={tick} alt="Success" />
                    <p className="success-msg">You have successfully completed this survey</p>
                    <p className="thank-you">Thank you for your participation. You have been awarded <span>500</span> points</p>
                    <button type="button" className="post-btn" onClick={handleClose}>
                        Done
                    </button>
                </div>
            </section>
        )
    );
};

export default Complete;
