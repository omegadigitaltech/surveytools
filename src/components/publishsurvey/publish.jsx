import "./publish.css"
import action from "./action"
const Publish = () =>{
    return(
        <section className="publish flex">
            <div className="publish-box flex">
                <p className="publish-msg">Now proceed to publish this survey.</p>
                <Form method="post" action="/publish">
          {/* Include surveyId in form data */}
          <input type="hidden" name="surveyId" value="12345" /> {/* Replace with actual ID */}
       
                <button type="button" className="post-btn">
                        Publish
                    </button>
                    </Form>
            </div>
        </section>
    )
}
export default Publish;