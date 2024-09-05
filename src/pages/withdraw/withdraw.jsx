import {Link, Form} from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./withdraw.css"


const Withdraw = () => {
    return(
         <section className="withdraw-section">
<div className="wrap">
<div className="withdraw-inner flex ">
    <div className="form-head">
<Link to=""> <img src={backaro} className="withdraw-backaro backaro" /></Link>
</div>
<div className="withdraw-body">
<div className="withdraw-head">
    <h3>Withdrawal</h3>
    <div className="withdraw-head-box">
       <h3>Withdraw To</h3> 
    </div>
    </div>
    <div className="withdraw-container">
        <div className="withdraw-type-head">
            <div className="withdraw-type-btn">
                <button className="bank-acct active-withdraw">
                    Bank Account
                </button>
                <button className="debit-card">
                    Debit Card
                </button>
                </div>
                <p>
                    This survey is a part of a research project to determine the average popukation of students who
                are aware of the occupational therapy profession in OAU, how important.
                          </p> 
                     </div>
                     <div className="withdraw-form-box">
                   <Form className="withdraw-form">
        <fieldset className="withdraw-field">
                    <label className="withdraw-label" htmlFor="card-number">
                       <p>Amount</p> 
                    </label>
                    <input className="withdraw-input" type="number" name="amount" id="amount" />
                </fieldset>
                </Form>      
                     </div>
       
    </div>
</div>
</div>
</div>
        </section>
    )       
    }
export default Withdraw;