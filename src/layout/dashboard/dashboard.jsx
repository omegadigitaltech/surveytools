import { Outlet } from "react-router-dom";
import DashNavbar from "./DashNavbar";
import CompactFooter from "../../components/footer/CompactFooter";
import MobileNavBar from "../../components/navbar/MobileNavBar";

const DashboardLayout = () => {
  return (
    <>
      <MobileNavBar />
      <div className="dashboard-layout flex">
        <DashNavbar />
        <main className="main-content flex-1 self-stretch flex flex-col min-w-0 md:ml-[230px] pt-10 md:pt-0">
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
          <CompactFooter />
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
