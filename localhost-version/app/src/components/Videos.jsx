import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Player from "../components/Player";
import { videoRequestRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";

export default function Videos({ shareMedia, roomName, socket, hideShareButton, showShareButton }) {

    //checking key to access home page, otherwise redirect to login page
    // useEffect(() => { const homeNavigationCheck = async () => { if (!localStorage.getItem(process.env.WEBSITE_LOCALHOST_KEY)) navigate("/login"); }; homeNavigationCheck(); }, []);

    useEffect(() => {
        const getAllVideos = async () => {
            const { data } = await axios.get(videoRequestRoute);
            setVideos(data.videos);
        }; getAllVideos();
    }, []);


    const [videos, setVideos] = useState([]);
    const [playerPopup, setPlayerPopup] = useState(false);
    const [fileName, setFileName] = useState("");
    const [server, setServer] = useState("");


    const toPlayer = async (name, server) => {
        setFileName(name);
        setServer(server);
        setPlayerPopup(true);
    };

    const playVideo = async (name, server) => {
        setPlayerPopup(false);
        const delay = await new Promise(res => setTimeout(res, 0));
        setServer("");
        toPlayer(name, server);
    };

    return (
        <>
            <Container>
                <Player fileName={fileName} server={server} trigger={playerPopup} setTrigger={setPlayerPopup} />
                <div id="videos">
                    {
                        videos.map((video) => {
                            return (
                                <div onClick={() => playVideo(video.name, video.server)} className="video" key={video._id}>
                                    {/* <button onClick={() => toRoomPlayer(video.name, video.server)}></button> */}
                                    <p>Title - {video.title}</p>
                                    <p>Description - {video.description}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </Container>
        </>
    )
}

// styling of components
const Container = styled.div`

`;