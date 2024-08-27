import {Link, Form} from "react-router-dom";
import Select from 'react-select';
import React, { useState } from 'react';

// import React from 'react';
import { components } from 'react-select';

import "./postsurvey.css"
import backaro from "../../assets/img/backaro.svg";
// import downaro from "../../assets/img/downaro.svg"

const PostSurvey = () =>{

  const [selectedRange, setSelectedRange] = useState('0-200');
  const handleChange = (event) => {
    setSelectedRange(event.target.value);
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
                 <div className="postsurvey-field custom-dropdown">

                 <label className="required-label" htmlFor="range-dropdown">
                 <h4>Required Participants</h4> 
                  </label>
      <select
        id="range-dropdown"
        value={selectedRange}
        onChange={handleChange}
        className="custom-select"
      >
        <option className="option" value="0-200">0-200</option>
        <option value="0-400">0-400</option>
        <option value="0-600">0-600</option>
        <option value="0-800">0-800</option>
      </select>
                </div> 
   
        </Form>
    </div>
</div>
    </section>
)    
}       
export default PostSurvey;