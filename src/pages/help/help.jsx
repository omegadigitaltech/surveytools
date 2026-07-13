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
    title: "Account Enquiry",
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
export const faqCategories = [
  {
    title: "General",
    faqs: [
      {
        question: "What is SurveyTools?",
        answer:
          "SurveyTools is a research networking platform that connects researchers with survey respondents willing to participate in exchange for rewards. It simplifies and streamlines the entire data collection process—from distributing your survey to receiving cleaned, analysis-ready results—all in one place.",
      },
      {
        question: "Who is SurveyTools built for?",
        answer:
          "SurveyTools is designed for two groups: researchers who need quality survey responses quickly and respondents who want to earn rewards by participating in surveys. Both groups benefit from the platform simultaneously.",
      },
      {
        question: "Is SurveyTools only for students?",
        answer:
          "No. While SurveyTools launched and piloted with students at Obafemi Awolowo University, the platform now serves researchers and respondents across multiple states in Nigeria, including Ogun, Oyo, Ondo, Ekiti, Kwara, and Lagos, with plans to expand further.",
      },
      {
        question: "Is SurveyTools free to use?",
        answer:
          "It depends on which side of the platform you're on. Respondents sign up and participate for free—and earn rewards for their time. Researchers pay to publish surveys, which covers respondent rewards and platform services. Visit our Pricing page for full details.",
      },
    ],
  },

  {
    title: "For Researchers",
    faqs: [
      {
        question: "How does SurveyTools help me collect research data?",
        answer:
          "Once you publish your survey, SurveyTools distributes it to verified respondents matched to your target demographic. Responses are collected within a predictable timeframe, reward distribution is handled automatically, and your data can be exported in multiple analysis-ready formats.",
      },
      {
        question: "What kind of data analysis does SurveyTools provide?",
        answer:
          "SurveyTools provides cleaned datasets, summary statistics, and advanced visualizations including bar charts, stacked and clustered charts, area charts, scatter plots, heatmaps, treemaps, cluster dendrograms, and network graphs. Premium researchers receive access to the complete analysis suite, reducing the need for separate data cleaning or SPSS services.",
      },
      {
        question: "How many responses can I collect?",
        answer:
          "SurveyTools supports surveys requiring between 50 and 1,000 responses. This covers the sample sizes needed for most student and institutional research. If your project requires a larger or custom sample size, our support team can assist.",
      },
      {
        question: "How quickly will I get my responses?",
        answer:
          "Response times depend on your target audience and sample size, but our incentivized respondent network is designed to deliver results much faster than traditional manual data collection or WhatsApp distribution. Most surveys are completed within 48 hours.",
      },
      {
        question: "Can I export my data in SPSS or other formats?",
        answer:
          "Yes. SurveyTools allows you to export your collected data in multiple analysis-friendly formats so you can continue your work using SPSS or other statistical and research tools.",
      },
      {
        question: "Is my research data secure?",
        answer:
          "Yes. Your survey data is securely stored and is only accessible to you. SurveyTools does not share or sell researcher data to third parties.",
      },
      {
        question:
          "Do you offer discounts for student associations or partner institutions?",
        answer:
          "Yes. SurveyTools partners with student associations, including the Ife Dental Students Association (IFUDSA), Obafemi Awolowo University. Members of partner associations receive discounted research and academic support services. If your institution or association would like to partner with us, please contact our partnerships team.",
      },
    ],
  },

  {
    title: "For Respondents",
    faqs: [
      {
        question: "How do I earn rewards on SurveyTools?",
        answer:
          "After signing up as a respondent, you'll receive surveys matched to your profile. Complete a survey and points are automatically credited to your account. You can redeem your points for airtime, data, or discount vouchers from partner businesses.",
      },
      {
        question: "How much can I earn?",
        answer:
          "Rewards vary depending on the length and complexity of each survey. Points are credited immediately after successful completion, and you can redeem them at any time from your dashboard. Active respondents completing multiple surveys each week can earn meaningful rewards over time.",
      },
      {
        question: "What are vouchers and how do they work?",
        answer:
          "Vouchers are an alternative way to redeem your points and often provide greater value than cash. After converting your points, you'll receive a unique voucher code that can be redeemed at partner businesses for discounts on products or services. Your dashboard includes a voucher wallet where you can view active, pending, and redeemed vouchers.",
      },
      {
        question: "Can I earn extra points beyond surveys?",
        answer:
          "Yes. SurveyTools features a gamification system with daily missions, weekly challenges, and a progression system. Completing these activities earns engagement points that can also be redeemed through the voucher catalogue.",
      },
      {
        question: "What happens if I start a survey but don't finish it?",
        answer:
          "Rewards are only credited after a survey has been fully completed. Partially completed surveys are not eligible for rewards.",
      },
      {
        question: "Is there a minimum number of surveys I have to complete?",
        answer:
          "No. You can participate whenever it suits your schedule. There is no minimum number of surveys required to remain an active respondent.",
      },
      {
        question: "Is SurveyTools available outside Nigeria?",
        answer:
          "SurveyTools currently operates within Nigeria with respondents and researchers across multiple states. We also work with researchers from other African countries—our first international partnership was with a researcher at Ashesi University in Ghana—and we're open to expanding further as the platform grows.",
      },
    ],
  },

  {
    title: "Partnerships & Business",
    faqs: [
      {
        question: "How do I partner with SurveyTools as a business?",
        answer:
          "SurveyTools partners with local and national businesses to provide discount vouchers to our student respondent community. There is no upfront cost—you simply agree on a discount offer, and we'll feature it in our rewards catalogue. Students redeem the vouchers when they visit your business. Contact us at partnerships.surveytools@gmail.com to get started.",
      },
      {
        question: "How do student associations partner with SurveyTools?",
        answer:
          "We work with student associations to make SurveyTools the preferred data collection platform for their members. Partnership benefits include commissions on paying members, academic support discounts, and increased visibility for student-owned businesses on the platform. Contact us to discuss a partnership tailored to your association.",
      },
      {
        question: "Still have a question?",
        answer:
          "Our support team is happy to help. Reach out via our support email or send us a message on any of our social media pages. We typically respond within 24 hours.",
      },
    ],
  },
];
const contactItems = [
  {
    icon: "chat_bubble_outline",
    title: "Live Chat",
    description: "Available  everyday",
    borderColor: "border-[#00A5B5]",
    iconColor: "text-[#00A5B5]",
    href: "https://chat.whatsapp.com/DZDnDKI87qJAVrJZHqRjQN?mode=wwt",
  },
  {
    icon: "mail_outline",
    title: "Email Support",
    description: "Fast reply within hours of sending",
    borderColor: "border-[#00C853]",
    iconColor: "text-[#00C853]",
    href: "mailto:help.surveytools@gmail.com",
  },
  {
    icon: "phone",
    title: "Phone Support",
    description: "Mon - Fri , 9am-5pm",
    borderColor: "border-[#7B1FA2]",
    iconColor: "text-[#7B1FA2]",
    href: "tel:+2348130240604",
  },
];

const Help = () => {
  // const [openFaq, setOpenFaq] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // const filteredFaqs = faqs.filter(
  //   (f) =>
  //     f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  const filteredFaqs = faqCategories
  .map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }))
  .filter((category) => category.faqs.length > 0);
  // const toggleFaq = (index) => {
  //   setOpenFaq(openFaq === index ? null : index);
  // };
  const toggleFaq = (key) => {
    setOpenFaq(openFaq === key ? null : key);
  };
  return (
    <div className="min-h-screen ">
      {/* Hero / Search Header */}
      <section
        className="text-white text-center px-4 py-12 "
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

      <div className="w-full px-4">
        {/* Category Cards */}
        <section className="py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
<div className="space-y-8">
  {filteredFaqs.map((category) => (
    <div key={category.title}>
      <h3 className="text-lg font-semibold mb-4 text-[#008303]">
        {category.title}
      </h3>

      <div className="space-y-3">
        {category.faqs.map((faq, i) => {
          const faqKey = `${category.title}-${i}`;

          return (
            <div
              key={faqKey}
              className="border-b border-gray-200 bg-white px-4 rounded-xl shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center py-4 text-left"
                onClick={() => toggleFaq(faqKey)}
              >
                <span className="text-sm font-medium text-gray-800 pr-4">
                  {faq.question}
                </span>

                <span className="material-icons text-gray-500 flex-shrink-0">
                  {openFaq === faqKey
                    ? "expand_less"
                    : "expand_more"}
                </span>
              </button>

              {openFaq === faqKey && (
                <p className="pb-4 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  ))}

  {filteredFaqs.length === 0 && (
    <p className="py-8 text-sm text-gray-500 text-center">
      No results found for "{searchQuery}"
    </p>
  )}
</div>


 
          {/* <div>
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
          </div> */}
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
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 ${item.borderColor} flex items-center justify-center flex-shrink-0`}
                >
                  <span className={`material-icons text-base sm:text-xl ${item.iconColor}`}>
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
