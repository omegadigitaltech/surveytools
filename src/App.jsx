import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import HomeLayout from "./layout/home/home";
import AuthLayout from "./layout/auth/auth";
import StoreProvider from "./components/store/StoreProvider";
import ProtectRoute from "./components/protectroute/protectroute"
import useAuthStore from "./components/store/useAuthStore";
import Logout from "./components/logout/logout";

import Home from "./pages/home/home";
import SignIn from "./pages/signin/signin";
import SignUp from "./pages/signup/signup";
import Verify from "./pages/verify/verify";
import verifyAction from "./pages/verify/action"
import Dashboard from "./pages/dashboard/dashboard";
import signInAction from "./pages/signin/action";
import signUpAction from "./pages/signup/action";
import postAction from "./pages/surveyform/action";
import surveyAction from "./pages/postsurvey/action"
import ExpandSurvey from "./pages/expandsurvey/expandsurvey";
import PostSurvey from "./pages/postsurvey/postsurvey";
import SurveyForm from "./pages/surveyform/surveyform";
import Payment from "./pages/payment/payment";
import Notifications from "./pages/notifications/notifications";
import Withdraw from "./pages/withdraw/withdraw";
import Profile from "./pages/profile/profile";
import AnswerSurvey from "./pages/answersurvey/answersurvey"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<HomeLayout />}>
        <Route index element={<Home />} />

        <Route element={<ProtectRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expandsurvey/:id" element={<ExpandSurvey />} />
        <Route path="postsurvey" element={<PostSurvey />} action={surveyAction}/>
        <Route path="surveyform" element={<SurveyForm />} action={postAction}/>
        <Route path="payment" element={<Payment />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="profile" element={<Profile />} />
        <Route path="answersurvey" element={<AnswerSurvey/>} />

        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="signin" element={<SignIn />} action={signInAction} />
        <Route path="signup" element={<SignUp />} action={signUpAction} />
        <Route path="verify" element={<Verify />} action={verifyAction}/>
      </Route>
    </Route>
  )
);

const App = () => {
  const { isLogoutVisible } = useAuthStore();
  return (
    <>
      <StoreProvider>
        <RouterProvider router={router} />{" "}
        <ToastContainer position="top-right" />
        {isLogoutVisible && <Logout />}
      </StoreProvider>
    </>
  );
};

export default App;
