import { Link, useNavigate } from "react-router-dom";

function navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between text-white">
      <div className="font-bold text-xl">📘 NoteApp</div>
      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            <Link to="/notes" className="hover:underline">notes</Link>
            <Link to="/dashboard" className="hover:underline">dashboard</Link>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">login</Link>
            <Link to="/register" className="hover:underline">register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
