import { Form, Link, useNavigate } from "react-router-dom";
import { components } from 'react-select';
import React, { useState } from 'react';


import notify from "../../assets/img/notification.svg";
import clock from "../../assets/img/clock.svg";
import filter from "../../assets/img/filter.svg";

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
    <section className="notifications">
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
</div>
    </section>
)
}
export default Notifications;