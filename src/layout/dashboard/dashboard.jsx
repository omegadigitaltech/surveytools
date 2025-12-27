import { Outlet } from "react-router-dom";
import DashNavbar from "./dashNavbar";
import Footer from "../../components/footer/footer";

const DashboardLayout = () => {
    return (
        <div className="home-layout">
            <DashNavbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default DashboardLayout;