import React from "react";
import { useState } from "react";
import axios from "axios";
import Player from "../components/Player";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { playlistSaveRoute } from "../Routes";
import { playlistVideosRoute } from "../Routes";
import { v4 as uuidv4 } from "uuid";

export default function Playlist({ deletePlaylist, setRoomPopupDiv, isSharingMedia, setRoomPlayerFileName, setRoomPlayerFileServer, setRoomPlayerFileTitle, setRoomPlayerFileDescription, playlistList, setPlaylistList }) {

    const toastOptions = { position: "bottom-right", autoClose: 5000, pauseOnHover: true, draggable: true, theme: "light" };
    const [playlistVideos, setPlaylistVideos] = useState([]);
    const [currentSelectedPlaylist, setCurrentSelectedPlaylist] = useState("");
    const [showPlaylistVideosPopup, setShowPlaylistVideosPopup] = useState(false);
    const [values, setValues] = useState({ playlistName: "" });
    const [playerPopup, setPlayerPopup] = useState(false);
    const [fileName, setFileName] = useState("");
    const [server, setServer] = useState("");
    const [fileTitle, setFileTitle] = useState("");
    const [fileDescription, setFileDescription] = useState("");

    const handleChange = (event) => { setValues({ ...values, [event.target.name]: event.target.value }) };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const { playlistName } = values;
            const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
            const username = localID.username;
            const { data } = await axios.post(playlistSaveRoute, { playlistName, username });
            if (data.status === false) { toast.error(data.msg, toastOptions) }
            else if (data.status === true) { toast.success(data.msg, toastOptions); setPlaylistList((prev) => [...prev, data.playlist]); console.log(playlistList); }
        };
    };

    const handleValidation = () => {
        const { playlistName } = values;
        if (playlistName.length < 3) { toast.error("Playlist name must be greater than 3", toastOptions); return false; }
        return true;
    };

    const getPlaylistVideos = async (playlistName) => {
        setCurrentSelectedPlaylist(playlistName);
        const localID = await JSON.parse(localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY));
        const username = localID.username;
        const { data } = await axios.post(playlistVideosRoute, { playlistName, username });
        setPlaylistVideos(data.playlistVideos);
        if (data.playlistVideos.length === 0) toast.error("No Videos Available", toastOptions);
        else setShowPlaylistVideosPopup(true);

    }

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

    return (
        <Container>
            <Player fileName={fileName} fileTitle={fileTitle} fileDescription={fileDescription} server={server} trigger={playerPopup} setTrigger={setPlayerPopup} />
            {
                (showPlaylistVideosPopup) ?
                    (
                        <div className="playlistVideosBox">
                            <div className="backButton">
                                <button className="title">{currentSelectedPlaylist}</button>
                                <button className="back" onClick={() => { setShowPlaylistVideosPopup(false); setPlaylistVideos([]); }}>Back</button>
                            </div>
                            {
                                <div className="playlistVideos">
                                    {
                                        playlistVideos.map((playlistVideo) => {
                                            return (
                                                <div className="playlistVideo" key={uuidv4()}>
                                                    <p className="text">{playlistVideo.title}</p>
                                                    <p className="actions" onClick={() => { setShowPlaylistVideosPopup(false); playVideo(playlistVideo.name, playlistVideo.server, playlistVideo.title, playlistVideo.description) }}>Play</p>
                                                    {
                                                        (isSharingMedia) ?
                                                            (<p className="actions" onClick={() => { setShowPlaylistVideosPopup(false); setRoomPlayerFileName(playlistVideo.name); setRoomPlayerFileServer(playlistVideo.server); setRoomPlayerFileTitle(playlistVideo.title); setRoomPlayerFileDescription(playlistVideo.description); setRoomPopupDiv("roomContainer"); }}>In Room</p>) : ("")
                                                    }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            }
                        </div>
                    )
                    :
                    ("")
            }
            <form onSubmit={(event) => handleSubmit(event)}>
                <input type="text" placeholder="Enter playlist name" name="playlistName" onChange={(e) => handleChange(e)} min="3" />
                <button type="submit">New Playlist</button>
            </form>
            <div className="playlistList">
                {
                    (playlistList.length) ?
                        <div className="playlistListBox">
                            {
                                (
                                    playlistList.map((playlist) => {
                                        return (
                                            <div className="playlist" key={playlist._id}>
                                                <p className="playlistActions" onClick={() => getPlaylistVideos(playlist.playlistName)}>{playlist.playlistName}</p>
                                                {
                                                    (playlist.playlistName === "Favorites") ?
                                                        (<p className="playlistActions" onClick={() => getPlaylistVideos(playlist.playlistName)}>Open</p>)
                                                        :
                                                        (<p className="playlistActions" onClick={() => deletePlaylist(playlist.playlistName)}>Delete</p>)
                                                }
                                            </div>
                                        )
                                    })
                                )
                            }
                        </div>
                        :
                        (<div className="noPlaylistAvailable">Add some playlist to show here.</div>)
                }
            </div>
        </Container >
    )
}

const Container = styled.div`
background-color: white;
width: 100vw;
height: 90vh;
color: black;
.text{
    width: 200px;
    white-space: nowrap;
    overflow:hidden;
}
 .playlistVideosBox{
    display: flex;
    flex-direction: column;
    height: 90vh;
    position: fixed;
    width: 100vw;
    background-color: white;
    z-index: 1;
     .backButton{
        height: 17vh;
        display: flex;
        flex-direction: row;
        justify-content: center;
        algin-items: center;
         .back{
            background-color: white;
            border: none;
            margin-left: 100px;
            opacity: 0.6;
            transition: 0.3s;
            font-size: 23px;
            cursor: pointer;
        }
         .back: hover {
            opacity: 1;
            color: black;
        }
        .title{
            background-color: white;
            border: none;
            margin-left: 100px;
            opacity: 1;
            font-size: 30px;
        }
     }
     .playlistVideos{
        overflow-y: scroll;
        overflow-x: hidden;
        &::-webkit-scrollbar {
            background-color: black;
            width: 0.2rem;
            &-thumb {
              background-color: white;
              width: 0.1rem;
              border-radius: 1rem;
            }
          }
        .playlistVideo{
            height: 7vh;
            padding: 10px;
            font-size: 17px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            .actions{
                opacity: 0.6;
                transition: 0.3s;
                cursor: pointer;
            }
            .actions: hover{
                opacity: 1;
            }
        }
     }
    }
 form{
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: center;
     button{
        background-color: white;
        border: none;
        margin-left: 100px;
        opacity: 0.6;
        transition: 0.3s;
        font-size: 25px;
     }
     button: hover{
        cursor: pointer;
        opacity: 1;
     }
     input{
        padding: 10px;
        width: 17rem;
        height: 2.5rem;
        opacity: 0.6;
        border-style: solid;
        border-color: black;
        border-width: 2px;
        border-radius: 9px;
        transition: 0.3s;
     }
     input: hover{
        opacity: 1;
        border-style: solid;
        border-color: red;
        border-width: 2px;
     }
    }
 .playlistList{
    display: flex;
    flex-direction: column;
    .noPlaylistAvailable{
        height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
    }
    .playlistListBox{
        height: 80vh;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        overflow-x: hidden;
        &::-webkit-scrollbar {
            background-color: black;
            width: 0.2rem;
            &-thumb {
              background-color: white;
              width: 0.1rem;
              border-radius: 1rem;
            }
          }
        .playlist{
            font-size: 17px;
            padding-left: 300px;
            padding-top: 10px;
            padding-right: 300px;
            padding-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .playlistActions{
                cursor: pointer;
                opacity: 0.7;
                transition: 0.3s;
            }
            .playlistActions: hover{
                opacity: 1;
            }
        }
    }
 }
`;