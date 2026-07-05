import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: "tune",
    title: "Account Settings",
    description: "Manage your profile and preference",
    iconColor: "text-[#00A5B5]",
    iconBg: "bg-[#E8F9FB]",
  },
  {
    icon: "card_giftcard",
    title: "Rewards & Conversion",
    description: "Points Voucher and Marketplace",
    iconColor: "text-[#00C853]",
    iconBg: "bg-[#E8FAF0]",
  },
  {
    icon: "error_outline",
    title: "Account Settings",
    description: "Manage your profile and preference",
    iconColor: "text-[#FF6D00]",
    iconBg: "bg-[#FFF3E0]",
  },
  {
    icon: "confirmation_number",
    title: "Voucher Problems",
    description: "Issues with redeeming your code",
    iconColor: "text-[#7B1FA2]",
    iconBg: "bg-[#F3E5F5]",
  },
];

const faqs = [
  {
    question: "How do I convert my points into a Voucher?",
    answer:
      "Navigate to your dashboard, under points click on the convert button directly under the points balance, you will be directed to the voucher and market place page where you can use quick convert to generate a voucher.",
  },
  {
    question: "What is the conversion rate for Points?",
    answer:
      "The conversion rate varies based on your membership tier. Standard members convert at 100 points = ₦50, while Pro members enjoy a higher rate of 100 points = ₦75.",
  },
  {
    question: "My Voucher code isn't working, what should I do?",
    answer:
      "First, ensure the code hasn't expired. If it's still valid, try clearing your browser cache and retrying. If the issue persists, contact our support team with the voucher code for assistance.",
  },
  {
    question: "Can I undo a points conversion?",
    answer:
      "Points conversions are generally irreversible once processed. However, if you converted by mistake within the last 24 hours, please contact our support team immediately and we'll review your request.",
  },
  {
    question: "I can't upload my pdf surveys, what should I do?",
    answer:
      "Ensure your PDF file is under 10MB and is not password protected. If you're still experiencing issues, try converting to a smaller file size or contact our support team for assistance.",
  },
];

const contactItems = [
  {
    icon: "chat_bubble_outline",
    title: "Live Chat",
    description: "Available  everyday",
    borderColor: "border-[#00A5B5]",
    iconColor: "text-[#00A5B5]",
    href: "#live-chat",
  },
  {
    icon: "mail_outline",
    title: "Email Support",
    description: "Fast reply within hours of sending",
    borderColor: "border-[#00C853]",
    iconColor: "text-[#00C853]",
    href: "mailto:support@surveytools.com",
  },
  {
    icon: "phone",
    title: "Phone Support",
    description: "Mon - Fri , 9am-5pm",
    borderColor: "border-[#7B1FA2]",
    iconColor: "text-[#7B1FA2]",
    href: "tel:+2348000000000",
  },
];

const Help = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen ">
      {/* Hero / Search Header */}
      <section
        className="text-white text-center px-4 py-12"
        style={{
          background: "linear-gradient(to right, #008303, #0096B8)",
        }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          How can I help you today
        </h1>
        <p className="text-sm md:text-base opacity-90 mb-7">
          Search our knowledge base and categories below to find exactly what
          you need
        </p>
        <div className="max-w-lg mx-auto relative bg-white rounded-xl">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl select-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search for articles, guides or FAQs......"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full text-gray-700 text-sm outline-none"
          />
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4">
        {/* Category Cards */}
        <section className="py-8">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat, i) => (
              <button
                key={i}
                className="text-left p-5 rounded-xl border border-dashed border-gray-300 bg-white hover:shadow-md transition"
              >
                <div
                  className={`w-10 h-10 rounded-full ${cat.iconBg} flex items-center justify-center mb-3`}
                >
                  <span className={`material-icons text-xl ${cat.iconColor}`}>
                    {cat.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{cat.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {cat.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-8">
          <h2 className="text-2xl font-bold mb-1">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Quick answers to common questions
          </p>

          <div>
            {filteredFaqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200 bg-white px-4 rounded-xl shadow-sm">
                <button
                  className="w-full flex justify-between items-center py-4 text-left"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="text-sm font-medium text-gray-800 pr-4">
                    {faq.question}
                  </span>
                  <span className="material-icons text-gray-500 flex-shrink-0">
                    {openFaq === i ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="py-8 text-sm text-gray-500 text-center">
                No results found for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="pb-8">
          <h2 className="text-2xl font-bold mb-1">Still need help?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Contact our Support team
          </p>

          <div className="space-y-5 bg-white p-6 rounded-xl shadow-sm" >
            {contactItems.map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-4 py-1 hover:opacity-80 transition"
              >
                <div
                  className={`w-11 h-11 rounded-full border-2 ${item.borderColor} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`material-icons text-xl ${item.iconColor}`}>
                    {item.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-gray-500 text-xs">{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Premium Support Banner */}
        {/* <section
          className="rounded-2xl text-white px-6 py-6 mb-8"
          style={{
            background: "linear-gradient(to right, #008303, #0096B8)",
          }}
        >
          <h3 className="font-bold text-lg mb-1">Premium Support</h3>
          <p className="text-sm opacity-90 mb-4">
            Pro members get priority queueing, and dedicated account managers
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 bg-white text-[#00A5B5] font-semibold text-sm px-4 py-2 rounded-md hover:bg-gray-50 transition"
          >
            <span className="material-icons text-base">workspace_premium</span>
            Upgrade to Pro
          </Link>
        </section> */}
      </div>
    </div>
  );
};

export default Help;
