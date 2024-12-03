import search from "../../assets/img/search.svg";
import sort from "../../assets/img/sort.svg";
import dept from "../../assets/img/dept.svg";
import members from "../../assets/img/members.svg";
import "./dashboard.css"
import view from "../../assets/img/eye.svg"
import nextaro from "../../assets/img/nextaro.svg"

import { Form, Link } from "react-router-dom";
import config from "../../config/config";
import useAuthStore from "../../components/store/useAuthStore";

const dashboard = () => {

  return (
    <section className="dashboard">
      <div className="dashboard_inner wrap">

      <div class="points-board">
            <div class="points-head flex">
              <div class="points-label flex">
                Points Balance:
                <img src={view}  alt="View Points" />
              </div>
            <div class="transactions-history">
              <Link href="">Transactions History <img src={nextaro} alt="" /> </Link>
            </div>
            </div>
            <div>
              <div class="points-value">0.00</div>
            </div>
          </div>

        <div className="dash_head flex">
          <Form className="classForm">
            <div className="search desktop flex">
              <button className="flex" type={"submit"}>
                <img src={search} />
              </button>
              <input type="text" placeholder="Search for surveys" onChange={(e) => setSearchKey(e.target.value)} />
            </div>
          </Form>
          <div className="dashboard_sort flex">
            <h4>Sort by</h4> <img src={sort} alt="" />
          </div>
        </div>
        <div className="dashboard_surveys">
          <div className="survey_head flex">
            <h3 className="active_head">Available Surveys</h3>
            <h3>My Surveys</h3>
          </div>
          <div className="survey_posts">
            {/* REmove onclick it's check to next page purpose */}
            <div className="survey_post first_post">
              <div className="post_time flex">
                <p className="posted">Posted 2hr ago</p>
                <p className="duration">Duration: <b>20</b> min</p>
              </div>
              <div className="survey_details flex">
                <h3 className="survey_title">Diet and Excercise survey</h3>
                <h4 className="point">20Pts</h4>
              </div>
              <p className="survey_info">
                This survey is part of a research that seeks how student sees the environment around and the response
                to it, how to get to relate with Natureand feel their environment. <a href="">...see more</a>
              </p>
              <div className="survey_class flex">
                <div className="dept flex">
                  <img src={dept} alt="" />
                  <h4 className="department">Dept. of <span className="dept">Foreign Languages</span></h4>
                </div>
                <div className="participants flex">
                  <img src={members} alt="" />
                  <p> <span className="num_participant">20</span> Participants</p>
                </div>
              </div>
            </div>
            <div className="survey_post">
              <div className="post_time flex">
                <p className="posted">Posted 2hr ago</p>
                <p className="duration">Duration: <b>20</b> min</p>
              </div>
              <div className="survey_details flex">
                <h3 className="survey_title">Transport Management</h3>
                <h4 className="point">20Pts</h4>
              </div>
              <p className="survey_info">
                This survey is part of a research that seeks how student sees the environment around and the response
                to it, how to get to relate with Natureand feel their environment. <a href="">...see more</a>
              </p>
              <div className="survey_class flex">
                <div className="dept flex">
                  <img src={dept} alt="" />
                  <h4 className="department">Dept. of <span className="dept">Physics</span></h4>
                </div>
                <div className="participants flex">
                  <img src={members} alt="" />
                  <p><span className="num_participant">10</span> Participants</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}

export default dashboard;
