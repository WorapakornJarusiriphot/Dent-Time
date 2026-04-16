/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      mq450: { max: "450px" },
      mq725: { max: "725px" },
      mq1000: { raw: "screen and (min-width: 726px) and (max-width: 1000px)" },
      mq750: { max: "750px" },
      mq1050: { max: "1050px" },
      mq1125: { max: "1125px" },
      lg: { raw: "screen and (max-width: 1200px)" },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
