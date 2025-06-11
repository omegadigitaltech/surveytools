import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const AdminProtectRoute = () => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/signin" />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    return <Outlet />;
};

export default AdminProtectRoute; 