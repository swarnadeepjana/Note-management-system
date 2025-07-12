import { Link, useNavigate } from "react-router-dom";
import { getUserFromToken } from '../services/auth';
import axios from "axios";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const isAdmin = user && user.email === 'swarnadeep321@gmail.com';

  const handleLogout = () => {
    if (user && user.email) {
      axios.post(`${import.meta.env.VITE_API_BASE_URL}/analytics/track-logout`, { email: user.email });
    }
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between text-white">
      <div className="font-bold text-xl flex items-center gap-4">
        📘 NoteApp
      </div>
      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/notes" className="hover:underline">Notes</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
