import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import React, { useState, useEffect } from "react";
import backaro from "../../assets/img/backaro.svg";
import "./createform.css";

const CreateForm = () => {
  const [loading, setLoading] = useState(false);
  const data = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset loading when action completes (whether success or error)
    if (data !== undefined) {
      setLoading(false);
    }
  }, [data]);

  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <section className="postsurvey">
      <div className="postsurvey_wrap wrap">
        <div className="post-head flex">
          <Link to="/dashboard">
            <img src={backaro} className="backaro" alt="Back" />
          </Link>
          <h3>Create Form</h3>
        </div>
        <div className="postsurvey_div">
          <Form
            className="survey_form"
            method="post"
            action="/create-form"
            onSubmit={handleSubmit}
          >
            <div className="postsurvey-field">
              <label className="postsurvey-label" htmlFor="title">
                <h4>Form Title</h4>
              </label>
              <input
                className="postsurvey-input"
                type="text"
                name="title"
                id="title"
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
              ></textarea>
            </div>
            <div className="flex btn_div">
              <button
                type="submit"
                className="continue_survey btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Continue"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default CreateForm;
