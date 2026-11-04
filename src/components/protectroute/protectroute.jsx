import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

// requirePhone: block the route until the phone OTP is verified. Only the
// phone verification page itself opts out.
const ProtectRoute = ({ requirePhone = true }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const requiresPhoneVerification = useAuthStore(
        (state) => state.requiresPhoneVerification
    );
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
    }
    if (requirePhone && requiresPhoneVerification) {
        return <Navigate to="/verify" replace />;
    }
    return <Outlet />;
};

export default ProtectRoute;
