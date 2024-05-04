import "../utils.css";
import "./signup.css";

import { Form, Link, useActionData } from "react-router-dom";
import features from "../../assets/img/illustration-signup.svg";

const SignUp = () => {
    const data = useActionData();
    console.log(data)
    return (
        <div className="signup">
            <div className="signup-col signup-place">
                <h2 className="signup-lead">Sign up!</h2>
                <div className="signup-link">Already have an account?&nbsp;
                    <Link to="/signin">Sign in</Link>
                </div>
                { 
                    data?.message && 
                    <div className="">
                        {data.message}
                    </div>
                }
                <Form method="post" action="/signup">
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="">
                            Fullname
                        </label>
                        <input className="signup-input" type="text" name="fullname" id="" />
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="">
                            Email
                        </label>
                        <input className="signup-input" type="email" name="email" id="" />
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="">
                            School ID
                        </label>
                        <input className="signup-input" type="text" name="schoolId" id="" />
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="">
                            Password
                        </label>
                        <input className="signup-input" type="password" name="password" id="" />
                    </div>
                    <div className="signup-field">
                        <label className="signup-label" htmlFor="">
                            Confirm Password
                        </label>
                        <input className="signup-input" type="password" name="check" id="" />
                    </div>
                    <label>
                        <input className="signup-check" type="checkbox" name="" id="" />
                        By creating an account, you agree to our <Link className="" to="#">Terms and Condition</Link> & <Link className="" to="#">Privacy Policy</Link>
                    </label>
                    <button className="signup-enter">Sign up</button>
                </Form>
            </div>
            <div className="signup-col signup-image">
                <img src={features} alt="" />
            </div>
        </div>
    )
}

export default SignUp;