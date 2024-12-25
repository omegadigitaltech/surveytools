import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import React, { useState } from 'react';
import "./postsurvey.css";
import backaro from "../../assets/img/backaro.svg";

const PostSurvey = () => {
  const data = useActionData();
  console.log(data)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectRange, setSelectRange] = useState('0-200');
  const [totalPoint, setTotalPoint] = useState('0-50');
  const [participantType, setParticipantType] = useState('undergraduate');
  const [participantPoint, setParticipantPoint] = useState('10');

  return (
    <section className="postsurvey">
      <div className="postsurvey_wrap wrap">
        <div className="post-head flex">
          <Link to="/dashboard"><img src={backaro} className="backaro" /></Link>
          <h3>Post Questionnaire</h3>
        </div>
        <div className="postsurvey_div">
          <Form className="survey_form" method="post" action="/postsurvey">
            <div className="postsurvey-field">
              <label className="postsurvey-label" htmlFor="title">
                <h4>Title of Survey</h4>
              </label>
              <input
                className="postsurvey-input"
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="postsurvey-field">
              <label className="postsurvey-label" htmlFor="description">
                <h4>Description</h4>
              </label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="10"
                placeholder="Write your survey..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="participants-fields grid">
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Required Participants</h4>
                </label>
                <select
                name="max_participant"
                  id="range-dropdown"
                  value={selectRange}
                  onChange={(e) => setSelectRange(e.target.value)}
                  className="custom-select"
                >
                  <option value="100">0-100</option>
                  <option value="200">0-200</option>
                  <option value="300">0-300</option>
                  <option value="400">0-400</option>
                </select>
              </div>
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Total Point</h4>
                </label>
                <select
                name="duration"
                  id="range-dropdown"
                  value={totalPoint}
                  onChange={(e) => setTotalPoint(e.target.value)}
                  className="custom-select"
                >
                  <option value="50">0-50 Points</option>
                  <option value="100">0-100 Points</option>
                  <option value="150">0-150 Points</option>
                  <option value="200">0-200 Points</option>
                </select>
              </div>
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Preferred Participants</h4>
                </label>
                <select
                name="preferred_participants"
                  id="range-dropdown"
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value)}
                  className="custom-select"
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Masters">Masters</option>
                </select>
              </div>
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Participants Points</h4>
                </label>
                <select
                name="point"
                  id="range-dropdown"
                  value={participantPoint}
                  onChange={(e) => setParticipantPoint(e.target.value)}
                  className="custom-select"
                >
                  <option value="10">10 Points</option>
                  <option value="20">20 Points</option>
                  <option value="30">30 Points</option>
                  <option value="40">40 Points</option>
                </select>
              </div>
            </div>
            <div className="flex btn_div">
              <button
                type="submit"
                className="continue_survey btn"
                // onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default PostSurvey;
