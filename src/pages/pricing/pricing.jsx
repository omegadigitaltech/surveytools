
import check from "../../assets/img/check.svg";
import "./pricing.css"

const Pricing = () => {
    return (
        <section className="pricing">
            <div className="pricing-container">
                <h2>Find the Perfect Plan To Power Your Surveys</h2>
                <p>Start collecting responses today with our flexible pricing options</p>

                <div className="bill-period">
                    <button className="active">Monthly</button>
                    <button>Yearly</button>
                </div>

                <div className="price-plans">
                    <div className="price-plan">
                        <h3>Free Plan</h3>
                        <p>Individuals and small teams starting out</p>
                        <h4> <span className="price-sign">0$/</span> mth for all survey</h4>
                       <div className="price-feature">Features</div>
                        <ul>
                            <li className="flex price-tick"> <img src={check} alt=""/>10 surveys per month</li>
                            <li className="flex price-tick"><img src={check} alt=""/>50 responses per month</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic question types</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic analytics</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Limited reporting</li>
                        </ul>
                        <button>Get Started</button>
                    </div>

                    <div className="price-plan">
                        <h3>Pay-Per-Response</h3>
                        <p>Individuals and groups</p>
                        <h4><span className="price-sign">10$/</span> per response</h4>
                        <div className="price-feature">Features</div>
                        <ul>
                            <li className="flex price-tick"><img src={check} alt=""/>Unlimited surveys</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Unlimited responses</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic question types</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic survey templates</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Limited reporting</li>
                        </ul>
                        <button>Get Started</button>
                    </div>

                    <div className="price-plan featured">
                        <h3>Basic Plan</h3>
                        <p>Individuals and large-scale projects</p>
                        <h4> <span className="price-sign">19$/</span> mth for all survey</h4>
                        <div className="price-feature">Features</div>
                        <ul>
                            <li className="flex price-tick"><img src={check} alt=""/>100 responses per month</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic question types</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic survey templates</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Limited reporting</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Advanced analytics</li>
                        </ul>
                        <button>Get Started</button>
                    </div>

                    <div className="price-plan">
                        <h3>Premium Plan</h3>
                        <p>Individuals and large organizations with complex needs</p>
                        <h4> <span className="price-sign">0$/</span> mth for all survey</h4>
                        <div className="price-feature">Features</div>
                        <ul>
                            <li className="flex price-tick"><img src={check} alt=""/>10 surveys per month</li>
                            <li className="flex price-tick"><img src={check} alt=""/>100 responses per month</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic question types</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Basic survey templates</li>
                            <li className="flex price-tick"><img src={check} alt=""/>Limited reporting</li>
                        </ul>
                        <button>Get Started</button>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default Pricing;