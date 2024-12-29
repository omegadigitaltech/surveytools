import { Link, Form } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import del from "../../assets/img/del.svg";
import "./settings.css";

const Settings = () => {
  return (
    <section className="settings">
      <div className="wrap settingswrap">
        <div className="settings-inner flex">
          <div className="form-head">
            <Link to="">
              <img src={backaro} className="settings-backaro backaro" alt="Back" />
            </Link>
          </div>
          <div className="settings-body">
            <div className="settings-head">
              <h3>Settings</h3>
            </div>
            <div className="settings-form-div">
              <Form>
                {/* Profile Settings */}
                <div className="profile-settings">
                  <h5>Profile Settings</h5>
                  <div className="profile-names flex">
                    <fieldset className="settings-field">
                      <label className="settings-label" htmlFor="pf-firstname">
                        First Name
                      </label>
                      <input
                        className="pf-firstname-input settings-input"
                        type="text"
                        name="pf-firstname"
                        id="pf-firstname"
                      />
                    </fieldset>
                    <fieldset className="settings-field">
                      <label className="settings-label" htmlFor="pf-lastname">
                        Last Name
                      </label>
                      <input
                        className="pf-lastname-input settings-input"
                        type="text"
                        name="pf-lastname"
                        id="pf-lastname"
                      />
                    </fieldset>
                  </div>
                  <fieldset className="settings-field">
                    <label className="settings-label" htmlFor="about">
                      About
                    </label>
                    <textarea
                      className="settings-input set-about"
                      name="pf-about"
                      id="about"
                      rows="4"
                    ></textarea>
                  </fieldset>
                </div>

                {/* Profile Picture */}
                <div className="profile-picture">
                  <h5>Profile Picture</h5>
                  <div className="profile-picture-content flex">
                    <img
                      src="https://via.placeholder.com/256"
                      alt="Profile"
                      className="pr-set-img"
                    />
                    <div className="profile-actions">
                      <button type="button" className="btn-change ">Change Picture</button>
                      <button type="button" className="btn-delete flex">
                        <img src={del} alt="Delete" /> Delete
                      </button>
                    </div>
                  </div>
                  <p className="help-text">
                    Add your photo. Recommended size is 256x256.
                  </p>
                </div>

                {/* Change Password */}
                <div className="change-password">
                  <h5>Change Password</h5>
                  <p>This will be used to log into your account and complete high-sensitivity actions.</p>
                  <fieldset className="settings-field">
                    <label className="settings-label" htmlFor="current-password">
                      Current Password
                    </label>
                    <input
                      className="settings-input"
                      type="password"
                      name="current-password"
                      id="current-password"
                    />
                  </fieldset>
                  <fieldset className="settings-field">
                    <label className="settings-label" htmlFor="new-password">
                      New Password
                    </label>
                    <input
                      className="settings-input"
                      type="password"
                      name="new-password"
                      id="new-password"
                    />
                  </fieldset>
                  <fieldset className="settings-field">
                    <label className="settings-label" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <input
                      className="settings-input"
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                    />
                  </fieldset>
                </div>

                {/* Notifications */}
                <div className="set-notifications">
                  <h5>Notifications</h5>
                  <p>
                    Never miss any survey, we’ll let you know when a new survey that fits your profile comes up.
                  </p>
                  <div className="set-notify-opt">
                    <fieldset>
                      <h5>Email</h5>
                      <div className="mail-notify">
                        <label>
                          <input type="checkbox" name="email-comments" /> Comments
                        </label>
                        <label>
                          <input type="checkbox" name="email-new-surveys" /> New Surveys
                        </label>
                        <label>
                          <input type="checkbox" name="email-others" /> Others
                        </label>
                      </div>

                    </fieldset>
                    <fieldset>
                      <h5>Push Notification</h5>
                      <div className="push-notify-box">
                        <label>
                          <input type="checkbox" name="push-everything" /> Everything
                        </label>
                        <label>
                          <input type="checkbox" name="push-same-as-email" /> Same as email
                        </label>
                        <label>
                          <input type="checkbox" name="push-none" /> No notification
                        </label>
                      </div>
                    </fieldset>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="delete-account">
                  <h5>Delete Personal Account</h5>
                  <p>Don’t need SurveyPro any longer? We hate to see you go.</p>
                  <button type="button" className="btn-delete-account">
                    Delete Account
                  </button>
                </div>

                {/* Save Changes */}
                <div className="setting-action flex">
                  <button type="button" className="btn-cancel">Cancel</button>
                  <button type="submit" className="btn-save">Save Changes</button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
