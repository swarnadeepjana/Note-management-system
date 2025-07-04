// src/pages/NoteEditor.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function NoteEditor() {
  const { id } = useParams(); // if present, it's an edit
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
  if (id) {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      console.log("Loaded note:", res.data); // ✅ Add this
      const note = res.data;
      setTitle(note.title || "");
      setContent(note.content || "");
      setTags((note.tags || []).join(", "));
    })
    .catch(err => {
      console.error("Failed to fetch note:", err);
      alert("Failed to load note.");
    });
  }
}, [id]);


  const handleSave = async (e) => {
    e.preventDefault();
    const noteData = {
      title,
      content,
      tags: tags.split(",").map(tag => tag.trim()),
    };

    try {
      if (id) {
        // update
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/notes/${id}`, noteData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        // create
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/notes`, noteData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      navigate("/notes");
    } catch (err) {
      console.error(err);
      alert("Failed to save note.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <form onSubmit={handleSave} className="bg-white shadow p-4 rounded">
        <h2 className="text-xl font-bold mb-4">{id ? "Edit Note" : "New Note"}</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border mb-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          className="w-full p-2 border mb-3 rounded h-40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          className="w-full p-2 border mb-4 rounded"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {id ? "Update" : "Create"}
        </button>
      </form>
    </div>
  );
}

export default NoteEditor;
