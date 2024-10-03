import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/signin");
    setShowMenu(false);
  };

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
    setShowMenu(false);
  }, []);

  return (
    <nav className="h-14 w-full fixed top-0 flex justify-between items-center bg-white">
      <div
        onClick={() => navigate("/")}
        className="font-bold tracking-tighter bg-gradient-to-r from-blue-700 via-purple-700 to-red-300 text-transparent bg-clip-text text-3xl ms-5 sm:ms-10 md:ms-16 lg:ms-20 xl:ms-24 cursor-pointer"
      >
        SayHi
      </div>
      <div className="hidden sm:flex items-center justify-evenly w-full max-w-64">
        <div>
          {user ? (
            <div className="font-semibold">{user.name}</div>
          ) : (
            "Not Signed in"
          )}
        </div>
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-blue-700 text-white px-4 py-2 rounded-md sm:mr-3 md:mr-10"
            >
              Logout &rarr;
            </button>
          ) : (
            <button
              onClick={() => navigate("/signin")}
              className="bg-blue-700 text-white px-4 py-2 rounded-md sm:mr-3 md:mr-10"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
      <div
        onClick={() => setShowMenu(!showMenu)}
        className="sm:hidden w-8 mr-2 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
      <div
        className={`sm:hidden fixed right-14 top-1 ${
          showMenu ? "flex" : "hidden"
        } justify-evenly items-center w-10/12 max-w-64 h-12 rounded-md bg-blue-100`}
      >
        <div>
          {user ? (
            <div className="font-semibold">{user.name}</div>
          ) : (
            "Not Signed in"
          )}
        </div>
        <div>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-blue-700 text-white px-4 py-1 rounded-md sm:mr-3 md:mr-10"
            >
              Logout &rarr;
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/signin");
                setShowMenu(false);
              }}
              className="bg-blue-700 text-white px-4 py-2 rounded-md sm:mr-3 md:mr-10"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
