import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import NoteEditor from "./pages/NoteEditor";
import ShareManager from "./pages/ShareManager";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />

        {isLoggedIn ? (
          <>
            <Route path="/" element={<Navigate to="/notes" />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id/edit" element={<NoteEditor />} />
            <Route path="/notes/:id/share" element={<ShareManager />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
