import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
    return ( 
        <header className="header">
            <div className="header-wrap wrap">
                <Link className="" to="">
                    Logo
                </Link>
               <div className="">
                    <ul className="header-list">
                        <li className="header__item">
                            <Link to="">
                                
                            </Link>
                        </li>
                        <li className="header__item">
                            <Link to="">

                            </Link>
                        </li>
                        <li className="header__item">
                            <Link to="">

                            </Link>
                        </li>
                        <li className="header__item">
                            <Link to="">

                            </Link>
                        </li>
                        <li className="header__item">
                            <Link to="">

                            </Link>
                        </li>
                        <li className="header__item">
                            <Link to="">

                            </Link>
                        </li>
                    </ul>
                    
               </div>
               
            </div>
        </header>
    )
}

export default Navbar;