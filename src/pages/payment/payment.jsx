import {Link, Form} from "react-router-dom";

import backaro from "../../assets/img/backaro.svg";
import './payment.css'

const Payment = () => {
    return(
<section className="payment">
<div className=" wrap">
<div className="form-head flex">
<Link to="/surveyform"> <img src={backaro} className="backaro" /></Link>
<div className="form-h">
    <h3>Payment Option</h3>
    </div>
</div>
</div>
</section>
    )
}
export default Payment;