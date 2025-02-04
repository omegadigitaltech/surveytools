import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import React, { useState } from 'react';
import "./postsurvey.css";
import backaro from "../../assets/img/backaro.svg";

const PostSurvey = () => {
  const data = useActionData();
  console.log(data)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState("");
  const [gender, setGender] = useState("all_genders");
  const [preferredParticipants, setPreferredParticipants] = useState("all_faculties");
  const [amount, setAmount] = useState(0);
  
  const handleParticipantsChange = (e) => {
    const value = e.target.value;
    setParticipants(value);

    const calculatedAmount = value ? value * 50 : 0;
    setAmount(calculatedAmount);
  };


  
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
                placeholder="Tell us about your survey..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="participants-fields grid">
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Preferred number of participants</h4>
                </label>
                <input
                  className="num_partp-input"
                  type="number"
                  name="participant_num"
                  id="participant_num"
                  value={participants}
                  onChange={handleParticipantsChange}
                  placeholder="Enter number of participants"
                  min="1"
                  required
                />
              </div>
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Est. amount to be paid (₦)</h4>
                </label>
                {/* Calculated amount to be paid */}
                <p className="num_partp-input">
                  ₦ <span className="result">{amount}</span>
                </p>
              </div>


            </div>
            <div className="postsurvey-field gender-area custom-dropdown">
              <label className="required-label" htmlFor="range-dropdown">
                <h4>preferred gender of participants</h4>
              </label>
              <select  
                 name="gender"
                 id="range-dropdown"
                 value={gender}
                 onChange={(e) => setGender(e.target.value)}
                 className="custom-select">
              <option value="all_genders">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              </select>
            </div>
            <div className="postsurvey-field custom-dropdown">

              <label className="required-label" htmlFor="range-dropdown">
                <h4>Preferred Participants</h4>
              </label>
              <select
                name="preferred_participants"
                id="range-dropdown"
                value={preferredParticipants}
                onChange={(e) => setPreferredParticipants(e.target.value)}
                className="custom-select"
              >
                <option value="all_faculties">All Faculties</option>
                <option value="arts">Arts</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Administration">Administration</option>
                <option value="Education">Education</option>
                <option value="EDM">EDM</option>
                <option value="Law">Law</option>
                <option value="Medical Sciences">Medical Sciences</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Sciences">Sciences</option>
                <option value="Technology">Technology</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
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
