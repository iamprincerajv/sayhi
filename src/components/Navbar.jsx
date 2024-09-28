import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signin');
  };

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, []);

  return (
    <nav className='h-14 w-full fixed top-0 flex justify-between items-center bg-white'>
      <div onClick={() => navigate("/")} className='font-bold tracking-tighter bg-gradient-to-r from-blue-700 via-purple-700 to-red-300 text-transparent bg-clip-text text-3xl ms-5 sm:ms-10 md:ms-16 lg:ms-20 xl:ms-24 cursor-pointer'>SayHi</div>
      <div className='hidden sm:flex items-center justify-evenly w-full max-w-64'>
        <div>{user ? (
          <div className='font-semibold'>{user.name}</div>
        ) : "Not Signed in"}</div>
        <div>
          {user ? (
            <button onClick={handleLogout} className='bg-blue-700 text-white px-4 py-2 rounded-md sm:mr-3 md:mr-10'>Logout &rarr;</button>
          ) : (
            <button onClick={() => navigate("/signin")} className='bg-blue-700 text-white px-4 py-2 rounded-md sm:mr-3 md:mr-10'>Sign in</button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
