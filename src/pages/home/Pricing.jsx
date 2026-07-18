import { useState } from "react";
import check from "../../assets/img/check.svg";
import "./pricing.css"
import { NavLink } from "react-router-dom";


const Pricing = () => {
    const [billing, setBilling] = useState("monthly");

    const basicPrice = billing === "yearly" ? 25000 * 12 : 25000;

    return (
        <section className="pricing">
            <div className="pricing-container">
               <div className="price-head" >
                 <h3>PRICING</h3>
                <h2>Find the Perfect Plan To Power Your Surveys</h2>
                <p>Start collecting responses today with our flexible pricing options</p>
               </div>
               
                <div className="bill-period">
                    <button
                        className={billing === "monthly" ? "active" : ""}
                        onClick={() => setBilling("monthly")}
                    >Monthly</button>
                    <button
                        className={billing === "yearly" ? "active" : ""}
                        onClick={() => setBilling("yearly")}
                    >Yearly</button>
                </div>
                <div className="price-plans">
    <div className="price-plan first-plan">
        <h3>Basic Plan</h3>
        <p>For undergraduates</p>
        <h4><span className="price-sign">₦{basicPrice.toLocaleString()}</span> starting</h4>
        <div className="price-feature">Features</div>
        <ul>
            <li className="flex price-tick"><img src={check} alt=""/>24 - 72hr data collection</li>
            <li className="flex price-tick"><img src={check} alt=""/>50% data visualization</li>
            <li className="flex price-tick"><img src={check} alt=""/>Exportable data in any format</li>
            <li className="flex price-tick"><img src={check} alt=""/>100% cleaned data</li>
            <li className="flex price-tick"><img src={check} alt=""/>Zero additional data entry costs</li>
        </ul>
        <NavLink to="/signup-type">
        <button>Get Started</button>
        </NavLink>
    </div>

    <div className="price-plan featured">
        <h3>Premium Plan</h3>
        <p>For undergraduates</p>
        {/* <h4><span className="price-sign">₦</span> contact for pricing</h4> */}
        <div className="price-feature">Features</div>
        <ul>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>24 - 72hr data collection</li>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>Full data visualization</li>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>Full data analysis</li>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>Exportable data in any format</li>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>100% cleaned data</li>
            <li className="flex price-tick"><img src="./wht-tick.svg" alt=""/>Zero additional data entry costs</li>
        </ul>
        <NavLink to="/signup-type">
        <button>Get Started</button>
        </NavLink>
    </div>

    <div className="price-plan">
        <h3>Custom Plan</h3>
        <p>For postgraduates, professionals and corporate organizations</p>
        <h4>Get a quote</h4>
        <div className="price-feature">Features</div>
        <ul>
            <li className="flex price-tick"><img src={check} alt=""/>Tailored to your unique research needs</li>
            <li className="flex price-tick"><img src={check} alt=""/>Flexible scope and turnaround</li>
            <li className="flex price-tick"><img src={check} alt=""/>Dedicated support</li>
        </ul>
        <a href="mailto:help.surveytools@gmail.com">
        <button>Request a Quote</button>
        </a>
    </div>
</div>
            </div>
        </section>
    )
}
export default Pricing;