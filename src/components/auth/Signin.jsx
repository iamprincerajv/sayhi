import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const Signin = () => {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="h-4/6 w-1/5 bg-blue-700 rounded-s-lg"></div>
      <div className="h-4/6 w-2/5 flex flex-col items-center bg-white p-5 rounded-e-lg">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-4/5 p-5 my-6"
        >
          <label htmlFor="email" className="ms-2 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            {...register("email", { required: true })}
            placeholder="you@example.com"
            className="focus:border focus:bottom-3 focus:border-blue-700 p-2 rounded-lg outline-none mb-3"
          />
          <label htmlFor="password" className="ms-2 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            {...register("password", { required: true })}
            placeholder="********"
            className="focus:border focus:bottom-3 focus:border-blue-700 p-2 rounded-lg outline-none mb-3"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-700 me-2"
              />
              <span>Show Password</span>
            </div>
            <button
              type="submit"
              className="bg-blue-700 text-white p-2 font-bold rounded-lg w-1/2"
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
    </div>
  );
};

export default Signin;
