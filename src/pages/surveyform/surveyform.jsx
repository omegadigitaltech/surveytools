import {Link, Form} from "react-router-dom";
import Select from 'react-select';
import React, { useState } from 'react';

// import React from 'react';
import { components } from 'react-select';

import "./surveyform.css"
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import add from "../../assets/img/add.svg";
import dot from "../../assets/img/dot.svg";
import option from "../../assets/img/option.svg";
import copy from "../../assets/img/copy.svg"
import dropdown from "../../assets/img/dropdown.svg"


const SurveyForm = () =>{
    // Handle the form choice
    const [choiceType, setChoiceType] = useState('Mutiple Choice');
    const [choiceOption, setChoiceOption] = useState('A. Option A');

    const handleChoiceType = (event) => {
        setChoiceType(event.target.value);
      };

      const handleChoiceOption = (event) => {
        setChoiceOption(event.target.value);
      };
return(
<section className="form">
<div className=" wrap">
<div className="form-head flex">
<Link to="/postsurvey"> <img src={backaro} className="backaro" /></Link>
<div className="form-h">
    <h3>Form Page</h3>
    </div>
</div>
<div className="form-container">
    <Form className="">
    <div className="question-field flex">
                    <input className="question-input" type="text" placeholder="Untitled Question" name="qurestion" id="question" />
               <img src={copy} className="copy-icon" alt="" />
               <img src={del} className="delete-icon" alt="" />
               <img src={option} className="question-option" alt="" />
                </div>

                <div className="choice-field">       
<div className="choice-field custom-dropdown flex">
  {/* Choice */}
   <div className=" wrap-icon flex">
    <img src={dot} className="dot-icon" alt="" />
<select
id="choice-dropdown"
value={choiceType }
onChange={handleChoiceType }
className="choice-select"
>
<option value="Mutiple Choice"> Mutiple Choice</option>
<option value="Single Choice">Single Choice</option>
</select>
</div>
{/* Option */}
<div className="wrap-icon flex">
    <select
id="option-dropdown"
value={choiceOption}
onChange={handleChoiceOption}
className="option-select"
>
<option value="Option A">A. Option A</option>
<option value="Option B">Graduate</option>
<option value="Option C">Masters</option>
</select>
</div>
</div> 
      </div>
    </Form>
</div>
</div>
</section>
)
}
export default SurveyForm;