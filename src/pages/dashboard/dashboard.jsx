import search from "../../assets/img/search.svg";
import sort from "../../assets/img/sort.svg";
import dept from "../../assets/img/dept.svg";
import members from "../../assets/img/members.svg";
import "./dashboard.css"



const dashboard = () => {
    return (
        <section className="dashboard">
            <div className="dashboard_inner">
           <div className="dash_head flex">
             <form>
            <div className="search desktop flex">
              <button className="flex" type={"submit"}>
                <img src={search} />
              </button>
              <input type="text" placeholder="Search for surveys" onChange={(e) => setSearchKey(e.target.value)} />
            </div>
          </form>
          <div className="dashboard_sort flex">
<h3>Sort by</h3> <img src={sort} alt="" />
          </div>
            </div>
           <div className="dashboard_surveys">
            <div className="survey_head flex">
              <h3 className="active_head">Available Surveys</h3>
              <h3>My Surveys</h3>
            </div>
            <div className="survey_posts">
<div className="survey_post">
  <div className="post_time flex">
    <p className="posted">posted 2hr ago</p>
    <p className="duration">Duration: <b>20</b> min</p>
  </div>
  <div className="survey_info flex">
    <h3 className="survey_title">Diet and Excercise survey</h3>
    <h4 className="point">20pts</h4>
  </div>
  <p className="survey_details">
    This survey is part of a research that seeks how student sees the environment around and the response
    to it, how to get to relate with Natureand feel their environment.
  </p>
<div className="survey_details flex">
  <div className="dept flex">
    <img src={dept} alt="" />
    <h4 className="department">Dept. of Foreign Languages</h4>
  </div>
  <div className="participants flex">
<img src={members} alt="" />
<p>20 Participants</p>
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
