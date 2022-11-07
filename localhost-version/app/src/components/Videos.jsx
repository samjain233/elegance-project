import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Player from "../components/Player";
import { videoRequestRoute } from "../Routes";
import { ToastContainer, toast } from "react-toastify";
import { playlistUpdateRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";
import Share from "./Share";

export default function Videos({ setRoomPopupDiv, isSharingMedia, setRoomPlayerFileName, setRoomPlayerFileServer, setRoomPlayerFileTitle, setRoomPlayerFileDescription, playlistList, shareMedia, roomName, socket, hideShareButton, showShareButton }) {

    //checking key to access home page, otherwise redirect to login page
    // useEffect(() => { const homeNavigationCheck = async () => { if (!localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/login"); }; homeNavigationCheck(); }, []);


    const toastOptions = { position: "bottom-right", autoClose: 5000, pauseOnHover: true, draggable: true, theme: "light" };


    useEffect(() => {
        const getAllVideos = async () => {
            const { data } = await axios.get(videoRequestRoute);
            console.log(data);
            setVideos(data.videos);
        }; getAllVideos();
    }, []);


    const [videos, setVideos] = useState([]);
    const [playerPopup, setPlayerPopup] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileTitle, setFileTitle] = useState("");
    const [fileDescription, setFileDescription] = useState("");
    const [server, setServer] = useState("");
    const [showPlaylistAddPopup, setShowPlaylistAddPopup] = useState(false);
    const [videoToAdd, setVideoToAdd] = useState({});


    const toPlayer = async (name, server, title, description) => {
        setFileName(name);
        setServer(server);
        setFileTitle(title);
        setFileDescription(description);
        setPlayerPopup(true);
    };

    const playVideo = async (name, server, title, description) => {
        setPlayerPopup(false);
        const delay = await new Promise(res => setTimeout(res, 0));
        setServer("");
        setFileName("");
        setFileTitle("");
        setFileDescription("");
        toPlayer(name, server, title, description);
    };

    const addVideoToPlaylist = async (videoToAdd, playlistName) => {
        console.log(videoToAdd);
        console.log(playlistName);
        const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
        const username = localID.username;
        const { data } = await axios.post(playlistUpdateRoute, { videoToAdd, playlistName, username });
        if (data.status === false) { toast.error(data.msg, toastOptions) }
        else if (data.status === true) { toast.success(data.msg, toastOptions); }
    };



    const toRoomPlayerUpdate = (name, server, title, description) => {
        setRoomPlayerFileName(name);
        setRoomPlayerFileServer(server);
        setRoomPlayerFileTitle(title);
        setRoomPlayerFileDescription(description);
    }

    return (
        <Container>
            {
                (showPlaylistAddPopup) ?
                    (
                        <div className="playlistsList">
                            <div className="buttonDiv">
                                <button onClick={() => { setShowPlaylistAddPopup(false); }}>Hide</button>
                            </div>
                            <div className="playlists">
                                {
                                    playlistList.map((playlist) => {
                                        return (
                                            <div className="playlist" onClick={() => { addVideoToPlaylist(videoToAdd, playlist.playlistName); }} key={playlist._id}>
                                                <p className="playlistText" onClick={() => { addVideoToPlaylist(videoToAdd, playlist.playlistName); }}>{playlist.playlistName}</p>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                    :
                    ("")
            }

            {
                videos.map((video) => {
                    return (
                        <div className="video" key={video._id}>
                            <div id="videoInfo">
                                <p>{video.title}</p>
                                <p>{video.description}</p>
                            </div>
                            <div id="videoActions">
                                <p className="videoActions" onClick={() => playVideo(video.name, video.server, video.title, video.description)}>Play</p>
                                <p className="videoActions" onClick={() => console.log("upvote")}>Upvote</p>
                                <p className="videoActions" onClick={() => console.log("downvote")}>Downvote</p>
                                <p className="videoActions" onClick={() => { addVideoToPlaylist(video, "Favorites") }}>Add to favorite</p>
                                <p className="videoActions" onClick={() => { setShowPlaylistAddPopup(true); setVideoToAdd(video); }}>Add to playlist</p>
                                {
                                    (isSharingMedia) ?
                                        (<p className="videoActions" onClick={() => { setRoomPopupDiv("roomContainer"); setRoomPlayerFileName(video.name); setRoomPlayerFileServer(video.server); setRoomPlayerFileTitle(video.title); setRoomPlayerFileDescription(video.description); }}>In Room</p>) : ("")
                                }
                                <p>Uploaded by {video.owner}</p>
                            </div>
                        </div>
                    )
                })
            }
            <Player fileName={fileName} fileTitle={fileTitle} fileDescription={fileDescription} server={server} trigger={playerPopup} setTrigger={setPlayerPopup} />
        </Container >
    )
}

// styling of components
const Container = styled.div`
background-color: rgba(0, 0, 0, 0.2);
width: 100vw;
height: 90vh;
background-color: black;
overflow: auto;
color: black;
display: flex;
flex-direction: column;
 .video{
    background-color: white;
    margin: 5px;
 }
`;