import { Link, Form } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./profile.css"
import data from "../../utils/content/data";
import useAuthStore from "../../components/store/useAuthStore";


const Profile = () => {
    const { userName, userInst} = useAuthStore();

    return (
            <section className="Profile-section">
                <div className="wrap">
                    <div className="profile-inner ">
                        <div className="profile-head flex">
                            <Link to=""> <img src={backaro} className="backaro" /></Link>
                            <div className="">
                                <h3>Form Page</h3>
                            </div>
                        </div>
                        <div className="profile-body flex">
                            <div className="profile-card flex">
                                <div className="userImage-div">
                                    <img src="" className="userImage" alt="" />
                                    {/* Upload profile image */}
                                </div>
                                <div className="profilecard-btns flex">
                                    <hr />
                                    <button className="settings-btn"> Settings</button>
                                    <button className="edit-profile">Edit Profile</button>
                                </div>
                            </div>

                            <div className="profile-info">
                                <h4>Public Profile</h4>
                                <hr />
                                <div className="profile-name-field">
                                    <h5>Name</h5>
                                    <div className="name-display info-display">
                                      {userName}
                                    </div>
                                    <p>Ensure to use your real name based on your bank account to help make withdrawal easier and faster</p>
                                    <div className="agesexdept grid">
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
                                        <div className="dept-box">
                                            <h5>Institution</h5>
                                            <div className="dept-display info-display">
                                          {userInst}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bio-box">
                                        <h5>Bio</h5>
                                        <div className="bio-display">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

    )
}
export default Profile;