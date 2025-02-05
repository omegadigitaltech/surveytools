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
  const [amount, setAmount] = useState(0);
  const [preferredFaculty, setPreferredFaculty] = useState("all_faculties");
  const [preferredDepartment, setPreferredDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
  };

  React.useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);


  const faculty_dept = [
    { faculty: "Administration", departments: ["Accounting", "Business Administration", "Local Government Studies", "Public Administration"] },
    { faculty: "Agriculture", departments: ["Agricultural Economics", "Animal Sciences", "Crop Production and Protection", "Family, Nutrition & Consumer Sciences", "Soil Science"] },
    { faculty: "Arts", departments: ["Dramatic Arts", "English", "Foreign Languages", "History", "Linguistics and African Languages", "Music", "Philosophy", "Religious Studies"] },
    { faculty: "Education", departments: ["Adult Education and Lifelong Learning", "Educational Foundations and Counselling", "Educational Management", "Educational Technology", "Physical and Health Education", "Special Education and Curriculum Studies"] },
    { faculty: "EDM", departments: ["Architecture", "Building", "Estate Management", "Fine and Applied Arts", "Quantity Surveying", "Urban and Regional Planning"] },
    { faculty: "Law", departments: ["Business Law", "International Law", "Jurisprudence and Private Law", "Public Law"] },
    { faculty: "Pharmacy", departments: ["Clinical Pharmacy and Pharmacy Administration", "Pharmaceutical Chemistry", "Pharmaceutics", "Pharmacognosy", "Pharmacology"] },
    { faculty: "Science", departments: ["Biochemistry", "Botany", "Chemistry", "Geology", "Mathematics", "Microbiology", "Physics", "Zoology"] },
    { faculty: "Social Sciences", departments: ["Demography and Social Statistics", "Economics", "Geography", "Political Science", "Psychology", "Sociology and Anthropology"] },
    { faculty: "Technology", departments: ["Agricultural and Environmental Engineering", "Chemical Engineering", "Civil Engineering", "Computer Science and Engineering", "Electronic and Electrical Engineering", "Food Science and Technology", "Materials Science and Engineering", "Mechanical Engineering"] },
    { faculty: "Basic Medical Sciences", departments: ["Anatomy and Cell Biology", "Chemical Pathology", "Haematology and Immunology", "Medical Microbiology and Parasitology", "Medical Rehabilitation", "Morbid Anatomy and Forensic Medicine", "Nursing Science", "Physiological Sciences"] },
    { faculty: "Clinical Sciences", departments: ["Anaesthesia", "Community Health", "Dermatology and Venerology", "Medicine", "Mental Health", "Obstetrics, Gynaecology, and Perinatology", "Ophthalmology", "Orthopaedics and Traumatology", "Paediatrics and Child Health", "Radiology", "Surgery"] },
    { faculty: "Dentistry", departments: ["Child Dental Health", "Oral and Maxillofacial Surgery", "Oral Pathology and Oral Medicine", "Preventive and Community Dentistry", "Restorative Dentistry"] }
  ];

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
                    <option value="">Select Department</option>
                    {faculty_dept.find(f => f.faculty === preferredFaculty)?.departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
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
