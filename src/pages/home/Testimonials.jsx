import React from 'react'

const TestimonialSection = () => {
    const testimonials = [
  {
    name: "Derrick Mundane",
    role: "Final year student",
    image: "/derrick.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
  {
    name: "Ralph Edwards",
    role: "Final year student",
    image: "/ralph.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
  {
    name: "Annette Black",
    role: "Final year student",
    image: "/annette.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
  {
    name: "Darlene Robertson",
    role: "Final year student",
    image: "/darlene.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
  {
    name: "Floyd Miles",
    role: "Final year student",
    image: "/floyd.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
  {
    name: "Jenny Wilson",
    role: "Final year student",
    image: "/jenny.png",
    text: "The AI questionnaire builder saved me tons of work on my thesis research. The insights were exactly what I needed.",
  },
];
  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-12">
        <h4 className="font-[500] text-black tracking-wide">
          Testimonials
        </h4>
        <h2 className="text-5xl font-bold text-gray-900 mt-2 py-2">
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
            <p className="text-black font-[500] mb-6">
              “{t.text}”
            </p>

            {/* User info */}
            <div className="flex items-center gap-3">
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t.name}</h4>
                <p className="text-xs">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialSection