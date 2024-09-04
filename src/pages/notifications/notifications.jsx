import { Form, Link, useNavigate } from "react-router-dom";
import { components } from 'react-select';
import React, { useState } from 'react';


import clock from "../../assets/img/clock.svg";
import filter from "../../assets/img/filter.svg";
import notifyIcon from "../../assets/img/notifyicon.svg";
import profileimg from "../../assets/img/profileimage.png"
import "./notifications.css"


const Notifications = () => {
    // Notification-status 
    const [activeNotify, setActiveNotify] = useState('all-notification');
const changeStatus = (notifyStatus) =>{
  setActiveNotify(notifyStatus)
}
  // For Group By
    const [groupBy, setGroupBy] = useState('date');

    const handleGroupBy = (event) => {
        const selectedGroup = event.target.value
        setGroupBy(selectedGroup);
        console.log("user choose: ", selectedGroup)
      };
    //  
return(
    <section className="notification-section">
<div className="notification-inner wrap">
<div className="notification-head flex">
    <div className="notification-status flex">
        <button
       className={`all-notification ${activeNotify === 'all-notification' ? 'active-notification' : ''}`}
       onClick={() => changeStatus('all-notification')}
        >All</button>
        <button 
        className={`unread-notification ${activeNotify === 'unread-notification' ? 'active-notification' : ''}`}
        onClick={() => changeStatus('unread-notification')}>
          Unread</button>
    </div>
    <div className="filter-notification">
    <Form className="filterForm">
            <fieldset className="filter-field flex">
              <button className="flex" type="submit">
                <img src={filter} />
              </button>
              <input type="text" placeholder="Filter Notification" onChange={(e) => setSearchKey(e.target.value)} />
            </fieldset>
          </Form>
    </div>
    <div className="group-notification">
        <Form>
        <div className=" wrap-icon ">
<select
id="group"
value={groupBy }
onChange={handleGroupBy}
className="groupBy"
>
<option className="groupa" value="date">Group by; Date</option>
<option value="type">Group by; Type</option>
<option value="time">Group by; Time</option>
</select>
</div>
        </Form>
    </div>
</div>
<h3 className="notification-head" >Notifications</h3>
<div className="notification-body">

    {/* TEMPORARY JUST TO GET THE DESIGN */}
    <Link to="" className="notification flex">
<div className="notification-info flex">
  <div className="notification-img">
    <img src={profileimg} className="userImage" alt="" />
  </div>
  <div className="notification-info">
    <p className="userName">David peter</p>
    <span className="notifcation-msg">Name sent a new survey, check it out....</span>
  </div>
  </div>
  <div className="notification-time flex">
    <img src={clock} alt="" className="clock"/>
    <span className="posted-time">9 mins ago</span>
    <img src={notifyIcon} alt="" className="notifyIcon" />
  </div>
    </Link>
    </div>
</div>
    </section>
)
}
export default Notifications;