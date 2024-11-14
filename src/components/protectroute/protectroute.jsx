import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../components/store/useAuthStore";

const ProtectRoute = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/signin" />;
    }
    return <Outlet />;
};

export default ProtectRoute;
