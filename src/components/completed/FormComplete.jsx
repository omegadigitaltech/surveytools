import "./complete.css";
import { Link } from "react-router-dom";
import React, { useState } from "react";

const FormComplete = ({ onDone }) => {
    return (
        <div className="formcomplete complete-container">
            <div className="complete-box">
                <h2 className="complete-title">Form Submitted!</h2>
                <p className="points-text">
                    <Link to="/signup">Create surveys & forms today</Link>
                </p>
                <p className="points-text"></p>
                <button className="done-btn" onClick={onDone} >
                    Done
                </button>
            </div>
        </div>
    )
}
export default FormComplete;