// src/services/notes.js
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Notes
export const fetchNotes = async (search = "", page = 1) => {
  const res = await axios.get(`${API}/notes?search=${search}&page=${page}`, authHeaders());
  return res.data;
};

export const getNoteById = async (id) => {
  const res = await axios.get(`${API}/notes/${id}`, authHeaders());
  return res.data;
};

export const createNote = async (note) => {
  return await axios.post(`${API}/notes`, note, authHeaders());
};

export const updateNote = async (id, note) => {
  return await axios.put(`${API}/notes/${id}`, note, authHeaders());
};

// Sharing
export const fetchShares = async (noteId) => {
  const res = await axios.get(`${API}/notes/${noteId}/share`, authHeaders());
  return res.data;
};

export const addShare = async (noteId, email, permission) => {
  return await axios.post(`${API}/notes/${noteId}/share`, { email, permission }, authHeaders());
};

export const removeShare = async (noteId, userId) => {
  return await axios.delete(`${API}/notes/${noteId}/share/${userId}`, authHeaders());
};

// Analytics
export const fetchAnalytics = async () => {
  const res = await axios.get(`${API}/analytics`, authHeaders());
  return res.data;
};
