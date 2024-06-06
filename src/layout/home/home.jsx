import { Outlet } from "react-router-dom";

import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";

const Home = () => {
    return (
        <div className="">
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Home;