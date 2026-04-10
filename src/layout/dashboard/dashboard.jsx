import { Outlet } from "react-router-dom";
import DashNavbar from "./DashNavbar";
import Footer from "../../components/footer/footer";
import MobileNavBar from "../../components/navbar/MobileNavBar"

const DashboardLayout = () => {
  return (
    <>
    <MobileNavBar/>
      <div className="dashboard-layout flex ">
        <DashNavbar />
        {/* <main className="main-content flex-1 md:ml-64"> */}
        <main className="main-content flex-1 md:ml-[230px] pt-10 md:pt-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
