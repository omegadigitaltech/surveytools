import { Link, Form } from "react-router-dom";

import backaro from "../../assets/img/backaro.svg";
import master from "../../assets/img/mastercard.svg";
import verve from "../../assets/img/verve.svg";
import visa from "../../assets/img/visa.svg";
import './payment.css'

const Payment = () => {
    return (
        <section className="payment">
            <div className="wrap pay-wrap">
                {/* <div className="payment-inner flex "> */}
                    <div className="pay-head flex">
                        <div>
                        <Link to="/dashboard"> <img src={backaro} className="backaro" /></Link>
                        </div>
                        <div className="payform-h form-h">
                            <h3>Payment Option</h3>
                        </div>
                    </div>
                    <div className="payform-body">
                        <div className="credit-cards flex">
                            <img src={master} alt="" />
                            <img src={visa} alt="" />
                            <img src={verve} alt="" />
                        </div>
                        <div className="paysection">
                            <Form className="pay-form">
                                <div className="payform-field">
                                    <label className="payform-label" htmlFor="card-number">
                                        <p>Card Number</p>
                                    </label>
                                    <input className="payform-input" type="number" name="card-number" id="card-number" />
                                </div>
                                <div className="exp-cvv flex">
                                    <div className="payform-field">
                                        <label className="payform-label" htmlFor="exp-date">
                                            <p>Expiration Date</p>
                                        </label>
                                        <input className="payform-input exp-date" type="date" name="exp-date" id="exp-date" />
                                    </div>
                                    <div className="payform-field">
                                        <label className="payform-label" htmlFor="card-cvv">
                                            <p>CVV</p>
                                        </label>
                                        <input className="payform-input card-cvv" type="number" name="card-cvv" id="card-cvv" />
                                    </div>
                                </div>
                                <div className="submit-box flex">
                                    <input type="submit" value="Continue" class="submit-card btn" />
                                </div>
                            </Form>
                        </div>
                    </div>

                {/* </div> */}
            </div>
        </section>
    )
}
export default Payment;