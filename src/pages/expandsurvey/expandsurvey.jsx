import { Form, Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";
import { validateSurveyAccess } from "../../utils/helpers/surveyChecks";
import { toast } from "react-toastify";

import backaro from "../../assets/img/backaro.svg";
import dept from "../../assets/img/blu-dept.svg";
import partps from "../../assets/img/partps.svg";
import members from "../../assets/img/members.svg";

import "./expandsurvey.css"

const expandsurvey = () => {
  // Move the hook to the component level
  const setSurveyId = useAuthStore((state) => state.setSurveyId);
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((state) => state.authToken);
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnSurvey, setIsOwnSurvey] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  useEffect(() => {
    const fetchSurveyInfo = async () => {
      const API_URl = `${config.API_URL}/surveys/${id}/info`;
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "applictions/json",
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await fetch(API_URl, options);
      const json = await response.json();

      try {
        if (!response.ok)
          throw new Error(json.msg || "Failed to fectch survey details");
        setSurvey(json.survey);
        // Check if the logged-in user is the creator of the survey
        setIsOwnSurvey(json.survey.isCreator === true);

      } catch (error) {
        toast.error(error.msg || "Error fetching survey details")
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveyInfo();
  }, [id, authToken]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const API_URL = `${config.API_URL}/user/profile`;
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      setUserDetails(data.data.user);
    };

    fetchUserDetails();
  }, [authToken]);

  // Show loading state while fetching
  if (loading) {
    return <p className="loading_survey">Loading survey details...</p>;
  }

  // Show error message if survey data is not available
  if (!survey) {
    return <p>Survey not found.</p>;
  }

  const handleActionClick = () => {
    if (!survey.published) {
      // Set the current survey ID in the store before navigating
      setSurveyId(id);
      // Navigate to edit survey
      navigate(`/surveyquestion`, { 
        state: { surveyId: id }
      });
    } else {
      // Pass the survey data to insights page
      navigate(`/insights/${id}`, {
        state: { surveyData: survey }
      });
    }
  };

  const handleEditClick = () => {
    // Set the current survey ID in the store before navigating
    setSurveyId(id);
    // Navigate to edit survey
    navigate(`/surveyquestion`, { 
      state: { surveyId: id }
    });
  };

  const handleInsightsClick = () => {
    // Pass the survey data to insights page
    navigate(`/insights/${id}`, {
      state: { surveyData: survey }
    });
  };

  const handleUnpublishClick = async () => {
    if (!window.confirm("Are you sure you want to unpublish this survey? This will stop accepting new responses.")) {
      return;
    }

    setIsUnpublishing(true);
    try {
      const response = await fetch(`${config.API_URL}/surveys/${id}/unpublish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to unpublish survey");
      }

      // Update the survey state to reflect unpublished status
      setSurvey(prev => ({ ...prev, published: false }));
      toast.success("Survey unpublished successfully!");
    } catch (error) {
      console.error("Error unpublishing survey:", error);
      toast.error(error.message || "Error unpublishing survey");
    } finally {
      setIsUnpublishing(false);
    }
  };

  return (
    <section className="expand">
      <div className="expand_inner wrap">
        <Link to="/dashboard"> <img src={backaro} className="backaro" /></Link>
        <div className="post_time flex">
          <p className="posted">Posted {new Date(survey.createdAt).toLocaleString()}</p>
          <p className="duration">points to earn</p>
        </div>
        <div className="survey_details expand_info flex">
          <h3 className="survey_title expand_title">{survey.title}</h3>
          <h4 className="point">{survey.point_per_user || 0} points</h4>
        </div>
        <div className="description">
          <h4>Description</h4>
          <p>{survey.description}
          </p>
        </div>
        <div className="pre_participants">
          <h4>Preferred participants</h4>
          <ul>
            {survey.preferred_participants}
          </ul>
        </div>
        <div className="activities">
          <h4>Activities on this survey</h4>
          <div className="activity_row center flex">
            <li className="">Total participant required</li>
            <p className="required_no"> <span className="participant_no">{survey.no_of_participants}</span> <span className="exp-mobile">Participants</span> </p>
          </div>
          <div className="activity_row center flex">
            <li className="">Participated</li>
            <p className="required_no"><span className="participant_no">{survey.participantCounts.filled || 0}</span> <span className="exp-mobile">Participated</span> </p>
          </div>
          <div className="activity_row center flex">
            <li className="">No. of participants left</li>
            <p className="required_no"> <span className="participant_no"> {survey.participantCounts.remaining|| 0}</span>{" "}</p>
          </div>
        </div>

        <div className="expand_class flex">
          <div className="dept flex">
            <img src={dept} alt="" />
            <h4 className="department"><span className="dept">{survey.institution || "N/A"}</span></h4>
          </div>
          <div className="participants flex">
            <img src={members} alt="" />
            <p> <span className="num_participant">{survey.participantCounts.filled  || 0}</span> Participants</p>
          </div>
        </div>
        <div className="flex btn_div">
          {isOwnSurvey ? (
            <>
              {survey.published ? (
                <div className="published-buttons-container">
                  <div className="published-buttons flex">
                    <button 
                      className="edit-btn btn"
                      onClick={handleEditClick}
                    >
                      Edit Survey
                    </button>
                    <button 
                      className="insights-btn btn"
                      onClick={handleInsightsClick}
                    >
                      View Insights
                    </button>
                  </div>
                  <button 
                    className="unpublish-btn btn"
                    onClick={handleUnpublishClick}
                    disabled={isUnpublishing}
                  >
                    {isUnpublishing ? "Unpublishing..." : "Unpublish Survey"}
                  </button>
                </div>
              ) : (
                <button 
                  className="start-btn btn"
                  onClick={handleActionClick}
                >
                  Edit Survey
                </button>
              )}
            </>
          ) : (
            <button 
              className="start-btn btn" 
              onClick={async () => {
                try {
                  await validateSurveyAccess(survey, userDetails?.id, userDetails, authToken);
                  navigate(`/answersurvey/${id}`, {
                    state: {
                      title: survey.title,
                      createdAt: survey.createdAt,
                      points: survey.point_per_user,
                    }
                  });
                } catch (error) {
                  toast.error(error.message);
                }
              }}
            >
              Start Survey
            </button>
          )}
        </div>
        

      </div>
    </section>
  )
}
export default expandsurvey;