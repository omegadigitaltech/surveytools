import { Link, Form } from "react-router-dom";
import backaro from "../../assets/img/backaro.svg";
import "./withdraw.css"
import React, { useState } from 'react';


const Withdraw = () => {
    const [activeButton, setActiveButton] = useState('bank-acct');

    const handleButtonClick = (buttonType) => {
        setActiveButton(buttonType);
    };

    return (
        <section className="withdraw-section">
            <div className="wrap withdraw-wrap">
                <div className="form-head flex">
                    <div>
                        <Link to=""> <img src={backaro} className="withdraw-backaro backaro" /></Link>
                    </div>
                    <h3>Withdrawal</h3>
                </div>
                <div className="withdraw-body">
                    <div className="withdraw-head">
                        <div className="withdraw-head-box">
                            <h3>Withdraw To</h3>
                        </div>
                    </div>
                    <div className="withdraw-container">
                        <div className="withdraw-type-head">
                            <div className="withdraw-type-btn flex">
                                <button className={`bank-acct ${activeButton === 'bank-acct' ? 'active-withdraw' : ''}`}
                                    onClick={() => handleButtonClick('bank-acct')}
                                >
                                    Bank Account
                                </button>
                                <button
                                    className={`debit-card ${activeButton === 'debit-card' ? 'active-withdraw' : ''}`}
                                    onClick={() => handleButtonClick('debit-card')}>
                                    Debit Card
                                </button>
                            </div>
                            <p>
                                This survey is a part of a research project to determine the average population of students who
                                are aware of the occupational therapy profession in OAU, how important.
                            </p>
                        </div>
                        <div className="withdraw-form-box">
                            <Form className="withdraw-form">
                                <fieldset className="withdraw-field">
                                    <label className="withdraw-label" htmlFor="card-number">
                                        <p>Amount</p>
                                    </label>
                                    <input className="amount-input withdraw-input" type="number" name="amount" id="amount" />
                                </fieldset>
                                <fieldset className="withdraw-field">
                                    <label className="withdraw-label" htmlFor="card-number">
                                        <p>Account Number</p>
                                    </label>
                                    <input className="acct-name-input withdraw-input" type="number" name="acct-name" id="acct-name" />
                                </fieldset>
                                <fieldset className={`bankname-field withdraw-field ${activeButton === 'debit-card' ? 'hide-field' : ''}`}>
                                    <label className="withdraw-label" htmlFor="card-number">
                                        <p>Bank Name</p>
                                    </label>
                                    <input className="bank-input withdraw-input" type="text" name="bank-name" id="bank-name" />
                                </fieldset>
                                {/* Toggle show for card select */}
                                <fieldset className={`cardnum-field withdraw-field ${activeButton === 'bank-acct' ? 'hide-field' : ''}`}>
                                    <label className="withdraw-label" htmlFor="card-number">
                                        <p>Card Number</p>
                                    </label>
                                    <input className="card-input withdraw-input" type="number" name="card-num" id="card-num" />
                                </fieldset>

                                <fieldset className="withdraw-field-btn withdraw-field flex">
                                    <input type="submit" value="Preview & Withdraw" class="withdraw-btn" />
                                </fieldset>
                            </Form>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}
export default Withdraw;