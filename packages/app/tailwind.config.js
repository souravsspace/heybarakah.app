/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#29603E",
        "primary-dark": "#1F4A30",
        "primary-soft": "#E8F0EA",
        secondary: "#000000",
        tertiary: "#6B7280",
        neutral: "#E5E7EB",
        "neutral-soft": "#F5F5F4",
        cream: "#F5EBDB",
        "cream-soft": "#FAF4E8",
        surface: "#FFFFFF",
        ink: "#000000",
        error: "#B42318",
      },
      fontFamily: {
        serif: ["LibreBaskerville-Bold"],
        sans: ["Inter"],
      },
      fontSize: {
        display: ["38px", { lineHeight: "46px", fontWeight: "700" }],
        h1: ["31px", { lineHeight: "38px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "30px", fontWeight: "700" }],
        h3: ["20px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["18px", { lineHeight: "27px" }],
        "body-sm": ["14px", { lineHeight: "21px" }],
        label: ["16px", { lineHeight: "22px", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "17px" }],
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "24px",
        full: "9999px",
      },
      spacing: {
        xs: "6px",
        sm: "14px",
        md: "24px",
        lg: "40px",
        xl: "100px",
      },
    },
  },
  plugins: [],
};
