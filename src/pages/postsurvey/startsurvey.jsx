// INDEX PAGE FOR POST SURVEY

import React, { useState } from "react";
import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import ai from "../../assets/img/ai.svg";
import write from "../../assets/img/exam.svg";
import "./startsurvey.css";

const StartSurvey = () => {
  const [selected, setSelected] = useState(""); // Track selected option
  const handleSelect = (type) => {
    setSelected(type);
  };

  return (
    <section className="startsurvey flex">
      <div className="startsurvey-wrap">
        <div className="startsurvey-head">
          <h1 className="startsurvey-head">Create A Questionnaire</h1>
          <p>How you want to start your survey</p>
        </div>
        <Form className="startsurvey-form">
          <div className="startoption-box flex">
            <label
              className={`start-option ${
                selected === "blank" ? "click-option" : ""
              }`}
              onClick={() => handleSelect("blank")}
            >
              <div className="start-blank">
                <img src={write} alt="blank" />
                <h1>Blank Page</h1>
                <p>Start creating your questionnaires from scratch.</p>
              </div>
            </label>
            <label
              className={`start-option ${
                selected === "ai" ? "click-option" : ""
              }`}
              onClick={() => handleSelect("ai")}
            >
              <div className="start-ai">
                <img src={ai} alt="ai" />
                <h1>Generate with AI</h1>
                <p>
                  Tell our AI your goal and it'll craft your questionnaires.
                </p>
              </div>
            </label>
          </div>
          <button className="startsurvey-btn btn">Continue</button>
        </Form>
      </div>
    </section>
  );
};
export default StartSurvey;
