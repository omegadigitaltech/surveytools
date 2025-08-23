import React from "react"
import "./sharelink.css"
import copy from "../../assets/img/copyicon.svg"
import wa from "../../assets/img/wa.svg"
import x from "../../assets/img/xicon.svg"
import fb from "../../assets/img/fb-color.svg"
import lin from "../../assets/img/in.svg"

const ShareLink = () => {
    return(
            <div className="logout-box">
                <div className="share-box flex">
                <h2 className="share-title">Share out your link</h2>
                <div class="share-link flex">
                    <span className="gen-link">https//surveyprotoolsform124356890ml</span>
                    <img src={copy} alt="" />
                </div>
                <h2 className="share-title">OR</h2>
                <p>Share via;</p>
                <div className="share-icons flex">
                <img src={wa} alt="" />
                <img src={x} alt="" />
                <img src={fb} alt="" />
                <img src={lin} className="link-in" alt="" />
                </div>

                </div>
            </div>
        
    )
}
export default ShareLink;