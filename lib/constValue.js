const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.jtwitter.me"
    : "http://localhost:3001";
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://jtwitter.me"
    : "http://localhost:3003";

module.exports = {
  BACKEND_URL,
  FRONTEND_URL
};
