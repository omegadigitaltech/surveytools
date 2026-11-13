import { Outlet } from "react-router-dom";
import "./home.css"
import Navbar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import CompactFooter from "../../components/footer/CompactFooter";

// Full footer on the landing page; app pages using this shell pass `compactFooter`
const Home = ({ compactFooter = false }) => {
    return (
        <div className="home-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
            {compactFooter ? <CompactFooter /> : <Footer />}
        </div>
    )
}

export default Home;
