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
import DashboardMain from "./DashboardMain";
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
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardMissions, setDashboardMissions] = useState([]);

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
    const fetchGamificationData = async () => {
      try {
        const statsRes = await fetch(`${config.API_URL}/gamification/dashboard`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const missionsRes = await fetch(`${config.API_URL}/gamification/missions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setDashboardStats(statsJson.data);
        }
        
        if (missionsRes.ok) {
          const missionsJson = await missionsRes.json();
          // Get only daily missions for the dashboard widget
          const daily = (missionsJson.data || []).filter(m => m.type === 'daily').slice(0, 3);
          setDashboardMissions(daily);
        }
      } catch (err) {
        console.error("Error fetching gamification data:", err);
      }
    };

    if (authToken) {
      fetchGamificationData();
    }
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
      <section className="dashboard px-6">
        <div className="dashboard_inner pt-0">
          <DashboardMain pointBalance={pointBalance} stats={dashboardStats} />
          <div className="dash_head flex mt-8">
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
                      onClick={() =>
                        (window.location = `/expandsurvey/${survey._id}`)
                      }
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
                          <span href="" className="see-more">
                            ...see more
                          </span>
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
                  // <p className="no_result loader">Please wait. Survey is loading...</p>
                  <div className="loader-container">
                  <div className="loader"></div>
                  <p>Loading surveys...</p>
                </div>
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
          
          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
            {/* Daily Missions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-icons text-[#00A5B5] text-sm">track_changes</span> Daily Missions
                </h3>
                <Link to="/rewards" className="text-[#00A5B5] text-xs font-semibold hover:underline flex items-center">
                  View All <span className="material-icons text-[14px]">chevron_right</span>
                </Link>
              </div>
              
              <div className="space-y-4">
                {dashboardMissions.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    <span className="material-icons text-3xl mb-1 opacity-50">track_changes</span>
                    <p className="font-semibold text-sm">No daily missions available.</p>
                    <p className="text-xs mt-1">Check back later!</p>
                  </div>
                ) : (
                  dashboardMissions.map((mission, idx) => {
                    const percent = Math.min(((mission.currentValue || 0) / mission.targetValue) * 100, 100);
                    const isComplete = percent >= 100;
                    return (
                      <div key={mission._id || idx} className={`border ${isComplete ? 'border-green-400 bg-green-50/20' : 'border-gray-200'} rounded-xl p-4 relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold w-1/2 leading-tight">{mission.title}</h4>
                          <span className="bg-blue-50 text-blue-500 font-bold text-xs px-2 py-1 rounded flex items-center gap-1"><span className="material-icons text-[12px]">toll</span> + {mission.pointsReward}</span>
                        </div>
                        <div className={`flex justify-between text-xs ${isComplete ? 'text-green-600' : 'text-gray-500'} font-semibold mb-1 mt-4`}>
                          <span>Progress</span>
                          <span>{mission.currentValue || 0}/{mission.targetValue}</span>
                        </div>
                        <div className={`h-1.5 ${isComplete ? 'bg-green-200' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${isComplete ? 'bg-green-500' : 'bg-[#00A5B5]'} rounded-full`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-min">
               <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Quick Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="border border-[#00A5B5]/20 rounded-xl p-4 bg-blue-50/30">
                   <p className="text-xs sm:text-sm  font-semibold text-[#00A5B5] mb-2 leading-tight w-2/3">Available Surveys</p>
                   <p className="text-2xl lg:text-3xl font-bold text-gray-800">12</p>
                 </div>
                 <div className="border border-green-200 rounded-xl p-4 bg-green-50/30">
                   <p className="text-xs sm:text-sm  font-semibold text-green-600 mb-2 leading-tight w-2/3">Pending Surveys</p>
                   <p className="text-2xl lg:text-3xl font-bold text-gray-800">12</p>
                 </div>
                 <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30">
                   <p className="text-xs sm:text-sm  font-semibold text-blue-600 mb-2 leading-tight w-2/3">Active Surveys</p>
                   <p className="text-2xl lg:text-3xl font-bold text-gray-800">6</p>
                 </div>
                 <div className="border border-gray-200 rounded-xl p-4">
                   <p className="text-xs sm:text-sm  font-semibold text-gray-600 mb-2 leading-tight w-2/3">Completed Surveys</p>
                   <p className="text-2xl lg:text-3xl font-bold text-gray-800">6</p>
                 </div>
               </div>
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
