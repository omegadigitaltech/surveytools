import { Form, Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from "date-fns";
import config from "../../config/config";
import useAuthStore from "../../components/store/useAuthStore";

import clock from "../../assets/img/clock.svg";
import filter from "../../assets/img/filter.svg";
import notifyIcon from "../../assets/img/notifyicon.svg";
import profileimg from "../../assets/img/profileimage.png";
import "./notifications.css"


const Notifications = () => {

  const [searchKey, setSearchKey] = useState("");
  const [activeNotify, setActiveNotify] = useState("all-notification");
  const notifications = useAuthStore((state) => state.notifications);
  const setNotifications = useAuthStore((state) => state.setNotifications);
  const authToken = useAuthStore((state) => state.authToken);
  // For Group By
  const [groupBy, setGroupBy] = useState('date');
  const handleGroupBy = (event) => {
    const selectedGroup = event.target.value
    setGroupBy(selectedGroup);
    console.log("user choose: ", selectedGroup)
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (notifications.length > 0) return;  // Skip fetching if

      const API_URL = `${config.API_URL}/surveys`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };

      try {
        const response = await fetch(API_URL, options);
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Failed to fetch notifications");
        }

        // Sort by createdAt in descending order
        const sortedNotifications = json.surveys.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
      } catch (error) {
        toast.error(error.message || "Error fetching notifications");
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [authToken, notifications, setNotifications]);

  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(searchKey.toLowerCase())
  );

  return (
    <section className="notification-section">
      <div className="notification-inner wrap">
        <div className="notification-head flex">
          <div className="notification-status flex">
            <button
              className={`all-notification ${activeNotify === 'all-notification' ? 'active-notification' : ''}`}
              onClick={() => setActiveNotify("all-notification")}
            >All</button>
            <button
              className={`unread-notification ${activeNotify === 'unread-notification' ? 'active-notification' : ''}`}
              onClick={() => setActiveNotify("unread-notification")}>
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
                  value={groupBy}
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
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <Link
                to={`/expandsurvey/${notification._id}`}
                key={notification._id}
                className="notification flex"
              >
                <div className="notification-info flex">
                  <div className="notification-img">
                    <img src={profileimg} className="userImage" alt="" />
                  </div>
                  <div className="notification-info">
                    <p className="userName">{notification.user_id ? notification.user_id.fullname : "Unknown User"}
                    </p>
                    <span className="notifcation-msg">Sent a new survey, check it out....</span>
                  </div>
                </div>
                <div className="notification-time flex">
                  <img src={clock} alt="" className="clock" />
                  <span className="posted-time"> {formatDistanceToNow(parseISO(notification.createdAt), {
                    addSuffix: true,
                  })}</span>
                  <img src={notifyIcon} alt="" className="notifyIcon" />
                </div>
              </Link>
            ))
          ) : (
            <p className="no-notifications">No notifications found...</p>
          )}
        </div>
      </div>
    </section >
  );
}
export default Notifications;