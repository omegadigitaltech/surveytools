import { Link, Form } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./profile.css"
import data from "../../utils/content/data";
import useAuthStore from "../../store/useAuthStore";
import user from "../../assets/img/user.png"

const Profile = () => {
    const { userName, userInst } = useAuthStore();

    return (
        <section className="Profile-section">
            <div className="wrap profile-wrap">
                <div className="profile-inner ">
                    <div className="profile-head flex">
                        <Link to="/dashboard"> <img src={backaro} className="backaro" /></Link>
                        <div className="">
                            <h3>Profile</h3>
                        </div>
                    </div>
                    <div className="profile-body flex">
                        {/* Visible for mobile */}
                        <div className="card-mob">
                        <div className="userImage-div">
                                <img src={user} className="userImage" alt="" />
                                {/* Upload profile image */}
                            </div> 
                        </div>
                        {/* Visible for desktop */}
                        <div className="profile-card card-desk flex">
                            <div className="userImage-div">
                                <img src={user} className="userImage" alt="" />
                                {/* Upload profile image */}
                            </div>
                            {/* <div className="profilecard-btns flex">
                                <hr />
                                <Link to="/settings" className="settings-btn"> Settings</Link>
                                <Link to="/settings" className="edit-profile">Edit Profile</Link>
                            </div> */}
                        </div>

                        <div className="profile-info">
                            <h4>My Profile</h4>
                            <hr />
                            <div className="profile-name-field ">
                                <h5>Name</h5>
                                <div className="name-display info-display">
                                    {userName}
                                </div>
                                {/* LATER */}
                                {/* <p>Ensure to use your real name based on your bank account to help make withdrawal easier and faster</p> */}
                              {/* LATER */}
                                {/* <div className="agesex flex">
                                    <div className="age-box ">
                                        <h5>Age</h5>
                                        <div className="age-display info-display">
                                            
                                        </div>
                                    </div>
                                    <div className="gender-box">
                                        <h5>Sex</h5>
                                        <div className="gender-display info-display">
                                                                                    </div>
                                    </div>
                                </div> */}
                                <div className="dept-box">
                                    <h5>Institution</h5>
                                    <div className="dept-display info-display">
                                        {userInst}
                                    </div>
                                </div>
                                {/* LATER WE WILL IMPLEMENT */}
                                {/* <div className="bio-box">
                                    <h5>Bio</h5>
                                    <div className="bio-display">

                                    </div>
                                </div> */}
                            </div>
                            {/* <div className="profilecard-btns mob-pro-btn flex ">
                                <Link to="/settings" className="settings-btn"> Settings</Link>
                                <Link to="/settings"  className="edit-profile">Edit Profile</Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}
export default Profile;