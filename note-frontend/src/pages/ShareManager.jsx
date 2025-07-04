// src/pages/ShareManager.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ShareManager() {
  const { id } = useParams(); // Note ID
  const [sharedWith, setSharedWith] = useState([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notes/${id}/share`, {
        headers,
      });
      setSharedWith(res.data.sharedWith || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load share info");
      Navigate("/notes");
    }
  };

  const handleAddShare = async (e) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/notes/${id}/share`,
        { email, permission },
        { headers }
      );
      setEmail("");
      setPermission("read");
      fetchShares();
    } catch (err) {
      console.error(err);
      alert("Failed to share");
    }
  };

const handleRemove = async (removeEmail) => {
    try {
      const updatedList = sharedWith.filter((user) => user.email !== removeEmail);
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/notes/${id}`,
        {
          sharedWith: updatedList,
        },
        { headers }
      );
      fetchShared();
    } catch (err) {
      alert("Failed to remove user");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Manage Sharing</h1>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Enter email"
          className="p-2 border rounded mr-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          className="p-2 border rounded mr-2"
        >
          <option value="read">Read</option>
          <option value="write">Write</option>
        </select>
        <button onClick={handleShare} className="bg-blue-600 text-white px-4 py-2 rounded">
          Share
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Currently Shared With:</h2>
      <ul className="space-y-2">
        {sharedWith.map((user) => (
          <li key={user.email} className="flex justify-between items-center border p-2 rounded">
            <span>{user.email} ({user.permission})</span>
            <button
              onClick={() => handleRemove(user.email)}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShareManager;