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

const SurveyForm = () =>{
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
               <img src={option} className="question-option-" alt="" />
                </div>
    </Form>
</div>
</div>
</section>
)
}
export default SurveyForm;