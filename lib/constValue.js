"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.BACKEND_URL = void 0;
const BACKEND_URL = process.env.NODE_ENV === "production"
    ? "https://api.jtwitter.me"
    : "http://localhost:3001";
exports.BACKEND_URL = BACKEND_URL;
const FRONTEND_URL = process.env.NODE_ENV === "production"
    ? "https://jtwitter.me"
    : "http://localhost:3003";
exports.FRONTEND_URL = FRONTEND_URL;
