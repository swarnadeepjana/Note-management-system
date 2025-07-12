import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import.meta.env.VITE_BACKEND_URL
import { getUserFromToken } from "../services/auth";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = getUserFromToken();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchNotes();
    }
  }, [search, page]);

  useEffect(() => {
    const start = Date.now();
    return () => {
      const end = Date.now();
      const timeSpent = Math.round((end - start) / 1000); // seconds
      if (user && user.email !== "swarnadeep321@gmail.com") {
        axios.post(`${import.meta.env.VITE_API_BASE_URL}/analytics/track`, {
          email: user.email,
          timeSpent,
          page: "notes"
        });
      }
    };
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notes`, {
        params: { 
          search: search.trim() || undefined, 
          page, 
          limit: 10 
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data.notes) {
        setNotes(res.data.notes);
        setTotalPages(res.data.totalPages || 1);
        setTotalNotes(res.data.totalNotes || 0);
      } else {
        // Fallback for old API structure
        setNotes(res.data);
        setTotalPages(1);
        setTotalNotes(res.data.length);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/notes/${id}`, {
          headers:{
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        fetchNotes();
      } catch (err) {
        console.error("Error deleting note:", err.response?.data || err.message);
        alert("Failed to delete note.");
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Notes</h1>
        <Link
          to="/notes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Note
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search notes by title, content, or tags..."
          value={search}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {totalNotes > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Found {totalNotes} note{totalNotes !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {search ? "No notes found matching your search." : "No notes found."}
        </p>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div
              key={note.id || note._id}
              className="bg-white border p-4 rounded shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{note.title}</h2>
                {note.owner !== localStorage.getItem("userEmail") && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Shared
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 line-clamp-2 mb-2">{note.content}</p>
              
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-sm text-gray-500 mb-3">
                <p>Created: {new Date(note.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}</p>
                <p>Updated: {new Date(note.updatedAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}</p>
              </div>

              <div className="flex gap-4">
                <Link
                  to={`/notes/${note.id || note._id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>

                {note.owner === localStorage.getItem("userEmail") && (
                  <Link
                    to={`/notes/${note.id || note._id}/share`}
                    className="text-green-600 hover:underline"
                  >
                    Share
                  </Link>
                )}

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=Shared Note: ${encodeURIComponent(note.title)}&body=${encodeURIComponent(`Hey! Check out this note:\n\n${note.content}\n\nLink: ${window.location.origin}/public/notes/${note.id || note._id}`)}&tf=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Share via Gmail
                </a>

                {(note.owner === localStorage.getItem("userEmail") || user?.email === "swarnadeep321@gmail.com") && (
                  <button
                    onClick={() => handleDelete(note.id || note._id)}
                    className="text-red-600 hover:underline"
                  >
                    {user?.email === "swarnadeep321@gmail.com" ? "Delete (Admin)" : "Delete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Previous
          </button>
          <span className="px-3 py-1 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Notes;
