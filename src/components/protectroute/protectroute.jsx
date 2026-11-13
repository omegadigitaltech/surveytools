import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

// requireVerification: block the route until the email OTP is verified. Only the
// verification page itself opts out.
const ProtectRoute = ({ requireVerification = true }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const requiresEmailVerification = useAuthStore(
        (state) => state.requiresEmailVerification
    );
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
    }
    if (requireVerification && requiresEmailVerification) {
        return <Navigate to="/verify" replace />;
    }
    return <Outlet />;
};

export default ProtectRoute;
