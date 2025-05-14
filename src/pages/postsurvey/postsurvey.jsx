import { Link, Form, useNavigate, useActionData } from "react-router-dom";
import React, { useState } from 'react';
import "./postsurvey.css";
import backaro from "../../assets/img/backaro.svg";
import { faculty_dept } from "../../utils/constants/facultyData";


const PostSurvey = () => {
  const data = useActionData();
  console.log(data)

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState("");
  const [gender, setGender] = useState("all_genders");
  const [amount, setAmount] = useState(0);
  const [preferredFaculty, setPreferredFaculty] = useState("all_faculties");
  const [preferredDepartment, setPreferredDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const [hasAdditional, setHasAdditional] = useState(false);
  const [incText, setIncText] = useState("");
  const [excText, setExcText] = useState("");
  const [inclusions, setInclusions] = useState([]);
  const [exclusions, setExclusions] = useState([]);

  const handleSubmit = () => {
    setLoading(true);
  };

  React.useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);



  const handleParticipantsChange = (e) => {
    const value = e.target.value;
    setParticipants(value);

    const calculatedAmount = value ? value * 100 : 0;
    setAmount(calculatedAmount);
  };

  const handleFacultyChange = (e) => {
    setPreferredFaculty(e.target.value);
    setPreferredDepartment(""); // Reset department selection when faculty changes
  };

    // Criteria handlers
    const handleAdditionalChange = (e) => {
      setHasAdditional(e.target.value === 'yes');
    };
  
    const addInclusion = (e) => {
      e.preventDefault();
      if (incText.trim()) {
        setInclusions(prev => [...prev, incText.trim()]);
        setIncText("");
      }
    };
  
    const addExclusion = (e) => {
      e.preventDefault();
      if (excText.trim()) {
        setExclusions(prev => [...prev, excText.trim()]);
        setExcText("");
      }
    };
  return (
    <section className="postsurvey">
      <div className="postsurvey_wrap wrap">
        <div className="post-head flex">
          <Link to="/dashboard"><img src={backaro} className="backaro" /></Link>
          <h3>Post Questionnaire</h3>
        </div>
        <div className="postsurvey_div">
          <Form className="survey_form" method="post" action="/postsurvey" onSubmit={handleSubmit}>
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
              {/* <div className="postsurvey-field custom-dropdown">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Est. amount to be paid (₦)</h4>
                </label> */}
                {/* Calculated amount to be paid */}
                {/* <p className="num_partp-input">
                  ₦ <span className="result">{amount}</span>
                </p>
              </div> */}

            </div>
            <div className="postsurvey-field gender-area custom-dropdown">
              <label className="required-label" htmlFor="range-dropdown">
                <h4>Preferred gender of participants</h4>
              </label>
              <select
                name="gender"
                id="range-dropdown"
                className="custom-select">
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                <option value="all_genders">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="postsurvey-field custom-dropdown">
              <label className="required-label" htmlFor="range-dropdown">
                <h4>Preferred Participants</h4>
              </label>
              <select name="faculty" value={preferredFaculty}
                className="custom-select"
                id="range-dropdown"
                onChange={handleFacultyChange}>
                <option value="all_faculties">All Faculties</option>
                {faculty_dept.map((item) => (
                  <option key={item.faculty} value={item.faculty}>{item.faculty}</option>
                ))}
              </select>
            </div>
            {/* Where users can select department if they choose a particular faculty */}
            <div className="postsurvey-field custom-dropdown">
              {preferredFaculty !== "all_faculties" && (
                <div className="postsurvey-field">
                  <label><h4>Preferred Department</h4></label>
                  <select name="department" value={preferredDepartment}
                    id="range-dropdown"
                    className="custom-select"
                    onChange={(e) => setPreferredDepartment(e.target.value)}>
                    <option value="all_departments">All Departments</option>
                    {faculty_dept.find(f => f.faculty === preferredFaculty)?.departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* Additional Criteria */}
            <div className=" postsurvey-field custom-dropdown">
              <label className="required-label" htmlFor="range-dropdown">
                <h4>Do you have additional criteria for eligible participants?</h4>
              </label>
              <select
                name="add_criteria"
                id="range-dropdown"
                className="custom-select"
                  value={hasAdditional ? 'yes' : 'no'}
                onChange={handleAdditionalChange}
                  >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {/* If user clicks Yes for criteria */}
            {hasAdditional && (
            <div class="yes-criteria">
              {/* Inclusion Criteria */}
              <div className="postsurvey-field">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Inclusion Criteria</h4>
                </label>
                <div className="flex crit-box">
                   <input
                  className="num_partp-input"
                  type="text"
                  name="inclusion_criteria"
                  id=""
                  value={incText}
                      onChange={e => setIncText(e.target.value)}
                  placeholder="e.g Must should be 18 years and above"
                />
                   <button className="flex" onClick={addInclusion}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z"/></svg> Add criteria</button>
                </div>
               {/* Display added criteria here */}
               <div className="added-criteria">
                <ul>
                {inclusions.map((crit, i) => (
                        <li key={i} >{crit} </li> 
                      ))}
                </ul>
               </div>
              </div>
              {/* Exclusion Criteria */}
                 <div className="postsurvey-field ">
                <label className="required-label" htmlFor="range-dropdown">
                  <h4>Exclusion criteria</h4>
                </label>
                <div className="flex crit-box">
                <input
                  className="num_partp-input"
                  type="text"
                  name="exclusion_criteria"
                  id=""
                  value={excText}
                  onChange={e => setExcText(e.target.value)}
                  placeholder="e.g Newly admitted student"
                />
              <button className="flex" onClick={addExclusion}><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#000000"><path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z"/></svg>Add criteria</button>
                </div>
                {/* Display added criteria here */}
               <div className="added-criteria">
                <ul>
                {exclusions.map((crit, i) => (
                        <li key={i} >{crit} </li>
                      ))}
                </ul>
               </div>
              </div>             
            {/* </div> */}

 {/* Hidden inputs for submission */}
 {inclusions.map((crit, i) => (
  <input
    type="hidden"
    name="inclusion_criteria"
    value={crit}
    key={`inc-${i}`}
  />
))}
{exclusions.map((crit, i) => (
  <input
    type="hidden"
    name="exclusion_criteria"
    value={crit}
    key={`exc-${i}`}
  />
))}
</div>
)}

            <div className="flex btn_div">
              <input type="hidden" name="amount" value={amount} />
              <button type="submit" className="continue_survey btn" disabled={loading}>
                {loading ? "Submitting..." : "Continue"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default PostSurvey;
