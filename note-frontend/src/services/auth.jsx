import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API = import.meta.env.VITE_API_BASE_URL;

export const login = async (email, password) => {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data.access_token;
};

export const register = async (email, password) => {
  return await axios.post(`${API}/auth/register`, { email, password });
};

export function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // The JWT token has 'sub' field containing the email
    return {
      email: decoded.sub,
      role: decoded.role
    };
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}
