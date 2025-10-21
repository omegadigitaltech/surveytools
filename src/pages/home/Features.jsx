import React from "react";

const Features = () => {
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
      <h2 className="text-4xl md:text-5xl text-center font-[600] py-10">Our Features</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 justify-between">
        {features.map((feature) => {
          const { title, content } = feature;
          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow justify-self-center max-w-[90%]">
              <div className="h-12 w-12 rounded-full bg-gray-300"></div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 mt-6">{title}</h3>
              <p className="text-sm">{content}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
