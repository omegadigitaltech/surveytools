
import "./logout.css"

const Logout = () => {
    return(
        <section className="logout-box flex">
<div className="logout flex">
<p>Do you really want to logout??</p>
<div className="btn-options flex">
    <button className="out-yes">Yes</button>
    <button className="out-no">No</button>

</div>
</div>
        </section>
    )
}
export default Logout;