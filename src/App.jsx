import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Preloader from "./components/Preloader/Preloader.jsx";
import HomeLayout from "./layout/home/home";
import AuthLayout from "./layout/auth/auth";
import DashboardLayout from "./layout/dashboard/dashboard";
import StoreProvider from "./store/StoreProvider";
import ProtectRoute from "./components/protectroute/protectroute";
import RoleRoute from "./components/protectroute/RoleRoute";
import useAuthStore from "./store/useAuthStore.js";
import Logout from "./components/logout/logout";
import setupAuthInterceptor from "./utils/setupAuthInterceptor";

import Home from "./pages/home/home";
import SignIn from "./pages/signin/signin";
import SignUp from "./pages/signup/signup";
import ResetPw from "./pages/resetpassword/resetpw.jsx";
import ForgotPw from "./pages/forgotpassword/forgot.jsx";
import Verify from "./pages/verify/verify";
import Dashboard from "./pages/dashboard/dashboard";
import ResearcherDashboard from "./pages/ResearcherDashboard/ResearcherDashboard.jsx"
import signInAction from "./pages/signin/action";
import signUpAction from "./pages/signup/action";
import postAction from "./pages/surveyquestion/action";
import surveyAction from "./pages/postsurvey/action";
import ExpandSurvey from "./pages/expandsurvey/expandsurvey";
import StartSurvey from "./pages/postsurvey/startsurvey.jsx";
import PostSurvey from "./pages/postsurvey/postsurvey";
import SurveyQuestion from "./pages/surveyquestion/surveyquestion";
import Publish from "./pages/publish/publish";
import Payment from "./components/payment/payment";
// import CreateForm from "./pages/createform/createform.jsx";
import FormQuestions from "./pages/formquestions/formquestion.jsx";
// import Payment from "./pages/payment/payment";
import Notifications from "./pages/notifications/notifications";
import Withdraw from "./pages/withdraw/withdraw";
import Profile from "./pages/profile/profile";
import AnswerSurvey from "./pages/answersurvey/answersurvey";
import AnswerForm from "./pages/answerform/answerform";
import MyForms from "./pages/myforms/MyForm.jsx";
import Settings from "./pages/settings/settings";
import Insights from "./pages/insights/insights";
import FormInsights from "./pages/forminsights/forminsights";
// import Analytics from "./pages/analytics/Analytics.jsx";
import GraphAnalyticsDashboard from "./pages/graph-analytics/GraphAnalyticsDashboard.jsx";
import VerifyPayment from "./pages/verify-payment/verify-payment";
import Rewards from "./pages/rewards/rewards";
// import MissionsPage from "./pages/missions/missions";
import Help from "./pages/help/help";
import Admin from "./pages/admin/Admin";
import PersonalInformation from "./pages/register/PersonalInfo.jsx";
import AcaAndProf from "./pages/register/AcaAndProf.jsx";
import HealthLifestyle from "./pages/register/HealthLifestyle.jsx";
import SocioEconomic from "./pages/register/SocioEconomic.jsx";
import Beliefs from "./pages/register/Beliefs.jsx";
import ReviewSubmit from "./pages/register/Review.jsx";
import EducationEmployment from "./pages/register/EducationEmployment.jsx";
import ResearcherProfile from "./pages/register/ResearcherProfile.jsx";
import KycGate from "./pages/register/components/KycGate.jsx";

const RootLayout = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return <Outlet />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<HomeLayout />}>
        <Route index element={<Home />} />
      </Route>

      <Route path="answerform/:id" element={<AnswerForm />} />
      <Route path="admin" element={<Admin />} />

      <Route element={<ProtectRoute />}>
      {/* NO DASHBOARD LAYOUT FOR THEM */}
        <Route element={<RoleRoute allow="respondent" />}>
          <Route path="answersurvey/:id" element={<AnswerSurvey />} />
        </Route>
        <Route element={<HomeLayout />}>
          <Route element={<RoleRoute allow="researcher" allowSurveyOwners />}>
            <Route path="surveyquestion" element={<SurveyQuestion />} action={postAction} />
          </Route>
          {/* Forms are switched off for now */}
          <Route element={<RoleRoute allow="none" />}>
            <Route path="create-form" element={<FormQuestions />} />
          </Route>
        </Route>
       {/*--- */}

        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allow="respondent" />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="rewards" element={<Rewards />} />
            {/* <Route path="missions" element={<MissionsPage />} /> */}
          </Route>

          <Route element={<RoleRoute allow="researcher" />}>
            <Route path="researcher-dashboard" element={<ResearcherDashboard />} />
            <Route path="start-survey" element={<StartSurvey />} />
            <Route path="postsurvey" element={<PostSurvey />}  action={surveyAction} />
            <Route path="analytics" element={<GraphAnalyticsDashboard />} />
            <Route path="analytics/:surveyId" element={<GraphAnalyticsDashboard />} />
          </Route>

          {/* Managing a survey that already exists */}
          <Route element={<RoleRoute allow="researcher" allowSurveyOwners />}>
            <Route path="publish" element={<Publish />} />
            <Route path="insights/:id" element={<Insights />} />
            <Route path="payment" element={<Payment />} />
            <Route path="verify-payment" element={<VerifyPayment />} />
          </Route>

          {/* Forms are switched off for now */}
          <Route element={<RoleRoute allow="none" />}>
            <Route path="/my-forms" element={<MyForms />} />
            <Route path="formquestion/:id" element={<FormQuestions />} />
            <Route path="forminsights/:id" element={<FormInsights />} />
          </Route>

          <Route path="expandsurvey/:id" element={<ExpandSurvey />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />

        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        {/* Signed in, phone not yet verified */}
        <Route element={<ProtectRoute requirePhone={false} />}>
          <Route path="verify" element={<Verify />} />
        </Route>

        {/* KYC: each gate checks layer-status and redirects to the right step */}
        <Route element={<ProtectRoute />}>
          <Route element={<KycGate stage="layer1" />}>
            <Route path="register/personalinfo" element={<PersonalInformation />} />
            <Route path="register/academicprofile" element={<AcaAndProf />} />
            <Route path="register/review" element={<ReviewSubmit />} />
          </Route>
          <Route element={<KycGate stage="layer2" />}>
            <Route path="register/education" element={<EducationEmployment />} />
          </Route>
          <Route element={<KycGate stage="enrichment" />}>
            <Route path="register/healthlifestyle" element={<HealthLifestyle />} />
            <Route path="register/socioeconomic" element={<SocioEconomic />} />
            <Route path="register/beliefs" element={<Beliefs />} />
          </Route>
          <Route element={<KycGate stage="researcher" />}>
            <Route path="register/researcher" element={<ResearcherProfile />} />
          </Route>
        </Route>

        <Route path="signin" element={<SignIn />} action={signInAction} />
        <Route path="signup" element={<SignUp />} action={signUpAction} />
        <Route path="forgotpassword" element={<ForgotPw />} />
        <Route path="reset-password" element={<ResetPw />} />
      </Route>
    </Route>
  )
);

const App = () => {
  const { isLogoutVisible } = useAuthStore();
  useEffect(() => {
    if (!localStorage.getItem("visited")) {
      document.body.classList.add("preload-active");
    } else {
      document.body.classList.remove("preload-active");
    }

    const cleanupInterceptor = setupAuthInterceptor(router);
    return cleanupInterceptor;
  }, []);
  return (
    <>
      <Preloader />
      <StoreProvider>
        <RouterProvider router={router} />{" "}
        <ToastContainer position="top-right" />
        {isLogoutVisible && <Logout />}
      </StoreProvider>
    </>
  );
};

export default App;
