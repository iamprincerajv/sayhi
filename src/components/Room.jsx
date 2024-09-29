import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [mystream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const handleCallUser = useCallback(
    async (id) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: id, offer });
      setMyStream(stream);
    },
    [socket]
  );

  const handleUserJoined = useCallback(
    ({ email, id }) => {
      console.log(email);
      setRemoteSocketId(id);
      handleCallUser(id);
    },
    [handleCallUser]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      console.log(from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
    }
    setIsCallAccepted(true);
  }, [mystream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted");
      sendStream();
    },
    [sendStream]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  // TURN ON/OFF CAMERA AND MIC
  const handleCamera = async () => {
    if (mystream) {
      if (isCameraOn) {
        mystream.getVideoTracks()[0].enabled =
          !mystream.getVideoTracks()[0].enabled;
        console.log(mystream.getVideoTracks()[0].enabled);
        setMyStream(mystream);
        setIsCameraOn(false);
      } else {
        mystream.getVideoTracks()[0].enabled =
          !mystream.getVideoTracks()[0].enabled;
        setMyStream(mystream);
        setIsCameraOn(true);
      }
    }
  };

  const handleMic = async () => {
    if (mystream) {
      if (isMicOn) {
        mystream.getAudioTracks()[0].enabled =
          !mystream.getAudioTracks()[0].enabled;
        setMyStream(mystream);
        setIsMicOn(false);
      } else {
        mystream.getAudioTracks()[0].enabled =
          !mystream.getAudioTracks()[0].enabled;
        setMyStream(mystream);
        setIsMicOn(true);
      }
    }
  };

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      console.log("got tracks");
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="h-full overflow-hidden bg-black relative">
      <div
        className={`${
          remoteStream
            ? "w-fit h-fit max-w-52 sm:max-w-64 md:max-w-80 xl:max-w-96 absolute right-[3%] bottom-[5%] bg-black rounded-lg border-2 border-blue-500"
            : "h-full w-full"
        }`}
      >
        {mystream && (
          <ReactPlayer
            playing
            url={mystream}
            width="100%"
            height="100%"
          />
        )}
      </div>
      <div className="h-full w-full ">
        {remoteStream && (
          <ReactPlayer
            playing
            url={remoteStream}
            width="100%"
            height="100%"
          />
        )}
      </div>
      <div>
        {mystream && remoteStream && !isCallAccepted && (
          <div className="bg-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-96 max-h-96 rounded-md p-5">
            <div className="text-center font-semibold text-lg italic">
              Someone's waiting for you !
            </div>
            <div className="flex justify-center items-center rounded-md my-4">
              <img
                className="rounded-md aspect-square w-4/6 min-w-60"
                src="/boy.jpg"
                alt="meeting"
              />
            </div>
            <div className="flex justify-center items-center mt-5">
              <span className="font-semibold italic w-32 text-center text-blue-700">
                Come on
              </span>
              <button
                className="bg-blue-700 text-white w-full rounded-md py-2 italic"
                onClick={sendStream}
              >
                SayHi !
              </button>
            </div>
          </div>
        )}
      </div>
      <div>
        {remoteStream && isCallAccepted && (
          <div className="absolute left-[5%] bottom-[5%] xl:left-1/2 xl:bottom-5 xl:-translate-x-1/2 xl:-translate-y-1/2 sm:w-full sm:max-w-60 h-full max-h-48 sm:h-auto flex flex-col sm:flex-row justify-evenly items-center rounded-lg">
            <button
              onClick={handleCamera}
              className="bg-blue-500 rounded-full flex justify-center items-center aspect-square w-12"
            >
              <img src={`${isCameraOn ? "/videoon.png" : "/videooff.png"}`} alt="video" className="w-8" />
            </button>
            <button onClick={handleMic} className="bg-blue-500 rounded-full flex justify-center items-center aspect-square w-12">
              <img src={`${isMicOn ? "/audioon.png" : "/audiooff.png"}`} alt="mic" className="w-8" />
            </button>
            <button className="bg-red-500 rounded-full flex justify-center items-center aspect-square w-12">
              <img src="/disconnect.png" alt="disconnect" className="w-8" />
            </button>
          </div>
        )}
      </div>
      <div>
        {!mystream && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-80 max-h-48 rounded-md p-5 bg-white">
            <div className="text-center font-semibold text-lg italic">
              Waiting for someone to join !
            </div>
            <div className="flex justify-center items-center rounded-md -mt-14">
              <img
                className="rounded-md aspect-square w-4/6 min-w-60"
                src="/loading.svg"
                alt="loading"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
