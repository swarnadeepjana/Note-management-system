import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ShareManager() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [sharedWith, setSharedWith] = useState([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/notes/${id}/share`, {
        headers,
      });
      setSharedWith(res.data.sharedWith || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load share info");
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter an email address");
      return;
    }

    try {
      const newShare = { email: email.trim(), permission };
      const updatedShares = [...sharedWith, newShare];
      
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/notes/${id}/share`,
        updatedShares,
        { headers }
      );
      
      setEmail("");
      setPermission("read");
      fetchShares();
    } catch (err) {
      console.error(err);
      alert("Failed to share note");
    }
  };

  const handleRemove = async (removeEmail) => {
    try {
      const updatedList = sharedWith.filter((user) => user.email !== removeEmail);
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/notes/${id}/share`,
        updatedList,
        { headers }
      );
      fetchShares();
    } catch (err) {
      console.error(err);
      alert("Failed to remove user");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading sharing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Sharing</h1>
        <button
          onClick={() => navigate("/notes")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Notes
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Share</h2>
        <form onSubmit={handleAddShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
            </select>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Share Note
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Currently Shared With:</h2>
        {sharedWith.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No one is currently shared with this note</p>
        ) : (
          <ul className="space-y-3">
            {sharedWith.map((user) => (
              <li key={user.email} className="flex justify-between items-center border p-3 rounded">
                <div>
                  <span className="font-medium text-gray-700">{user.email}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    user.permission === 'write' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.permission === 'write' ? 'Read & Write' : 'Read Only'}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(user.email)}
                  className="text-red-500 hover:text-red-700 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ShareManager;