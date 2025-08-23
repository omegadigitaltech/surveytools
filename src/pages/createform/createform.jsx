import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import React, { useState } from 'react';
import backaro from "../../assets/img/backaro.svg";
import "./createform.css"

const CreateForm = () =>{
    const [loading, setLoading] = useState(false);


const handleSubmit = () => {
            setLoading(true);
          };

    return(
          <section className="postsurvey">
         <div className="postsurvey_wrap wrap">
          <div className="post-head flex">
          <Link to="/dashboard"><img src={backaro} className="backaro" /></Link>
           <h3>Create Form</h3>
          </div>
          <div className="postsurvey_div">
          <Form className="survey_form" method="post" >
            <div className="postsurvey-field">
              <label className="postsurvey-label" htmlFor="title">
                <h4>Form Title</h4>
              </label>
              <input
                className="postsurvey-input"
                type="text"
                name="title"
                id="title"
                // value={title}
                // onChange={(e) => setTitle(e.target.value)}
                required
              />
              </div>
             <div className="postsurvey-field">
              <label className="postsurvey-label" htmlFor="description">
                <h4>Form Description</h4>
              </label>
              <textarea
                name="description"
                id="description"
                cols="30"
                rows="10"
                placeholder="Write a description..."
                required
                // value={description}
                // onChange={(e) => setDescription(e.target.value)}
                ></textarea>
             </div>
             <div className="flex btn_div">
              <button type="submit" className="continue_survey btn" disabled={loading}>
                {loading ? "Submitting..." : "Continue"}
              </button>
            </div>
                </Form>
             </div>
             </div>
              </section>

    )
};

export default CreateForm;