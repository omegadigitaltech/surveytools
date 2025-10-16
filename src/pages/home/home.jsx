import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import "./home.css";
// import ContestModal from "../../components/ContestModal";

const Home = () => {
  return (
    <section className="home flex flex-col md:flex-row overflow-hidden">
      <div className="content flex flex-col items-center max-w-[40% p-[5%] md:p-[2%] lg:p-auto md:ml-[2%] lg:ml-[8%] md:mt-[8%]">
        <div>
          <h1 className="text-3xl/10 md:text-4xl/10 lg:text-5xl/14 font-[500] ">
            Create Smart Surveys <br /> Simply for Everyone
          </h1>
          <p className="md:max-w-[90%] my-4">
            Whether you’re a student, a busy professional, or a corporation, our
            platform makes it simple to design surveys, reach the right
            audience, and collect results you can trust
          </p>
          <div>
            <div className="flex gap-2">
              <img src="/users-avatars.png" alt="" className="" />
              <div className="">1k+ satisfied users</div>
            </div>
          </div>
          <div className="flex gap-4 lg:gap-8 mt-4">
            <Link className="button-filled px-5 py-3 lg:px-10 lg:py-4 rounded-md">Get Started</Link>
            <Link className="px-5 py-3 lg:px-10 lg:py-4 rounded-md border-[1px]">How it Works</Link>
          </div>
        </div>
      </div>
      <div className="illustration relative mr-[8%]">
        <div className="mt-[-10%]">
          <img src="/handsome-man.png" alt="handsome-man" className="" />
          <img
            src="/blue-text-box.svg"
            className="absolute top-[15%] right-[-10%]"
            alt="blue-text-box"
          />
          <img
            src="/green-text-box.svg"
            className="absolute top-[40%] md:top-[40%] lg:top-[50%] left-0 md:-left-[5%]"
            alt="green-text-box"
          />
          <img
            src="/red-text-box.svg"
            className="absolute bottom-[15%] right-[-10%]"
            alt="red-text-box"
          />
        </div>
      </div>
    </section>
    // <section className="home">
    //   {/* <ContestModal /> */}
    //   <div className="home-inner wrap">
    //     <h1 className="home-title">
    //       <TypeAnimation
    //         sequence={[
    //           "Paid Surveys: Earn Money Online, Work From Home.",
    //           2000,
    //           "Earn Rewards, completing academic research questionnaires.",
    //           2000,
    //           "Fill questionnaires anonymously with 100% data privacy.",
    //           4000,
    //           "", // Reset to empty string for infinite loop
    //         ]}
    //         speed={40}
    //         deletionSpeed={80}
    //         repeat={Infinity}
    //         wrapper="span"
    //         className="typing-container "
    //         cursor={true}
    //         style={{
    //           display: "inline-block",
    //           whiteSpace: "pre-line",
    //           lineHeight: "1.6",
    //         }}
    //       />
    //       {/* <span className="home-text home-text-1">
    //                     Paid Surveys: Earn Money Online, Work From Home.
    //                 </span>
    //                 <span className="home-text home-text-2">
    //                     Earn Rewards For completing academic research questionnaires.
    //                 </span>
    //                 <span className="home-text home-text-3">
    //                     Fill questionnaires anonymously with 100% data privacy.
    //                 </span> */}
    //     </h1>
    //     <Link className="home-link" to="/signup">
    //       Get Started
    //     </Link>
    //   </div>
    // </section>
  );
};

export default Home;
