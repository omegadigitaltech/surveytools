import { Outlet } from "react-router-dom";
import DashNavbar from "./DashNavbar";
import Footer from "../../components/footer/footer";
import MobileNavBar from "../../components/navbar/MobileNavBar";
import useDashboardStore from "../../store/useDashboardStore";

const DashboardLayout = () => {
  const { spinOpen, setSpinOpen } = useDashboardStore();

  const handleSpinResult = (result) => {
    // TODO: send result to backend to credit points / apply multiplier
    console.log("Spin result:", result);
  };

  return (
    <>
      <MobileNavBar />
      <div className="dashboard-layout flex">
        <DashNavbar />
        <main className="main-content flex-1 md:ml-[230px] pt-10 md:pt-0">
          <Outlet />
        </main>
      </div>
      <Footer />

      {spinOpen && (
        <DailyWheelSpin
          spinsPerDay={1}
          onClose={() => setSpinOpen(false)}
          onResult={handleSpinResult}
        />
      )}
    </>
  );
};

export default DashboardLayout;
