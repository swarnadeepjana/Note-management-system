import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/Login");
    } else {
      fetchNotes();
    }
  }, [search, page]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/Notes`, {
        params: { search, page },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotes(res.data.notes || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching notes:", err);
      if (err.response?.status === 401) {
        navigate("/Login");
      }
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
  if (confirm("Are you sure you want to delete this notes?")) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/Notes/${id}`, {
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // Refresh list
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err.response?.data || err.message);
      alert("Failed to delete notes.");
    }
  }
};


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Notes</h1>
         <Link
          to="/Notes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Notes
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={handleSearch}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      />

      {notes.length === 0 ? (
        <p className="text-center text-gray-500">No notes found.</p>
      ) : (


        <div className="grid gap-4">
          {notes.map((note) => (
            <div
            key={note.id || note._id}
              className="bg-white border p-4 rounded shadow hover:shadow-md transition"
          >
                <h2 className="text-xl font-semibold">{note.title}</h2>
                <p className="text-gray-700 line-clamp-2">{note.content}</p>

                <div className="text-sm text-gray-500 mt-2">
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

              {/* Action Buttons */}
              <div className="flex gap-4">
          <Link
            to={`/notes/${note.id || note._id}/edit`}
            className="text-blue-600 hover:underline"
          >
            Edit
            </Link>

          <a
  href={`https://mail.google.com/mail/?view=cm&fs=1&to=&su=Shared Note: ${encodeURIComponent(note.title)}&body=${encodeURIComponent(`Hey! Check out this note:\n\n${note.content}\n\nLink: ${window.location.origin}/public/notes/${note.id || note._id}`)}&tf=1`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-green-600 hover:underline"
>
  Share via Gmail
</a>
          <button
            onClick={() => handleDelete(note.id || note._id)}
            className="text-red-600 hover:underline"
          >
          Delete
        </button>
          </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Notes;
