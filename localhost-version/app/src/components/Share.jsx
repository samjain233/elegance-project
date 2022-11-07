import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { eleganceRequestRoute, mongoRequestRoute } from "../Routes";
import { videoRequestRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";
import Videos from "./Videos";

export default function Share({ roomPlayerFileName, roomPlayerFileServer, roomPlayerFileTitle, roomPlayerFileDescription, isSharingMedia, isRecievingMedia, roomMembers, roomName, socket, hideShareButton, showShareButton }) {

    const [fileName, setFileName] = useState("");
    const [fileTitle, setFileTitle] = useState("");
    const [fileDescription, setFileDescription] = useState("");
    const [server, setServer] = useState("");
    const [currentServer, setCurrentServer] = useState("");
    const [triggerPlayerWindow, setTriggerPlayerWindow] = useState(false);

    useEffect(() => {
        const roomMasterCommand = async () => {
            if (!roomPlayerFileName) {
                setFileName("");
                setServer("");
                setFileTitle("");
                setFileDescription("");
                setCurrentServer("");
            }
            if (roomPlayerFileName) toRoomPlayer(roomPlayerFileName, roomPlayerFileServer, roomPlayerFileTitle, roomPlayerFileDescription);
        }; roomMasterCommand();
    }, [roomPlayerFileName]);

    //playing media in room
    const toRoomPlayer = async (name, server, title, description) => {
        setTriggerPlayerWindow(false);
        setServer(server);
        setFileName(name);
        setFileTitle(title);
        setFileDescription(description);
        if (server === "both") setCurrentServer(mongoRequestRoute);
        else if (server === "mongo") setCurrentServer(mongoRequestRoute);
        else if (server === "elegance") setCurrentServer(eleganceRequestRoute);
        const delay = await new Promise(res => setTimeout(res, 0));
        if (isSharingMedia) {
            const payload = { name: name, server: server, roomName: roomName, title: title, description: description };
            socket.current.emit("media-send", payload);
        }
        setTriggerPlayerWindow(true);
    };


    //server change
    const serverChange = async (newServer) => {
        setTriggerPlayerWindow(false);
        if (newServer === "mongo") setCurrentServer(mongoRequestRoute);
        else if (newServer === "elegance") setCurrentServer(eleganceRequestRoute);
        const delay = await new Promise(res => setTimeout(res, 0));
        if (isSharingMedia) {
            const name = fileName;
            const title = fileTitle;
            const description = fileDescription;
            const server = newServer;
            const payload = { name: name, server: server, roomName: roomName, title: title, description: description };
            socket.current.emit("media-send", payload);
        }
        setTriggerPlayerWindow(true);
    };

    useEffect(() => {
        const startSharing = async () => {
            if (isSharingMedia && fileName) {
                const video = document.getElementById("videoPlayer");
                const payload = { roomName: roomName, name: fileName, title: fileTitle, description: fileDescription, server: server, position: video.currentTime, isVideoPaused: video.paused };
                console.log(payload);
                socket.current.emit("media-master-action-command", payload);
            }
        }; startSharing();
    }, [roomMembers]);

    //socket io media handlers
    useEffect(() => {
        const startSharing = async () => {
            const payload = { roomName };
            if (isSharingMedia) {
                socket.current.emit("media-master-command", payload);
            };
        }; startSharing();
    }, [isSharingMedia]);

    useEffect(() => {
        const killActiveSharing = async () => {
            const payload = { roomName };
            if (roomName && !isSharingMedia) {
                socket.current.emit("kill-active-sharing", payload);
                setTriggerPlayerWindow(false);
            }
        }; killActiveSharing();
    }, [isSharingMedia]);


    useEffect(() => {
        const recieveMedia = async () => {
            if (roomName) {
                socket.current.on("master-reciever", async () => {
                    console.log("successfully recieving");
                    hideShareButton();
                });
                socket.current.on("master-reciever-action", async (payload) => {
                    setFileTitle(payload.title);
                    setFileDescription(payload.description);
                    setFileName(payload.name);
                    setTriggerPlayerWindow(false);
                    hideShareButton();
                    if (payload.server === "both") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "mongo") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "elegance") setCurrentServer(eleganceRequestRoute);
                    setTriggerPlayerWindow(true);
                    const delay = await new Promise(res => setTimeout(res, 0));
                    const video = document.getElementById("videoPlayer");
                    video.currentTime = payload.position;
                    if (payload.isVideoPaused) video.pause();
                });
            }
        }; recieveMedia();
    }, [roomName]);



    const changePosition = () => {
        if (isSharingMedia) {
            const video = document.getElementById("videoPlayer");
            const payload = { roomName: roomName, newPosition: video.currentTime };
            socket.current.emit("change-position", payload);
        }
    };

    const pause = () => {
        if (isSharingMedia) {
            const payload = { roomName: roomName };
            socket.current.emit("pause", payload);
        }
    };

    const play = () => {
        if (isSharingMedia) {
            const payload = { roomName: roomName };
            socket.current.emit("play", payload);
        }
    };

    useEffect(() => {
        const recieveMedia = async () => {
            if (isRecievingMedia) {
                socket.current.on("media-recieve", async (payload) => {
                    setTriggerPlayerWindow(false);
                    setFileTitle(payload.title);
                    setFileDescription(payload.description);
                    setFileName(payload.name);
                    if (payload.server === "both") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "mongo") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "elegance") setCurrentServer(eleganceRequestRoute);
                    const delay = await new Promise(res => setTimeout(res, 0));
                    setTriggerPlayerWindow(true);
                });
                socket.current.on("apply-new-position-request", async (newPosition) => {
                    const video = document.getElementById("videoPlayer");
                    video.currentTime = newPosition;
                });
                socket.current.on("pause-request", async () => {
                    const video = document.getElementById("videoPlayer");
                    video.pause();
                });
                socket.current.on("play-request", async () => {
                    const video = document.getElementById("videoPlayer");
                    video.play();
                });
                socket.current.on("kill-active-recieving", async () => {
                    setTriggerPlayerWindow(false);
                    setFileName("");
                    setCurrentServer("");
                    setServer("");
                    setFileTitle("");
                    setFileDescription("");
                    showShareButton();
                    console.log("killed");
                });
            }
        }; recieveMedia();
    }, [isRecievingMedia]);


    useEffect(() => {
        const getAllVideos = async () => {
            const { data } = await axios.get(videoRequestRoute);
            setVideos(data.videos);
        }; getAllVideos();
    }, []);


    const [videos, setVideos] = useState([]);

    return (
        <>
            <Container>
                {
                    (fileName) ?
                        (<div>
                            {
                                (isSharingMedia) ?
                                    (<div id="primaryRoomScreen">
                                        <div className="topBanner">
                                            <div className="serverInformation">
                                                {
                                                    (server === "both") ?
                                                        (
                                                            <div className="serverButtons">
                                                                <p className="normalServerTag">Change Server: </p>
                                                                <button className="actions" onClick={() => { serverChange("elegance"); }}>Elegance</button>
                                                                <button className="actions" onClick={() => { serverChange("mongo"); }}>Mongo</button>
                                                            </div>
                                                        )
                                                        :
                                                        (<div className="normalServerTag">This video is available in {server} server only.</div>)
                                                }
                                            </div>
                                        </div>
                                        <div className="playerBox">
                                            <div className="player">
                                                {
                                                    (triggerPlayerWindow) ?
                                                        (<video id="videoPlayer" width="300" controls controlsList="noplaybackrate nodownload" autoPlay={true} onPause={() => pause()} onSeeking={() => changePosition()} onPlay={() => play()}>
                                                            <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                                        </video>)
                                                        :
                                                        ("")
                                                }
                                            </div>
                                            <p className="title">{fileTitle}</p>
                                            <p className="description">{fileDescription}</p>
                                        </div>
                                    </div>
                                    )
                                    :
                                    (<div id="videoPlayerCover">
                                        {
                                            (isRecievingMedia) ?
                                                (
                                                    <div className="playerBox">
                                                        <div className="player">
                                                            {
                                                                (triggerPlayerWindow) ?
                                                                    (<video id="videoPlayer" width="300" controlsList="noplaybackrate nodownload" autoPlay={true} onPause={() => pause()} onSeeking={() => changePosition()} onPlay={() => play()}>
                                                                        <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                                                    </video>)
                                                                    :
                                                                    ("")
                                                            }
                                                        </div>
                                                        <div className="recieverMeta">
                                                            <div>
                                                                <p className="title">{fileTitle}</p>
                                                                <p className="description">{fileDescription}</p>
                                                            </div>
                                                            <button className="actions" onClick={() => { document.getElementById("videoPlayer").muted = !(document.getElementById("videoPlayer").muted); }}>Mute</button>
                                                        </div>
                                                    </div>
                                                )
                                                :
                                                (<div id="banner">Click Share to Start Sharing</div>)
                                        }
                                    </div>)
                            }
                        </div>
                        )
                        :
                        (
                            "Share with Friends"
                        )
                }
            </Container>
        </>
    )
}

// styling of components
const Container = styled.div`
height: 80vh;
background-color: rgba(300, 300, 300, 0.2);
display: flex;
justify-content: center;
align-items: center;
color: black;
 #primaryRoomScreen{
  height: 80vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
   #videoPlayerCover{
    color: white;
    width: 30vw;
    height: 30vh;
    background-color: brown;
    display: flex;
    flex-direction: column;
    justify content: center;
    align items: center;
    margin: auto;
     #serverButtons{
      display: flex;
      flex-direction: rows;
      justify content: center;
      align items: center;
     }
    }
   #videoPlayerDiv{
    display: flex;
    justify content: center;
    align items: center;
    margin:auto;
    }
   #videos{
    background-color: brown;
    width: 50vw;
    height: 80vh;
    overflow: auto;
    }
   .video{
    background-color: white;
    margin: 5px;
    }
 }
`;  