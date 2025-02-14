import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./complete.css";
import tick from "../../assets/img/tick.svg";

const Complete = ({ points, onDone }) => {
    return (
        <div className="complete-container">
            <div className="complete-box">
                <h2 className="complete-title">Survey Completed!</h2>
                <p className="points-text">You have earned {points} points</p>
                <button className="done-btn" onClick={onDone}>
                    Done
                </button>
            </div>
        </div>
    );
};

export default Complete;
