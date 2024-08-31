import {Link, Form, useNavigate} from "react-router-dom";
import Select from 'react-select';
import React, { useState } from 'react';

// import React from 'react';
import { components } from 'react-select';

import "./postsurvey.css"
import backaro from "../../assets/img/backaro.svg";
// import downaro from "../../assets/img/downaro.svg"

const PostSurvey = () =>{
 // Temporary navigate
 const navigate = useNavigate();
 // Temporary navigate

    const [selectRange, setSelectRange] = useState('0-200');
    const [totalPoint, setTotalPoint] = useState('0-50');
    const [participantType, setparticipantType] = useState('undergraduate');
    const [participantPoint, setParticipantPoint] = useState('10');
//       const handleChange = (event) => {
//     setSelectedRange(event.target.value);
//   };
  const handleSelectRange = (event) => {
    setSelectRange(event.target.value);
  };

  const handleTotalPoint= (event) => {
    setTotalPoint(event.target.value);
  };

  const handleParticipantType = (event) => {
    setparticipantType(event.target.value);
  };

  const handleParticipantPoint = (event) => {
    setParticipantPoint(event.target.value);
  };

return(
    <section className="postsurvey">
<div className="postsurvey_wrap wrap">
    <div className="post-head flex">
    <Link to="/expandsurvey"> <img src={backaro} className="backaro" /></Link>
    <h3>Post Questionaire</h3>
    </div>
    <div className="postsurvey_div">
        <Form className="survey_form">
        <div className="postsurvey-field">
                    <label className="postsurvey-label" htmlFor="title">
                       <h4>Title of Survey</h4> 
                    </label>
                    <input className="postsurvey-input" type="text" name="surveyTitle" id="surveyTitle" />
                </div>
                <div className="postsurvey-field">
                    <label className="postsurvey-label" htmlFor="description">
                       <h4>Description</h4> 
                    </label>
         <textarea name="surveydescription" id="" cols="30" rows="10" placeholder="Write your survey..." required></textarea>
                </div>
                <div className="participants-fields grid">
                <div className="postsurvey-field custom-dropdown">

<label className="required-label" htmlFor="range-dropdown">
<h4>Required Participants</h4> 
 </label>
<select
id="range-dropdown"
value={selectRange}
onChange={handleSelectRange}
className="custom-select"
>
<option className="option" value="0-200">0-200</option>
<option value="0-400">0-400</option>
<option value="0-600">0-600</option>
<option value="0-800">0-800</option>
</select>
</div> 
<div className="postsurvey-field custom-dropdown">
<label className="required-label" htmlFor="range-dropdown">
<h4>Total Point</h4> 
</label>
<select
id="range-dropdown"
value={totalPoint}
onChange={handleTotalPoint}
className="custom-select"
>
<option value="0-50">0-50 Points</option>
<option value="0-100">0-100 Points</option>
<option value="0-150">0-150 Points</option>
<option value="0-200">0-200 Points</option>
</select>
</div> 
<div className="postsurvey-field custom-dropdown">
<label className="required-label" htmlFor="range-dropdown">
<h4>Preferred Participants</h4> 
</label>
<select
id="range-dropdown"
value={participantType }
onChange={handleParticipantType }
className="custom-select"
>
<option value="undergraduate">Undedrgraduate</option>
<option value="Graduate">Graduate</option>
<option value="Masters">Masters</option>
</select>
</div> 
<div className="postsurvey-field custom-dropdown">
<label className="required-label" htmlFor="range-dropdown">
<h4>Participants Points</h4> 
</label>
<select
id="range-dropdown"
value={participantPoint}
onChange={handleParticipantPoint}
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
      {/* Temporary click Action to be authenticated */}
                <button className="continue_survey btn" onClick={() => navigate('/surveyform')}>Continue</button>
    </div>
        </Form>
    </div>
</div>
    </section>
)    
}       
export default PostSurvey;