import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Upload from "../components/Upload";
import Videos from "../components/Videos";
import Playlist from "../components/Playlist";
import axios from "axios";
import styled from "styled-components";
import Room from "../components/Room";
import { io } from "socket.io-client";
import { host } from "../Routes";
import cryptoRandomString from 'crypto-random-string';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { playlistRequestRoute, playlistDeleteRoute } from "../Routes";

export default function Home() {
  //checking key to access home page, otherwise redirect to login page
  useEffect(() => { const homeNavigationCheck = async () => { if (!localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/login"); }; homeNavigationCheck(); }, []);

  //variables
  const [values, setValues] = useState({ roomCreator: "" });
  const [panel, setPanel] = useState("videos");
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
          setRoomPlayerFileName("");
          setRoomPlayerFileTitle("");
          setRoomPlayerFileServer("");
          setRoomPlayerFileDescription("");
          setRoomPopupDiv("roomContainerHidden");
          setIsRecievingMedia(false);
          setIsSharingMedia(false);
          setInRoom(false);
          setRoomJoinedName("");
          setRoomMembers({ owner: [], visitors: [] });
        });
        socket.current.on("kick-request-accept", async (roomName) => {
          const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
          const payload = { roomName: roomName, username: localID.username }
          socket.current.emit("exit-room", payload);
          setRoomPlayerFileName("");
          setRoomPlayerFileTitle("");
          setRoomPlayerFileServer("");
          setRoomPlayerFileDescription("");
          setRoomPopupDiv("roomContainerHidden");
          setIsRecievingMedia(false);
          setIsSharingMedia(false);
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
    setRoomPlayerFileName("");
    setRoomPlayerFileTitle("");
    setRoomPlayerFileServer("");
    setRoomPlayerFileDescription("");
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
    setRoomPlayerFileName("");
    setRoomPlayerFileTitle("");
    setRoomPlayerFileServer("");
    setRoomPlayerFileDescription("");
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
    setRoomPlayerFileName("");
    setRoomPlayerFileTitle("");
    setRoomPlayerFileServer("");
    setRoomPlayerFileDescription("");
  };



  const [playlistList, setPlaylistList] = useState([]);


  useEffect(() => {
    const getAllPlaylist = async () => {
      console.log("playlistget");
      const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
      const username = localID.username;
      const { data } = await axios.post(playlistRequestRoute, { username });
      setPlaylistList(data.playlist);
    }; getAllPlaylist();
  }, []);


  const deletePlaylist = async (playlistName) => {
    const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
    const username = localID.username;
    const { data } = await axios.post(playlistDeleteRoute, { username, playlistName });
    if (data.status === true) {
      setPlaylistList(data.playlist);
      toast("Playlist Deleted");
    }
  };



  const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };

  const [roomPlayerFileName, setRoomPlayerFileName] = useState("");
  const [roomPlayerFileTitle, setRoomPlayerFileTitle] = useState("");
  const [roomPlayerFileDescription, setRoomPlayerFileDescription] = useState("");
  const [roomPlayerFileServer, setRoomPlayerFileServer] = useState("");


  return (
    <HomeContainer>
      <div id="header">
        <div id="elegance">Elegance</div>
        <div id="navigate">
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
                                <button className="button" onClick={() => { setIsSharingMedia(false); setRoomPlayerFileName(""); setRoomPlayerFileTitle(""); setRoomPlayerFileServer(""); setRoomPlayerFileDescription(""); }}><span className="text">Stop Sharing</span></button>
                              )
                              :
                              (
                                <button className="button" onClick={() => setIsSharingMedia(true)}><span className="text">Share</span></button>
                              )
                          }
                        </div>
                      )
                  }
                  {
                    (inRoom) ?
                      (<div>
                        {
                          (roomPopupDiv === "roomContainerHidden") ?
                            (
                              <button className="button" onClick={() => setRoomPopupDiv("roomContainer")}><span className="text">Open Room</span></button>
                            )
                            :
                            (
                              <button className="button" onClick={() => setRoomPopupDiv("roomContainerHidden")}><span className="text">Close Room</span></button>
                            )
                        }
                      </div>
                      )
                      :
                      ("")
                  }
                  {
                    (!isRoomCreated) ?
                      (
                        <button className="button" onClick={leaveRoom}><span className="text">Leave Room</span></button>
                      )
                      :
                      (
                        <button className="button" onClick={deleteRoom}><span className="text">Delete Room</span></button>
                      )
                  }
                </div>
              )
              :
              (
                <div id="notInRoom">
                  <input type="text" className="form__field" placeholder="Enter Room ID" name="roomCreator" onChange={(e) => handleChange(e)} />
                  <button className="button" onClick={joinRoom}><span className="text">Join Room</span></button>
                  <button className="button" onClick={createRoom}><span className="text">Create Room</span></button>
                </div>
              )
          }
          <button className="button"><span className="text">Profile</span></button>
          <button className="button" onClick={() => { setUploadPopup(true); console.log(roomPlayerFileName); }}><span className="text">Upload</span></button>
          <button className="button" onClick={() => setPanel("videos")}><span className="text">Videos</span></button>
          <button className="button" onClick={() => { setPanel("playlist"); }}><span className="text">Playlist</span></button>
        </div>
      </div>
      <Upload trigger={uploadPopup} setTrigger={setUploadPopup} />
      <Room setRoomMembers={setRoomMembers} roomPlayerFileName={roomPlayerFileName} roomPlayerFileServer={roomPlayerFileServer} roomPlayerFileTitle={roomPlayerFileTitle} roomPlayerFileDescription={roomPlayerFileDescription} divName={roomPopupDiv} roomMembers={roomMembers} roomJoinedName={roomJoinedName} isRoomCreated={isRoomCreated} isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} doWait={doWait} inRoom={inRoom} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
      <div id="body">
        {
          (panel === "videos") ?
            (
              <Videos setRoomPopupDiv={setRoomPopupDiv} setRoomPlayerFileName={setRoomPlayerFileName} setRoomPlayerFileServer={setRoomPlayerFileServer} setRoomPlayerFileTitle={setRoomPlayerFileTitle} setRoomPlayerFileDescription={setRoomPlayerFileDescription} playlistList={playlistList} isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} roomName={roomJoinedName} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
            )
            :
            (
              <Playlist deletePlaylist={deletePlaylist} setRoomPopupDiv={setRoomPopupDiv} setRoomPlayerFileName={setRoomPlayerFileName} setRoomPlayerFileServer={setRoomPlayerFileServer} setRoomPlayerFileTitle={setRoomPlayerFileTitle} setRoomPlayerFileDescription={setRoomPlayerFileDescription} isSharingMedia={isSharingMedia} playlistList={playlistList} setPlaylistList={setPlaylistList} />
            )
        }
      </div>
    </HomeContainer>
  )
}

//styling of home page
const HomeContainer = styled.div`
height: 100vh;
width: 100vw;

.button {
  appearance: none;
  background-color: #FFFFFF;
  border-width: 0;
  box-sizing: border-box;
  color: #000000;
  cursor: pointer;
  display: inline-block;
  font-family: Helvetica;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1em;
  margin: 0;
  opacity: 1;
  outline: 0;
  padding: 1.5em 2.2em;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-rendering: geometricprecision;
  text-transform: uppercase;
  transition: opacity 300ms cubic-bezier(.694, 0, 0.335, 1),background-color 100ms cubic-bezier(.694, 0, 0.335, 1),color 100ms cubic-bezier(.694, 0, 0.335, 1);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.button:before {
  animation: opacityFallbackOut .5s step-end forwards;
  backface-visibility: hidden;
  background-color: #EBEBEB;
  clip-path: polygon(-1% 0, 0 0, -25% 100%, -1% 100%);
  content: "";
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform: translateZ(0);
  transition: clip-path .5s cubic-bezier(.165, 0.84, 0.44, 1), -webkit-clip-path .5s cubic-bezier(.165, 0.84, 0.44, 1);
  width: 100%;
}

.button:hover:before {
  animation: opacityFallbackIn 0s step-start forwards;
  clip-path: polygon(0 0, 101% 0, 101% 101%, 0 101%);
}

.button:after {
  background-color: #FFFFFF;
}

.button span {
  z-index: 1;
  position: relative;
}

 #header{
  border-width: 2px;
  display: flex;
  width: 100vw;
  height: 10vh;
  border-bottom: 1px solid black;
  align-items: center;
  justify-content: space-between;
  background-color: white;
   #elegance{
    font-family: Helvetica;
    text-transform: uppercase;
    padding-left: 10px;
    font-size: 30px;
    height 10vh;
    display:flex;
    flex-direction: column;
    align-items: left;
    justify-content: center;
   }
   #navigate{
    height: 5vh;
    display: flex;
    align-items: center;
    justify-content: right;
     #notInRoom{
      height: 5vh;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .form__field{
        padding: 3px;
        width: 13rem;
        height: 2rem;
        opacity: 0.6;
        border-style: solid;
        border-color: black;
        border-width: 2px;
        border-radius: 9px;
        transition: 0.3s;
      }
      .form__field:hover {
        opacity: 1;
        border-style: solid;
        border-color: red;
        border-width: 2px;
      }
     }
     #inRoom{
      height: 5vh;
      display: flex;
      align-items: center;
      justify-content: space-between;
     }
    }
   }
 #body{
  background-color: white;
  width: 100vw;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
 }
`;