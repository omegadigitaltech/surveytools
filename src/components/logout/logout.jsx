import React from "react"
import "./logout.css"
import useAuthStore from "../../store/useAuthStore"
import { logoutSession } from "../../utils/kycApi"

const Logout = () => {
    const { hideLogoutConfirmation, logout, authToken } = useAuthStore();
    const handleConfirm = () => {
        // Clear local state first so a 401 from an already-expired token
        // doesn't trigger the "session expired" redirect
        logout();
        logoutSession(authToken);
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