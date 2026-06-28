const config = {
 // API_URL: import.meta.env.VITE_API_URL || 'https://api.surveyprotools.com',
//  API_URL: 'https://surveytools-pf0x.onrender.com',
  // API_URL: 'https://staging.surveyprotools.com',
  API_URL: import.meta.env.VITE_API_URL,
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
};

export default config;