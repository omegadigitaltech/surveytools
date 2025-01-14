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
  const [amount, setAmount] = useState(0);
  const [participantType, setParticipantType] = useState("all_faculties");
  const [selectedFaculties, setSelectedFaculties] = useState([]);

  const faculties = [
    "Arts",
    "Agriculture",
    "Administration",
    "Medical Sciences",
    "Social Sciences",
    "Law",
    "Technology",
    "Sciences",
    "Pharmacy",
    "Education",
    "EDM",
  ];
  
  
  const handleParticipantsChange = (e) => {
    const value = e.target.value;
    setParticipants(value);

    const calculatedAmount = value ? value * 50 : 0;
    setAmount(calculatedAmount);
  };

  // Handle select dropdown change
  const handleParticipantTypeChange = (e) => {
    setParticipantType(e.target.value);
    if (e.target.value === "all_faculties") {
      setSelectedFaculties([]); // Reset faculties if "All Faculties" is selected
    }
  };

  // Handle faculty checkbox toggle
  const handleFacultyToggle = (faculty) => {
    setSelectedFaculties((prev) =>
      prev.includes(faculty)
        ? prev.filter((f) => f !== faculty) // Remove if already selected
        : [...prev, faculty] // Add if not selected
    );
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
                  <h4>Number of Participants</h4>
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
                {/* <select
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
                </select> */}
              </div>
              <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Amount to be paid (₦)</h4>
                </label>
                {/* Calculated amount to be paid */}
                <p className="num_partp-input">
                  ₦ <span className="result">{amount}</span>
                </p>

                {/* <select
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
                </select> */}

              </div>


            </div>
            <div className="postsurvey-field gender-area custom-dropdown">
              <label className="required-label" htmlFor="range-dropdown">
                <h4>Gender</h4>
              </label>
              <div className="gender-input flex">

                <div>
                  <label htmlFor="male">
                    <input id="male" type="checkbox" name="gender" value="male" /> Male
                  </label>

                  {/* <input name="gender" value="male" type="checkbox" /> Male */}
                </div>
                <div>
                  <label htmlFor="male">
                    <input id="female" type="checkbox" name="gender" value="female" /> Female
                  </label>

                </div>
              </div>

              {/* <select
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
                </select> */}

            </div>
            <div className="postsurvey-field custom-dropdown">

              <label className="required-label" htmlFor="range-dropdown">
                <h4>Required Participants</h4>
              </label>
              <select
                name="preferred_participants"
                id="range-dropdown"
                value={participantType}
                onChange={handleParticipantTypeChange}
                className="custom-select"
              >
                <option value="all_faculties">All Faculties</option>
                <option value="select_faculties">Select faculties</option>
              </select>

              {participantType === "select_faculties" && (
                <div className="req-part-sec">
                  {/* If Select Faculty is selected These faculties will appear */}
                  <p className="select-facult-msg">Kindly choose required faculties</p>
                  <div className="choose-faculty">
                    {faculties.map((faculty) => (
                      <p key={faculty}>
                        <input
                          type="checkbox"
                          value={faculty}
                          checked={selectedFaculties.includes(faculty)}
                          onChange={() => handleFacultyToggle(faculty)}
                        />{" "}
                        {faculty}
                      </p>
                    ))}

                  </div>
                </div>
              )}
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
