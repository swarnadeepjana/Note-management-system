import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const Login = async (email, password) => {
  const res = await axios.post(`${API}/auth/Login`, { email, password });
  return res.data.access_token;
};

export const Register = async (email, password) => {
  return await axios.post(`${API}/auth/Register`, { email, password });
};
