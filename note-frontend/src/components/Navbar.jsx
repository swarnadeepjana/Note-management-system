import { Link, useNavigate } from "react-router-dom";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/Login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between text-white">
      <div className="font-bold text-xl">📘 NoteApp</div>
      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/Notes" className="hover:underline">Notes</Link>
            <Link to="/Dashboard" className="hover:underline">Dashboard</Link>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/Login" className="hover:underline">Login</Link>
            <Link to="/Register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
