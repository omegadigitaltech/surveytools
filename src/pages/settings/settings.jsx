import {Link, Form} from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";

import "./settings.css";

const Settings = () => {
    return(
        <section className="settings">
<div className="wrap">
    <div className="settings-inner flex">
    <div className="form-head">
<Link to=""> <img src={backaro} className="settings-backaro backaro" /></Link>
</div>
<div className="settings-body">
<div className="settings-head">
    <h3>Settings</h3>
    </div>
    <div className="settings-form-div">
        <Form>
            <div className="profile-settings">
            <h5>Profile Settings</h5>
            <div className="Profile-names flex">
                <fieldset className="pf-firstname-field">
                    <label className="pf-firstname-label" htmlFor="">
                       First Name
                    </label>
                    <input className="pf-firstname-input " type="text" name="pf-firstname" id="" />
                </fieldset>
                <fieldset className="pf-lastname-field">
                    <label className="pf-lastn-ame-label" htmlFor="">
                       Last Name
                    </label>
                    <input className="pf-lastname-input" type="text" name="pf-lastname" id="" />
                </fieldset>    
                </div>
            </div>
        </Form>
    </div>
</div>
    </div>
</div>
        </section>
    )
}
export default Settings;