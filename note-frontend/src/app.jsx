import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Notes from "./pages/notes";
import NoteEditor from "./pages/noteEditor";
import ShareManager from "./pages/shareManager";
import Dashboard from "./pages/dashboard";
import Navbar from "./components/navbar";

function App() {
  const location = useLocation();
  const [isloggedIn, setIsloggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {!hidenavbar && <navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<register />} />

        {/* Private routes */}
        {isLoggedIn ? (
          <>
            <Route path="/" element={<navigate to="/notes" />} />
            <Route path="/notes" element={<notes />} />
            <Route path="/notes/new" element={<noteEditor />} />
            <Route path="/notes/:id/edit" element={<noteEditor />} />
            <Route path="/notes/:id/share" element={shareManager />} />
            <Route path="/dashboard" element={<dashboard />} />
          </>
        ) : (
          // Redirect all unknown routes to login
          <Route path="*" element={<navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
