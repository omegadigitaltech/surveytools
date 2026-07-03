import React from "react";

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "David Aderoke",
      role: "Final year student",
      image: "/ava3.png",
      text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
    },
    {
      name: "Ruth Eze",
      role: "Researcher",
      image: "/ava2.png",
      text: "Creating surveys is now so much faster. I had my form ready in minutes instead of spending hours.",
    },
    {
      name: "Anna Yusuf",
      role: "300 level student",
      image: "/ava1.png",
      text: "The response analytics made it easy to understand my audience. Everything was clear and well organized.",
    },
    {
      name: "Daniel Johnson",
      role: "400 level student",
      image: "/ava4.png",
      text: "SurveyTools helped me collect quality responses for my market research without any hassle.",
    },
    {
      name: "Floyd Miles",
      role: "Final year student",
      image: "/ava5.png",
      text: "The interface is simple and intuitive. Even as a first-time user, I created a professional survey with ease.",
    },
    {
      name: "Racheal Wilson",
      role: "Student Researcher",
      image: "/ava6.png",
      text: "I love how quickly I can build surveys and review the results. It has become an essential tool for my projects.",
    },
  ];
  return (
    <section className=" testimonial py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h4 className="font-[600] text-black tracking-wide">Testimonials</h4>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 py-2">
          Our Trusted Users
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <img src="/star.svg" alt="" className="w-5 h-5" />
              ))}
            </div>

            {/* Quote */}
            <p className=" test-quote text-black font-[500] mb-6">“{t.text}”</p>

            {/* User info */}
            <div className="flex items-center gap-3">
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="test-name text-sm font-semibold text-gray-900">
                  {t.name}
                </h4>
                <p className="text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
