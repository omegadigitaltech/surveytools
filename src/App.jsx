import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route
} from "react-router-dom";

import Home from "./layout/home/home";
import Auth from "./layout/auth/auth";
import SignIn from "./pages/signin/signin";
import SignUp from "./pages/signup/signup";
import Verify from "./pages/verify/verify";

import signInAction from "./pages/signin/action";
import signUpAction from "./pages/signup/action";


const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route element={<Home />}>
                <Route path="" element={""}></Route>
            </Route>
            <Route element={<Auth />}>
                <Route path="signin" element={<SignIn />} action={signInAction} />
                <Route path="signup" element={<SignUp />} action={signUpAction} />
                <Route path="verify" element={<Verify />} />
            </Route>
        </Route>
    )
)

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App;