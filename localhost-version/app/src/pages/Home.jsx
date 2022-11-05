import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Upload from "../components/Upload";
import Videos from "../components/Videos";
import styled from "styled-components";
import Room from "../components/Room";
import { io } from "socket.io-client";
import { host } from "../Routes";
import cryptoRandomString from 'crypto-random-string';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  //checking key to access home page, otherwise redirect to login page
  useEffect(() => { const homeNavigationCheck = async () => { if (!localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/login"); }; homeNavigationCheck(); }, []);

  //variables
  const [values, setValues] = useState({ roomCreator: "" });
  const [uploadPopup, setUploadPopup] = useState(false);
  const [roomPopupDiv, setRoomPopupDiv] = useState("roomContainerHidden");
  const [roomJoinedName, setRoomJoinedName] = useState("");
  const [isRoomCreated, setIsRoomCreated] = useState(false);
  const [isSharingMedia, setIsSharingMedia] = useState(false);
  const [isRecievingMedia, setIsRecievingMedia] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [doWait, setDoWait] = useState(false);
  const [roomMembers, setRoomMembers] = useState({ owner: [], visitors: [] });
  const navigate = useNavigate();
  const socket = useRef();

  //create room function
  const createRoom = async () => {
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const roomName = cryptoRandomString({ length: 10, type: 'base64' });
    console.log(roomName);
    const payload = { roomName: roomName, username: localID.username };
    socket.current = io(host);
    socket.current.emit("join-server", localID.username);
    socket.current.emit("create-room", payload);
    setRoomJoinedName(payload.roomName);
    setRoomMembers({ owner: [localID.username], visitors: [] });
    setIsRoomCreated(true);
    setInRoom(true);
  };

  //to accpet join request
  useEffect(() => {
    const joinRequest = async () => {
      if (isRoomCreated) {
        socket.current.on("recieve-join-request", async (username) => {
          toast(
            <div>
              Incoming Request: {username};
              <button onClick={() => {
                const payload = { roomName: roomJoinedName, username: username }
                socket.current.emit("approve-join-request", payload);
              }
              }>Accept</button>
              <button onClick={() => {
                const payload = { roomName: roomJoinedName, username: username }
                socket.current.emit("reject-join-request", payload);
              }}>Reject</button>
            </div>
          );
        });
      }
    }; joinRequest();
  }, [isRoomCreated]);

  //room updates
  useEffect(() => {
    const roomUpdate = async () => {
      if (inRoom) {
        const payload = roomJoinedName;
        socket.current.emit("room-update-request", payload);
        socket.current.on("room-update", async (data) => {
          if (data !== null) setRoomMembers(data);
        });
        socket.current.on("exit-room-request", async (roomName) => {
          const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
          const payload = { roomName: roomName, username: localID.username }
          socket.current.emit("exit-room", payload);
          setInRoom(false);
          setRoomJoinedName("");
          setRoomMembers({ owner: [], visitors: [] });
        });
      }
    }; roomUpdate();
  }, [inRoom]);

  //join room function
  const joinRoom = async () => {
    const { roomCreator } = values;
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const payload = { roomName: roomCreator, username: localID.username }
    socket.current = io(host);
    socket.current.emit("join-server", localID.username);
    socket.current.emit("send-join-request", payload);
    setDoWait(true);
  };

  //room approval waiting
  useEffect(() => {
    const roomApprovalWaiting = async () => {
      if (doWait) {
        let isResponded = 0;
        socket.current.on("approved", async (roomName) => {
          const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
          const payload = { roomName: roomName, username: localID.username }
          socket.current.emit("join-room", payload);
          isResponded = 1;
          setInRoom(true);
          setDoWait(false);
          setRoomJoinedName(roomName);
          toast("Room Joined");
        });
        socket.current.on("rejected", async () => {
          socket.current.emit("disconnect-request");
          isResponded = 1;
          toast("Request Rejected");
          setDoWait(false);
        });
        await new Promise(res => setTimeout(res, 6000));
        if (!isResponded) {
          socket.current.emit("disconnect-request");
          toast("Request Rejected");
          setDoWait(false);
        }
      }
    }; roomApprovalWaiting();
  }, [doWait]);


  //leave room function
  const leaveRoom = async () => {
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const payload = { roomName: roomJoinedName, username: localID.username }
    socket.current.emit("leave-room", payload);
    setRoomPopupDiv("roomContainerHidden");
    setIsRecievingMedia(false);
    setIsSharingMedia(false);
    setInRoom(false);
    setRoomJoinedName("");
    setIsRoomCreated(false);
    setRoomMembers({ owner: [], visitors: [] });
  };

  //delete room function
  const deleteRoom = async () => {
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const payload = { roomName: roomJoinedName, username: localID.username }
    socket.current.emit("delete-room", payload);
    setRoomPopupDiv("roomContainerHidden");
    setIsRecievingMedia(false);
    setIsSharingMedia(false);
    setInRoom(false);
    setRoomJoinedName("");
    setIsRoomCreated(false);
    setRoomMembers({ owner: [], visitors: [] });
  };

  const hideShareButton = () => {
    setIsRecievingMedia(true);
  };
  const showShareButton = () => {
    setIsRecievingMedia(false);
  };

  const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };

  return (
    <HomeContainer>
      <div id="header">
        <div id="navigate">
          <button>Profile</button>
          {
            (inRoom) ?
              (<div>
                {
                  (roomPopupDiv === "roomContainerHidden") ?
                    (
                      <button onClick={() => setRoomPopupDiv("roomContainer")}>Open Room</button>
                    )
                    :
                    (
                      <button onClick={() => setRoomPopupDiv("roomContainerHidden")}>Close Room</button>
                    )
                }
              </div>
              )
              :
              ("")  
          }
          <button onClick={() => setUploadPopup(true)}>Upload</button>
          {
            (inRoom) ?
              (
                <div id="inRoom">
                  {
                    (isRecievingMedia) ?
                      ("")
                      :
                      (
                        <div>
                          {
                            (isSharingMedia) ?
                              (
                                <button onClick={() => setIsSharingMedia(false)}>Stop Sharing</button>
                              )
                              :
                              (
                                <button onClick={() => setIsSharingMedia(true)}>Share</button>
                              )
                          }
                        </div>
                      )
                  }
                  {
                    (!isRoomCreated) ?
                      (
                        <button onClick={leaveRoom}>Leave Room</button>
                      )
                      :
                      (
                        ""
                      )
                  }
                  {
                    (isRoomCreated) ?
                      (
                        <button onClick={deleteRoom}>Delete Room</button>
                      )
                      :
                      (
                        ""
                      )
                  }
                </div>
              )
              :
              (
                <div id="notInRoom">
                  <button onClick={createRoom}>Create Room</button>
                  <input type="text" placeholder="Enter Room ID" name="roomCreator" onChange={(e) => handleChange(e)} />
                  <button onClick={joinRoom}>Join Room</button>
                </div>
              )
          }
        </div>
      </div>
      <Upload trigger={uploadPopup} setTrigger={setUploadPopup} />
      <Room divName={roomPopupDiv} roomMembers={roomMembers} roomJoinedName={roomJoinedName} isRoomCreated={isRoomCreated} isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} doWait={doWait} inRoom={inRoom} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
      <div id="body">
          <Videos isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} roomName={roomJoinedName} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
      </div>
    </HomeContainer>
  )
}

//styling of home page
const HomeContainer = styled.div`
height: 100vh;
width: 100vw;
background-color: pink;
 #header{
  display: flex;
  width: 100vw;
  height: 10vh;
  align-items: center;
  justify-content: right;
  background-color: black;
   #navigate{
    width: 50vw;
    height: 5vh;
    display: flex;
    align-items: center;
    justify-content: space-around;
     #notInRoom{
      width: 25vw;
      height: 5vh;
      display: flex;
      align-items: center;
      justify-content: space-around;
     }
     #inRoom{
      width: 25vw;
      height: 5vh;
      display: flex;
      align-items: center;
      justify-content: space-around;
     }
    }
   }
 #body{
  display: flex;
  width: 100vw;
  height: 90vh;
  margin: auto;
  align-items: flex-end;
  justify-content: center;
 }
`;