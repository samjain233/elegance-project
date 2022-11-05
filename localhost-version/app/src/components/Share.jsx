import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { eleganceRequestRoute, mongoRequestRoute } from "../Routes";
import { videoRequestRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";

export default function Share({ isSharingMedia, isRecievingMedia, roomName, socket, hideShareButton, showShareButton }) {

    const [fileName, setFileName] = useState("");
    const [server, setServer] = useState("");
    const [currentServer, setCurrentServer] = useState("");
    const [triggerPlayerWindow, setTriggerPlayerWindow] = useState(false);

    //playing media in room
    const toRoomPlayer = async (name, server) => {
        setTriggerPlayerWindow(false);
        setServer(server);
        setFileName(name);
        if (server === "both") setCurrentServer(mongoRequestRoute);
        else if (server === "mongo") setCurrentServer(mongoRequestRoute);
        else if (server === "elegance") setCurrentServer(eleganceRequestRoute);
        const delay = await new Promise(res => setTimeout(res, 1000));
        if (isSharingMedia) {
            const payload = { name, server, roomName };
            socket.current.emit("media-send", payload);
        }
        setTriggerPlayerWindow(true);
    };

    //server change
    const serverChange = async (newServer) => {
        setTriggerPlayerWindow(false);
        if (newServer === "mongo") setCurrentServer(mongoRequestRoute);
        else if (newServer === "elegance") setCurrentServer(eleganceRequestRoute);
        const delay = await new Promise(res => setTimeout(res, 1000));
        if (isSharingMedia) {
            const name = fileName;
            const server = newServer;
            const payload = { name, server, roomName };
            socket.current.emit("media-send", payload);
        }
        setTriggerPlayerWindow(true);
    };

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
                    setFileName(payload.name);
                    if (payload.server === "both") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "mongo") setCurrentServer(mongoRequestRoute);
                    else if (payload.server === "elegance") setCurrentServer(eleganceRequestRoute);
                    const delay = await new Promise(res => setTimeout(res, 1000));
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
                    (isSharingMedia) ?
                        (<div id="primaryRoomScreen">
                            <div id="videoPlayerCover">
                                {
                                    (server === "both") ?
                                        (
                                            <div id="serverButtons">
                                                <p>Select Server:</p>
                                                <button onClick={() => { serverChange("elegance"); }}>Elegance</button>
                                                <button onClick={() => { serverChange("mongo"); }}>Mongo</button>
                                            </div>
                                        )
                                        :
                                        (<div>
                                            {
                                                (fileName) ?
                                                (`This Video is available in only ${server}`)
                                                :
                                                ("")
                                            }
                                        </div>)
                                }
                                <div id="videoPlayerDiv">
                                    {
                                        (triggerPlayerWindow) ?
                                            (<video id="videoPlayer" width="300" controls controlsList="noplaybackrate nodownload" muted autoPlay={true} onPause={() => pause()} onSeeking={() => changePosition()} onPlay={() => play()}>
                                                <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                            </video>)
                                            :
                                            (<div>Loading</div>)
                                    }
                                </div>
                            </div>
                            <div id="videos">
                                {
                                    videos.map((video) => {
                                        return (
                                            <div onClick={() => toRoomPlayer(video.name, video.server)} className="video" key={video._id}>
                                                <p>Title - {video.title}</p>
                                                <p>Description - {video.description}</p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            I</div>)
                        :
                        (<div id="videoPlayerCover">
                            {
                                (isRecievingMedia) ?
                                    (
                                        <div id="videoPlayerCover">
                                            <div id="videoPlayerDiv">
                                                {
                                                    (triggerPlayerWindow) ?
                                                        (<video id="videoPlayer" width="300" controlsList="noplaybackrate nodownload" muted autoPlay={true} onPause={() => pause()} onSeeking={() => changePosition()} onPlay={() => play()}>
                                                            <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                                        </video>)
                                                        :
                                                        (<div>Loading</div>)
                                                }
                                            </div>
                                        </div>
                                    )
                                    :
                                    (<div id="banner">Click Share to Start Sharing</div>)
                            }
                        </div>)
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