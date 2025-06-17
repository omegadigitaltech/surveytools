import { useEffect, useState } from "react";
import { Form, Link } from "react-router-dom";
import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import { toast } from "react-toastify";
import { formatDistanceToNow, parseISO } from "date-fns";
import search from "../../assets/img/search.svg";
import sort from "../../assets/img/sort.svg";
import dept from "../../assets/img/dept.svg";
import members from "../../assets/img/members.svg";
import view from "../../assets/img/eye.svg";
import unview from "../../assets/img/uneye.svg";
import nextaro from "../../assets/img/nextaro.svg";
import useModalStore from "../../store/useModalStore";
import useOutsideClick from "../../hooks/useOutsideClick";

import "./dashboard.css";

// components
import RedeemModal from "./RedeemModal";
import ConfirmDetails from "./ConfirmDetails";
import Report from "./Report";
import useAppStore from "../../store/useAppStore";
// import ContestModal from "../../components/ContestModal";

const Dashboard = () => {
  const [searchKey, setSearchKey] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const authToken = useAuthStore((state) => state.authToken);
  const surveys = useAuthStore((state) => state.surveys);
  const setSurveys = useAuthStore((state) => state.setSurveys);
  const [showPoint, setShowPoint] = useState(false);
  const [mySurveys, setMySurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // zustand
  const {
    redeemModalOpen,
    confirmModalOpen,
    reportModalOpen,
    setRedeemModalOpen,
    openModalAnimate,
    setOpenModalAnimate,
  } = useModalStore();
  const { pointBalance, setPointBalance } = useAppStore();

  //  functions
  const fetchMySurveys = async () => {
    setIsLoading(true);
    const API_URL = `${config.API_URL}/my-surveys`;
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
        throw new Error(json.message || "Failed to fetch my surveys");
      }

      setMySurveys(json.mySurveys);
    } catch (error) {
      toast.error(error.message || "Error fetching my surveys");
      console.error("Error fetching my surveys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "my-surveys") {
      fetchMySurveys();
    }
  };

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchKey.toLowerCase())
  );

  const pointToggle = () => {
    setShowPoint((prevState) => !prevState);
  };
  const iconPass = showPoint ? view : unview;

  // useEffect's
  useEffect(() => {
    const fetchSurveys = async () => {
      const API_URL = `${config.API_URL}/surveys`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await fetch(API_URL, options);
      const json = await response.json();

      try {
        if (!response.ok) {
          throw new Error(json.message || "Failed to fetch surveys");
        }

        // Sort surveys by createdAt in descending order
        const sortedSurveys = json.surveys.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSurveys(sortedSurveys);
      } catch (error) {
        toast.error(error.message || "Error fetching surveys");
        console.error("Error fetching surveys:", error);
      }
    };
    fetchSurveys();
  }, [authToken, setSurveys]);

  useEffect(() => {
    const fetchPointBalance = async () => {
      try {
        const response = await fetch(`${config.API_URL}/user/points`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const json = await response.json();

        if (response.ok) {
          setPointBalance(json.data.points);
        } else {
          throw new Error(json.msg || "Failed to fetch points");
        }
      } catch (error) {
        console.error("Error fetching points:", error);
        // toast.error("Error loading points balance");
      } finally {
        setIsLoadingPoints(false);
      }
    };

    fetchPointBalance();
  }, [authToken]);

  useEffect(() => {
    if (redeemModalOpen === true) {
      setOpenModalAnimate(true);
    }
    if (redeemModalOpen === false) {
      setOpenModalAnimate(false);
    }
  }, [redeemModalOpen]);

  const handleModalOpen = () => {
    setRedeemModalOpen(true);
  };

  return (
    <>
      {/* <ContestModal /> */}
      <section className="dashboard">
        <div className="dashboard_inner wrap">
          <div className="points-board ">
            <div className="points-main">
              <div className="points-label flex">
                Points Balance:
                <img src={iconPass} onClick={pointToggle} alt="View Points" />
              </div>
              <div className="points-value">
                {isLoadingPoints ? (
                  <div className="points-loader"></div>
                ) : showPoint ? (
                  pointBalance?.toFixed(2) || "0.00"
                ) : (
                  "****"
                )}
              </div>
            </div>
            <div className="points-side">
              <div className="transactions-history">
                {/* <Link href="">
                  Transactions History <img src={nextaro} alt="" />{" "}
                </Link> */}
              </div>
              <button
                className="redeem-button"
                type="button"
                onClick={handleModalOpen}
              >
                Redeem
              </button>
            </div>
          </div>

          <div className="dash_head flex">
            <Form className="classForm">
              <div className="search desktop flex">
                <button className="flex" type={"submit"}>
                  <img src={search} />
                </button>
                <input
                  type="text"
                  placeholder="Search for surveys"
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            </Form>
            <div className="dashboard_sort flex">
              <h4>Sort by</h4> <img src={sort} alt="" />
            </div>
          </div>
          <div className="dashboard_surveys">
            <div className="survey_head flex">
              <h3
                className={`${activeTab === "available" ? "active_head" : ""}`}
                onClick={() => handleTabClick("available")}
              >
                Available Surveys
              </h3>
              <h3
                className={`${activeTab === "my-surveys" ? "active_head" : ""}`}
                onClick={() => handleTabClick("my-surveys")}
              >
                My Surveys
              </h3>
            </div>
            <div className="survey_posts">
              {activeTab === "available" ? (
                filteredSurveys.length > 0 ? (
                  filteredSurveys.map((survey, index) => (
                      <div
                        className={`survey_post ${
                          index === 0 ? "first_post" : ""
                        }`}
                        key={survey._id}
                        onClick={() => window.location = `/expandsurvey/${survey._id}`}
                      >
                        {/* new div new */}
                          <div className="survey-card-content">
                        <div className="post_time flex">
                          <p className="posted">
                            Posted{" "}
                            {formatDistanceToNow(parseISO(survey.createdAt), {
                              addSuffix: true,
                            }) || "N/A"}
                          </p>
                          {/* <p className="duration">
                            Duration: <b>{survey.duration || 0}</b> min
                          </p> */}
                          <h4 className="user-point">
                            Point: {survey.point_per_user || 0}
                          </h4>
                        </div>
                        <div className="survey_details flex">
                          <h3 className="survey_title">{survey.title}</h3>
                          {/* <h4 className="point">
                            {survey.point_per_user || 0} Pts
                          </h4> */}
                        </div>
                        <p className="survey_info">
                          {survey.description}
                          <span href="" className="see-more">...see more</span>
                        </p>
                        <div className="survey_class flex">
                          <div className="dept flex">
                            <img src={dept} alt="" />
                            <h4 className="department">
                              <span className="dept">
                                {survey.user_id
                                  ? survey.user_id.instituition
                                  : "N/A"}
                              </span>
                            </h4>
                          </div>
                          <div className="participants flex">
                            <div>
                              <img src={members} alt="" />
                            </div>
                            <span className="num_participant">
                              {survey.participantCounts?.filled || 0}
                            </span>
                            <p> Participants</p>
                          </div>
                        </div>
                        </div>
                      </div>
                  ))
                ) : (
                  <p className="no_result">Please wait. Survey is loading...</p>
                )
              ) : isLoading ? (
                <div className="loader-container">
                  <div className="loader"></div>
                  <p>Loading your surveys...</p>
                </div>
              ) : mySurveys.length > 0 ? (
                mySurveys.map((survey, index) => (
                  <Link key={survey._id} to={`/expandsurvey/${survey._id}`}>
                    <div
                      className={`survey_post ${
                        index === 0 ? "first_post" : ""
                      }`}
                      key={survey._id}
                    >
                      <div className="post_time flex">
                        <p className="posted">
                          Posted{" "}
                          {formatDistanceToNow(parseISO(survey.createdAt), {
                            addSuffix: true,
                          }) || "N/A"}
                        </p>
                        <div className="status-container flex">
                          <span
                            className={`status-badge ${
                              survey.published ? "published" : "draft"
                            }`}
                          >
                            {survey.published ? "Published" : "Draft"}
                          </span>
                          <p className="duration">
                            Duration: <b>{survey.duration || 0}</b> min
                          </p>
                        </div>
                      </div>
                      <div className="survey_details flex">
                        <h3 className="survey_title">{survey.title}</h3>
                        <h4 className="point">
                          {survey.point_per_user || 0} Pts
                        </h4>
                      </div>
                      <p className="survey_info">
                        {survey.description}
                        <a href="">...see more</a>
                      </p>
                      <div className="survey_class flex">
                        <div className="dept flex">
                          <img src={dept} alt="" />
                          <h4 className="department">
                            Preferred:{" "}
                            <span className="dept">
                              {survey.preferred_participants.join(", ")}
                            </span>
                          </h4>
                        </div>
                        <div className="participants flex">
                          <img src={members} alt="" />
                          <p>
                            <span className="num_participant">
                              {survey.participantCounts?.filled || 0}
                            </span>{" "}
                            Participants
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="no_result">
                  You haven't created any surveys yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
      {redeemModalOpen ? <RedeemModal /> : ""}
      {confirmModalOpen ? <ConfirmDetails /> : ""}
      {reportModalOpen ? <Report /> : ""}
    </>
  );
};

export default Dashboard;
