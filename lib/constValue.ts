const BACKEND_URL: string =
  process.env.NODE_ENV === "production"
    ? "https://api.jtwitter.me"
    : "http://localhost:3001";
const FRONTEND_URL: string =
  process.env.NODE_ENV === "production"
    ? "https://jtwitter.me"
    : "http://localhost:3003";

export { BACKEND_URL, FRONTEND_URL };
