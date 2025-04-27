const config = {
  // API_URL: "https://nasty-marrissa-surveypro-991645a4.koyeb.app",
  // API_URL: "https://prospective-colette-surveypro-ee1a3b96.staging.koyeb.app"
  // API_URL: 'https://surveypro.onrender.com',
  API_URL: `${import.meta.env.VITE_API_URL}`,
  PAYSTACK_PUBLIC_KEY: `${import.meta.env.VITE_PAYSTACK_PUBLIC_KEY}`
};

export default config;