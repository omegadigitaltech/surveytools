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

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            {/* <Route index element={"Home"} /> */}
            <Route element={<Auth />}>
                <Route index element={<SignIn />} />
                <Route path="signup" element={<SignUp />} />
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