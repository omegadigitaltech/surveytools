import { Outlet } from "react-router-dom";
import "./home.css"
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";

const Home = () => {
    return (
        <div className="home-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default Home;