import { useNavigate } from "react-router-dom";
import { getUserFromToken } from '../services/auth';
import axios from "axios";

function NoteCard({ note, onDelete }) {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isAdmin = user && user.email === 'swarnadeep321@gmail.com';

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/notes/${note._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (onDelete) {
          onDelete(note._id);
        }
      } catch (err) {
        console.error("Error deleting note:", err.response?.data || err.message);
        alert("Failed to delete note.");
      }
    }
  };

  return (
    <div
      className="p-4 bg-white rounded shadow hover:bg-blue-50 cursor-pointer relative"
      onClick={() => navigate(`/notes/${note._id}/edit`)}
    >
      <h3 className="text-lg font-bold text-blue-800">{note.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 mt-1">{note.content}</p>
      <div className="text-xs text-gray-400 mt-2">
        Tags: {note.tags && note.tags.join(", ")}
      </div>
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
          title="Delete Note (Admin)"
        >
          
        </button>
      )}
    </div>
  );
}

export default NoteCard;
