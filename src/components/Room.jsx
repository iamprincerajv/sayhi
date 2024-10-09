import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useNavigate } from "react-router-dom";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [mystream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [showCallOptions, setShowCallOptions] = useState(true);

  const navigate = useNavigate();

  const handleCallUser = useCallback(
    async (id) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
        },
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
        audio: {
          echoCancellation: true,
        },
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

  // DISCONNECT FROM CALL
  const handleDisconnect = useCallback(() => {
    if (mystream) {
      mystream.getTracks().forEach((track) => track.stop());
      setMyStream(null);
      setRemoteStream(null);
      setIsCallAccepted(false);
      setIsCameraOn(true);
      setIsMicOn(true);
      socket.emit("user:disconnect", { to: remoteSocketId });
      navigate("/");
      window.location.reload();
    }
  }, [mystream, navigate, remoteSocketId, socket]);

  // SHARE MEETING LINK
  const handleShareLink = useCallback(async () => {
    try {
      const roomId = window.location.pathname.split("/").pop();
      await navigator.share({
        title: "Meeting Details",
        text: `Your Meeting Code: ${roomId}. Open this link and click join.`,
        url: `https://sayyhii.netlify.app/?roomId=${roomId}`,
      });
    } catch (error) {
      alert("Error sharing meeting link");
    }
  }, []);

  // CALL OPTIONS HANDLERS
  const handleHideCallOptions = useCallback(() => {
    setShowCallOptions(false);
  }, []);

  const handleShowCallOptions = useCallback(() => {
    setShowCallOptions(true);
  }, []);

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
    socket.on("user:disconnect", handleDisconnect);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("user:disconnect", handleDisconnect);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    handleDisconnect,
  ]);

  useEffect(() => {
    let callOptionsInterval;
    if(showCallOptions && mystream) {
      callOptionsInterval = setInterval(() => {
        handleHideCallOptions();
      }, 7000);
    }
    return () => {
      if(callOptionsInterval) {
        clearInterval(callOptionsInterval);
      }
    }
  }, [handleHideCallOptions, showCallOptions, mystream]);

  return (
    <div
      className="h-full overflow-hidden bg-black relative"
      onClick={handleShowCallOptions}
    >
      <div
        className={`${
          remoteStream
            ? "w-fit h-fit max-w-32 sm:max-w-56 md:max-w-72 xl:max-w-80 absolute right-[2%] bottom-[2%] sm:right-[3%] sm:bottom-[3%] bg-black rounded-lg border-2 border-blue-500"
            : "h-full w-full"
        }`}
      >
        {mystream && (
          <ReactPlayer playing url={mystream} width="100%" height="100%" />
        )}
      </div>
      <div className="h-full w-full ">
        {remoteStream && (
          <ReactPlayer playing url={remoteStream} width="100%" height="100%" />
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
        <div
          className={`absolute transition-left transition-bottom duration-1000 ease-in-out ${
            showCallOptions ? "left-[3%] sm:left-[5%] xl:bottom-5" : "left-[-50%] xl:bottom-[-50%]"
          } bottom-[3%] sm:bottom-[5%] xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 sm:w-full sm:max-w-fit h-full max-h-fit sm:h-auto flex flex-col sm:flex-row justify-evenly items-center rounded-lg bg-gray-800 px-2`}
        >
          {!isCallAccepted && (
            <button
              onClick={handleShareLink}
              className="rounded-full flex justify-center items-center aspect-square w-10 sm:w-12"
            >
              <img
                src="/share.svg"
                alt="share"
                className="w-6 sm:w-7"
                style={{
                  filter:
                    "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
                }}
              />
            </button>
          )}

          {remoteStream && isCallAccepted && (
            <button
            onClick={handleShareLink}
            className="rounded-full flex justify-center items-center aspect-square w-10 sm:w-12"
          >
            <img
              src="/screen.svg"
              alt="Share Screen"
              className="w-6 sm:w-7"
              style={{
                filter:
                  "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
              }}
            />
          </button>
          )}

          {mystream && (
            <>
              <button
                onClick={handleShareLink}
                className="rounded-full flex justify-center items-center aspect-square w-10 sm:w-12"
              >
                <img
                  src="/camerarotate.svg"
                  alt="Rotate Camera"
                  className="w-6 sm:w-7"
                  style={{
                    filter:
                      "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
                  }}
                />
              </button>
              <button
                onClick={handleCamera}
                className="rounded-full flex justify-center items-center aspect-square w-10 sm:w-12"
              >
                <img
                  src={`${isCameraOn ? "/videoon.png" : "/videooff.png"}`}
                  alt="video"
                  className="w-6 sm:w-7"
                  style={{
                    filter:
                      "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
                  }}
                />
              </button>
              <button
                onClick={handleMic}
                className="rounded-full flex justify-center items-center aspect-square w-10 sm:w-12"
              >
                <img
                  src={`${isMicOn ? "/audioon.png" : "/audiooff.png"}`}
                  alt="mic"
                  className="w-6 sm:w-7"
                  style={{
                    filter:
                      "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
                  }}
                />
              </button>{" "}
            </>
          )}
      
          {remoteStream && isCallAccepted && (
            <button
              onClick={handleDisconnect}
              className="bg-red-600 mb-2 sm:mb-0 sm:mr-2 rounded-full flex justify-center items-center aspect-square w-10"
            >
              <img
                src="/disconnect.png"
                alt="disconnect"
                className="w-6"
                style={{
                  filter:
                    "invert(86%) sepia(100%) saturate(0%) hue-rotate(184deg) brightness(109%) contrast(97%)",
                }}
              />
            </button>
          )}
        </div>
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
