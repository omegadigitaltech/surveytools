import React from "react";

const Utilities = () => {
  const categories = [
    {
      title: "Students",
      description:
        "Perfect for academic research, thesis projects and undergraduate projects. Get the data you need for your projects.",
      icon: "/student-icon.svg",
      bgColor: "bg-[#BDE8FF4D]",
    },
    {
      title: "Professionals",
      description:
        "Market Research, customer feedback, employee satisfaction survey made simple and effective.",
      icon: "professionals-icon.svg",
      bgColor: "bg-[#F1D8FF4D]",
    },
    {
      title: "Corporation",
      description:
        "Enterprise scale surveys with advanced analytics, team collaboration and custom branding options.",
      icon: "/corporation-icon.svg",
      bgColor: "bg-[#C3FFDA4D]",
    },
  ];
  return (
    <section className="pt-[3rem] pb-[5rem] md:pb-[10rem] bg-white">
      <h2 className="text-4xl md:text-5xl text-center font-[600] py-10">
        Build For Every Research Need
      </h2>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-6 mt-8 max-w-[90%] lg:max-w-[75%]">
          {categories.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl shadow-sm ${item.bgColor} hover:shadow-md transition`}
            >
              <img className="mb-4 h-[3rem] md:h-auto " src={item.icon} alt={item.title} />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Utilities;
