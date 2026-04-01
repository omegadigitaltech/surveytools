import React, { useState, useEffect } from "react";
import { Form, Link, useActionData, useNavigate, } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import useAuthStore from "../../store/useAuthStore";
import action from "./action";
import "./signup.css";
import "../utils.css";
import features from "../../assets/img/illustration-signup.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";
import { faculty_dept } from "../../utils/constants/facultyData";

const SignUp = () => {
  const navigate = useNavigate();
  const setSignupEmail = useAuthStore((state) => state.setSignupEmail);
  // const actionData = useActionData();
  const [showPassword, setShowPassword] = useState(false);
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");

  const handleToggle = () => {
    setShowPassword((prevState) => !prevState);
  };
  const iconPass = showPassword ? iconShow : iconHide;
  
  const [loading, setLoading] = useState(false);

  const handleFacultyChange = (e) => {
    setFaculty(e.target.value);
    setDepartment(""); // Reset department when faculty changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const formData = new FormData(e.target);  
    const response = await action({ formData });
    
    if (response?.status === "success") {
      setSignupEmail(response.signupEmail);
      setTimeout(() => {
        setLoading(false);
          navigate("/verify");
      }, 1500);
    } else {
      setLoading(false);
    }
  }
    catch (err) {
    console.error("Unexpected error:", err);
    setLoading(false);
  }
    };

  return (
    <div className="auth-w4 flex">
      <div className="form-col">
        <h1 className="auth-w5-heading">Create An Account</h1>
        <p className="text-gray-600 mb-4 auth-w5-subtitle">Start taking surveys, earn rewards and learn through research.</p>

        <Form className="auth-w4-form" method="post" action="/signup" onSubmit={handleSubmit}>
          <div className="auth-w4-grid">
            {/* Name fields - side by side */}
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="firstname">
                Name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="firstname"
                id="firstname"
                placeholder="First name"
                required
              />
            </div>
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="lastname">
                Last Name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="lastname"
                id="lastname"
                placeholder="Last name"
                required
              />
            </div>

            {/* Email - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="email">
                Email
              </label>
              <input
                className="auth-w4-input"
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Institution - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="institution">
                Institution
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="institution"
                id="institution"
                placeholder="Enter your institution name"
                required
              />
            </div>

            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="gender">
                Gender
              </label>
              <select
                className="auth-w4-input"
                name="gender"
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="faculty">
                Faculty
              </label>
              <select
                className="auth-w4-input"
                name="faculty"
                id="faculty"
                value={faculty}
                onChange={handleFacultyChange}
                required
              >
                <option value="">Select Faculty</option>
                {faculty_dept.map((item) => (
                  <option key={item.faculty} value={item.faculty}>
                    {item.faculty}
                  </option>
                ))}
              </select>
            </div>

            {/* Department - conditional rendering */}
            {faculty && (
              <div className="auth-w4-field auth-w4-full">
                <label className="auth-w4-label" htmlFor="department">
                  Department
                </label>
                <select
                  className="auth-w4-input"
                  name="department"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {faculty_dept
                    .find(f => f.faculty === faculty)
                    ?.departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="password">
                Password
              </label>
              <div className="auth-w4-wrap">
                <input
                 className="auth-w4-input"
                 type={showPassword ? "text" : "password"}
                 name="password"
                 id="password"
                 placeholder="Create a password"
                  required
                 />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt="Toggle Password Visibility"
                />
              </div>
            </div>

            {/* Confirm Password - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="auth-w4-wrap">
                <input
                  className="auth-w4-input "
                  type={showPassword ? "text" : "password"}
                  name="confirm"
                  id="confirm"
                  placeholder="Confirm password"
                  required
                />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt="Toggle Password Visibility"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions checkbox */}
          <label className="auth-w4-block agree-terms" htmlFor="terms">
            <input className="check" type="checkbox" id="terms" required />
            Agree to{" "} 
            <Link to="">
              terms & condition
            </Link>
          </label>

          {/* Submit button */}
          <button className="auth-w4-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create an Account"}
          </button>
        </Form>

        {/* Sign in link */}
        <div className="auth-w4- text-center">
          Have an account already?&nbsp;
          <Link className="auth-w4-" to="/signin">
            Login
          </Link>
        </div>
      </div>

      <div className="absolute top-0 right-0 h-screen w-[50%] flex justify-center items-center signup-col signup-image">
        <img src={features} alt="" />
      </div>
    </div>
  );
};

export default SignUp;