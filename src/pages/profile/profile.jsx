import {Link, Form} from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import okiki from "../../assets/img/okiki.png";
import profileBg from "../../assets/img/profile-bg.png";

import "./profile.css"


const Profile = () =>{
    return(
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
    <img src={okiki} className="userImage" alt="" />
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
    </div> 
</div>
        </div>
        </div>
        </section>
    )
}
export default Profile;