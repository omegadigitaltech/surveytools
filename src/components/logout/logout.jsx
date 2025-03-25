import React from "react"
import "./logout.css"
import useAuthStore from "../../store/useAuthStore"

const Logout = () => {
    const { hideLogoutConfirmation, logout } = useAuthStore();
    const handleConfirm = () => {
        logout();
        hideLogoutConfirmation();
    };

    return (
        <section className="logout-box flex">
            <div className="logout flex">
                <p>Do you really want to logout??</p>
                <div className="btn-options flex">
                    <button className="out-yes" onClick={handleConfirm}>Yes</button>
                    <button className="out-no" onClick={hideLogoutConfirmation}>No</button>

                </div>
            </div>
        </section>
    )
}
export default Logout;