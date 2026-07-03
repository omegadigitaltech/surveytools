import React from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

const Features = () => {
  const headingRef = useScrollReveal();
  const gridRef = useScrollReveal({ threshold: 0.1 });
  const features = [
    {
      title: "Questionnaire Builder",
      content:
        "Create and build questionnaires for your projects and research from scratch or use our made templates",
    },
    {
      title: "Reward System",
      content:
        "Fill in questionnaires and earn rewards/points and convert it to airtime or vouchers",
    },
    {
      title: "Visual Analytics",
      content:
        "Beautiful charts and insights that makes data easy to understand.",
    },
    {
      title: "Security Data and Privacy",
      content: "Enterprise-grade security keeps data safe and compliant",
    },
  ];
  return (
    <section className="features pt-[3rem] pb-[5rem] md:pb-[10rem] px-[5%]">
      <h2 ref={headingRef} className="reveal text-4xl md:text-5xl text-center font-[600] py-10">
        Our Features
      </h2>
      <div ref={gridRef} className="stagger-grid grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-between">
        {features.map((feature) => {
          const { title, content } = feature;
          return (
            <div className="reveal-item relative bg-[#dbe7ea] rounded-tl-md rounded-tr-3xl rounded-br-3xl rounded-bl-3xl p-6 pt-10 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow justify-self-center max-w-[100%]">
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-[var(--primary)] ring-4 ring-white"></div>
              <h3 className=" feature-hd text-base md:text-base font-bold mb-2 mt-4 text-center w-full uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-sm  leading-relaxed">{content}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
