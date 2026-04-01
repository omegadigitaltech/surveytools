import "./loader.css";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="pageloader">
      <div className="pageloader-spinner" />
      <p>{text}</p>
    </div>
  );
};

export default Loader;