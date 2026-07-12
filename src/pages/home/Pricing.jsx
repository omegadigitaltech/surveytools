
import check from "../../assets/img/check.svg";
import "./pricing.css"
import { NavLink } from "react-router-dom";


const Pricing = () => {
    return (
        <section className="pricing">
            <div className="pricing-container">
               <div className="price-head" >
                 <h3>PRICING</h3>
                <h2>Find the Perfect Plan To Power Your Surveys</h2>
                <p>Start collecting responses today with our flexible pricing options</p>
               </div>
               
                <div className="bill-period">
                    <button className="active">Monthly</button>
                    <button>Yearly</button>
                </div>
                <div className="price-plans">
    <div className="price-plan first-plan">
        <h3>Basic Plan</h3>
        <p>For undergraduates</p>
        <h4><span className="price-sign">₦25,000</span> starting</h4>
        <div className="price-feature">Features</div>
        <ul>
            <li className="flex price-tick"><img src={check} alt=""/>24 - 72hr data collection</li>
            <li className="flex price-tick"><img src={check} alt=""/>50% data visualization</li>
            <li className="flex price-tick"><img src={check} alt=""/>Exportable data in any format</li>
            <li className="flex price-tick"><img src={check} alt=""/>100% cleaned data</li>
            <li className="flex price-tick"><img src={check} alt=""/>Zero additional data entry costs</li>
        </ul>
        <NavLink to="/signup">
        <button>Get Started</button>
        </NavLink>
    </div>

    <div className="price-plan featured">
        <h3>Premium Plan</h3>
        <p>For undergraduates</p>
        {/* <h4><span className="price-sign">₦</span> contact for pricing</h4> */}
        <div className="price-feature">Features</div>
        <ul>
            <li className="flex price-tick"><img src={check} alt=""/>24 - 72hr data collection</li>
            <li className="flex price-tick"><img src={check} alt=""/>Full data visualization</li>
            <li className="flex price-tick"><img src={check} alt=""/>Full data analysis</li>
            <li className="flex price-tick"><img src={check} alt=""/>Exportable data in any format</li>
            <li className="flex price-tick"><img src={check} alt=""/>100% cleaned data</li>
            <li className="flex price-tick"><img src={check} alt=""/>Zero additional data entry costs</li>
        </ul>
        <NavLink to="/signup">
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
        <a href="">
        <button>Request a Quote</button>
        </a>
    </div>
</div>
            </div>
        </section>
    )
}
export default Pricing;