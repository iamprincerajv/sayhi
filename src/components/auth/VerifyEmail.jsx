import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSocket } from "../../context/SocketProvider";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { register, handleSubmit } = useForm();
  const socket = useSocket();
  const [queryParameters] = useSearchParams();
  const navigate = useNavigate();

  const onSubmit = useCallback((data) => {
    const email = queryParameters.get("email");
    console.log(data);
    socket.emit("verifyEmail", {email, verifyCode: data.verifyCode});
  }, [socket, queryParameters]);

  const handleVerifyDone = useCallback((data) => {
    console.log(data);
    navigate("/signin");
  }, [navigate]);

  const handleVerifyFailed = useCallback((data) => {
    console.log(data);
    alert(data.message);
  }, []);

  useEffect(() => {
    socket.on("verify:done", handleVerifyDone);
    socket.on("verify:failed", handleVerifyFailed);
    return () => {
      socket.off("verify:done", handleVerifyDone);
      socket.off("verify:failed", handleVerifyFailed);
    };
  }, [handleVerifyDone, handleVerifyFailed, socket]);

  return (
    <div className="h-full w-full flex justify-center items-center bg-gradient-to-r from-red-300 via-purple-700 to-blue-300">
      <div className="bg-white w-max sm:w-1/2 xl:w-1/3 h-80 rounded-lg">
        <div className="px-5 sm:px-10 py-8">
          <h1 className="text-2xl tracking-tight font-bold text-center">
            Verify Your Email
          </h1>
          <p className="text-center">
            Check your email for a verification code
          </p>
        </div>
        <div className="flex justify-center items-center">
          <form onSubmit={handleSubmit(onSubmit)} className="w-11/12 sm:w-10/12 flex justify-evenly items-center">
            <input
              type="text"
              {...register("verifyCode", { required: true })}
              placeholder="Enter Verification Code"
              className="w-[70%] rounded-lg px-3 py-2 outline-none border border-blue-700 mr-1"
            />
            <button
              type="submit"
              className="w-[25%] px-3 py-2 rounded-lg font-semibold text-blue-700 bg-blue-50"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
