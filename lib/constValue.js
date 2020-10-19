const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "http://3.35.166.70"
    : "http://localhost:3001";
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "http://13.125.238.74"
    : "http://localhost:3003";

module.exports = {
  BACKEND_URL,
  FRONTEND_URL
};
