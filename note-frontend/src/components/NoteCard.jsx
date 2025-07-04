// src/components/NoteCard.jsx
import { useNavigate } from "react-router-dom";

function NoteCard({ note }) {
  const navigate = useNavigate();

  return (
    <div
      className="p-4 bg-white rounded shadow hover:bg-blue-50 cursor-pointer"
      onClick={() => navigate(`/Notes/${note._id}/edit`)}
    >
      <h3 className="text-lg font-bold text-blue-800">{note.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 mt-1">{note.content}</p>
      <div className="text-xs text-gray-400 mt-2">
        Tags: {note.tags && note.tags.join(", ")}
      </div>
    </div>
  );
}

export default NoteCard;
