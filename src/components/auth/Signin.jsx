import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import Loading from "../Loading";

const Signin = () => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const socket = useSocket();

  const handleShowPassword = (e) => {
    const password = document.querySelector('input[name="password"]');
    if (e.target.checked) {
      password.type = "text";
    } else {
      password.type = "password";
    }
  };

  const handleSignInDone = useCallback((data) => {
    console.log(data);
    localStorage.setItem("user", JSON.stringify(data));
    setLoading(false);
    navigate("/");
    window.location.reload();
  }
  , [navigate]);

  const handleSignInFailed = useCallback((data) => {
    console.log(data);
    setLoading(false);
    alert(data.message);
  }, []);

  const onSubmit = useCallback((data) => {
    setLoading(true);
    socket.emit("signin", data);
  }, [socket]);

  useEffect(() => {
    socket.on("signin:done", handleSignInDone);
    socket.on("signin:failed", handleSignInFailed);
    return () => {
      socket.off("signin:done", handleSignInDone);
      socket.off("signin:failed", handleSignInFailed);
    };
  }, [socket, handleSignInDone, handleSignInFailed]);

  return (
    <div className="h-full w-full flex justify-center items-center bg-gradient-to-r from-red-300 via-purple-700 to-blue-300">
      <div className="hidden lg:block h-4/6 w-1/5 bg-blue-700 rounded-s-lg"></div>
      <div className="h-4/6 w-11/12 sm:w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/5 flex flex-col items-center bg-white py-5 sm:p-5 rounded-s-lg lg:rounded-s-none rounded-e-lg">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full sm:w-4/5 p-5 my-6"
        >
          <label htmlFor="email" className="ms-2 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
            placeholder="you@example.com"
            className="focus:border focus:bottom-3 focus:border-blue-700 p-2 rounded-lg outline-none mb-3"
          />
          <label htmlFor="password" className="ms-2 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            {...register("password", { required: true, minLength: 6 })}
            placeholder="********"
            className="focus:border focus:bottom-3 focus:border-blue-700 p-2 rounded-lg outline-none mb-3"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm">
              <input
                onClick={handleShowPassword}
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-700 me-2 cursor-pointer"
              />
              <span>Show Password</span>
            </div>
            <button
              disabled={loading}
              type="submit"
              className={`${loading ? "bg-blue-500" : "bg-blue-700"} text-white p-2 font-bold rounded-lg w-1/2`}
            >
              Sign in
            </button>
          </div>
          <span className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-700">
              Sign Up
            </Link>{" "}
          </span>
        </form>
      </div>
      {loading && <Loading />}
    </div>
  );
};

export default Signin;
