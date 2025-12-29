import { Outlet } from "react-router-dom";
import DashNavbar from "./dashNavbar";
import Footer from "../../components/footer/footer";

const DashboardLayout = () => {
  return (
    <>
      <div className="dashboard-layout flex ">
        <DashNavbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
