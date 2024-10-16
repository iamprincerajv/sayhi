import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { useSearchParams } from "react-router-dom";

const Lobby = () => {
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const socket = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleNewMeeting = useCallback(() => {
    setLoading(true);
    const roomId = Math.random().toString(36).substring(7);
    const email = user.email;

    socket.emit("room:join", { room: roomId, email });
    // eslint-disable-next-line
  }, [socket]);

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      setLoading(true);
      const email = user.email;

      if (room) {
        if (room.startsWith("http")) {
          const roomId = room.split("/").pop();
          socket.emit("room:join", { room: roomId, email });
        } else {
          socket.emit("room:join", { room, email });
        }
      }
    },
    // eslint-disable-next-line
    [room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      setLoading(false);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  const handleRoomJoinFailed = useCallback((data) => {
    setLoading(false);
    alert(data.message);
  }, []);

  const handleSearchRoom = useCallback(() => {
    const roomId = searchParams.get("roomId");

    if (roomId) {
      setRoom(roomId);
    }
  } ,[searchParams]);

  useEffect(() => {
    handleSearchRoom();
  }, [handleSearchRoom]);

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    socket.on("room:join:failed", handleRoomJoinFailed);
    return () => {
      socket.off("room:join", handleJoinRoom);
      socket.off("room:join:failed", handleRoomJoinFailed);
    };
  }, [socket, handleJoinRoom, handleRoomJoinFailed]);

  return (
    <div className="lg:flex justify-center items-center h-full">
      <div className="lg:w-2/3 xl:w-1/2 h-full flex flex-col justify-center px-5 md:px-16">
        <div className="font-semibold text-4xl sm:text-5xl mb-5 text-pretty">
          Video calls and meetings for everyone
        </div>
        <div className="text-xl mb-8 text-pretty">
          Connect and <span className="font-bold">SayHi</span> to anyone from
          anywhere in the world. One-One video calls.
        </div>
        {user ? (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-fit">
            <button
              onClick={handleNewMeeting}
              className="bg-blue-700 text-white rounded-md py-2 px-4 mb-5 sm:mb-0 sm:mr-2 w-32 sm:min-w-32"
            >
              New Meeting
            </button>
            <div>
              <form onSubmit={handleSubmitForm}>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="py-2 px-3 mr-5 border-2 border-blue-400 focus:border-blue-700 outline-none rounded-md"
                  type="text"
                  placeholder="Enter a code or link"
                />
                <button
                  disabled={!room}
                  type="submit"
                  className="bg-white text-blue-700 py-2 px-3 rounded-md min-w-14"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-fit">
            <button
              onClick={() => navigate("/signin")}
              className="bg-blue-700 text-white rounded-md py-2 px-4 mb-5 sm:mb-0 sm:mr-2 font-semibold sm:min-w-32"
            >
              Get Started &rarr;
            </button>
          </div>
        )}
        <div>
          <div className="h-[1px] bg-gray-400 rounded-md mt-12 mb-3"></div>
          <span className="font-semibold italic">SayHi</span> to the world with
          us!
        </div>
      </div>
      <div className="w-full lg:w-1/3 flex justify-center items-center flex-col">
        <div className="w-4/5 sm:w-2/3 md:w-1/2 lg:w-2/3 rounded-full">
          <img
            src="/boy.jpg"
            alt="meeting"
            className="h-full w-full rounded-full"
          />
        </div>
        <div className="text-pretty text-lg mt-5 font-semibold w-3/5 text-center mb-10 lg:mb-0">
          Create a new meeting or join an existing one with a code or link.
        </div>
      </div>
      {loading && <Loading />}
    </div>
  );
};

export default Lobby;
