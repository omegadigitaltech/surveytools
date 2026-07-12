import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDistanceToNow, parseISO } from "date-fns";

import config from "../../config/config";
import useAuthStore from "../../store/useAuthStore";

import Loader from "../../components/loader/loader";

import dept from "../../assets/img/dept.svg";
import members from "../../assets/img/members.svg";

import "../dashboard/dashboard.css"; // reuse existing styles
import "./myforms.css"

const MyForms = () => {
  const authToken = useAuthStore((state) => state.authToken);
  const userId = useAuthStore((state) => state.userId);

  const [myForms, setMyForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Forms
  const fetchMyForms = async () => {
    setLoading(true);

    try {
      const API_URL = `${config.API_URL}/my-forms`;

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const json = await response.json();

      if (response.ok) {
        setMyForms(json.myForms || json.forms || []);
      } else {
        // fallback logic (same as dashboard)
        console.warn("my-forms endpoint not available, trying alternative");

        const allFormsResponse = await fetch(
          `${config.API_URL}/forms`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const allFormsJson = await allFormsResponse.json();

        if (allFormsResponse.ok) {
          const userForms = Array.isArray(allFormsJson)
            ? allFormsJson.filter(
                (form) =>
                  form.createdBy === userId ||
                  form.userId === userId
              )
            : (allFormsJson.forms || []).filter(
                (form) =>
                  form.createdBy === userId ||
                  form.userId === userId
              );

          setMyForms(userForms);
        } else {
          throw new Error("Failed to fetch forms");
        }
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Failed to load forms");
      setMyForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyForms();
  }, [authToken]);

  // Loader
  if (loading) {
    return <Loader text="Loading forms..." />;
  }

  return (
    <section className="dashboard">
      <div className="dashboard_inner wrap">

        <div className="survey_posts">

          {myForms.length > 0 ? (
            myForms.map((form, index) => (
              <Link
                key={form._id}
                to={`/forminsights/${form._id}`}
              >
                <div
                  className={`survey_post ${
                    index === 0 ? "first_post" : ""
                  }`}
                >
                  <div className="post_time flex">
                    <p className="posted">
                      Posted{" "}
                      {formatDistanceToNow(
                        parseISO(form.createdAt),
                        { addSuffix: true }
                      ) || "N/A"}
                    </p>

                    <div className="status-container flex">
                      <span className="status-badge published">
                        Form
                      </span>
                    </div>
                  </div>

                  <div className="survey_details flex">
                    <h3 className="survey_title">
                      {form.title}
                    </h3>
                  </div>

                  <p className="survey_info">
                    {form.description ||
                      "No description"}
                    <span className="see-more">
                      ...see more
                    </span>
                  </p>

                  <div className="survey_class flex">

                    <div className="dept flex">
                      <img src={dept} alt="" />
                      <h4 className="department">
                        <span className="dept">
                          {form.fields?.length || 0} Fields
                        </span>
                      </h4>
                    </div>

                    <div className="participants flex">
                      <img src={members} alt="" />
                      <p>
                        <span className="num_participant">
                          View Insights
                        </span>
                      </p>
                    </div>

                  </div>

                </div>
              </Link>
            ))
          ) : (
            <div className="no_result form-no-result flex">
              <div className="no-result-inner flexx">
              <h3>No forms yet</h3>

              <p>
                Start by creating your first form....
              </p>

              <Link
                to="/create-form"
                className="button-main"
                style={{ marginTop: "4rem" }}
              >
                Create Form
              </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default MyForms;