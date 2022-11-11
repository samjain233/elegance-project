import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { eleganceRequestRoute, mongoRequestRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";

export default function Player({ trigger, setTrigger, fileName, server, fileTitle, fileDescription }) {

    const [currentServer, setCurrentServer] = useState("");
    const [triggerPlayerWindow, setTriggerPlayerWindow] = useState(false);

    useEffect(() => {
        const defaultServer = async () => {
            if (trigger) {
                if (server === "both") setCurrentServer(mongoRequestRoute);
                else if (server === "mongo") setCurrentServer(mongoRequestRoute);
                else if (server === "elegance") setCurrentServer(eleganceRequestRoute);
                const delay = await new Promise(res => setTimeout(res, 0));
                setTriggerPlayerWindow(true);
            }
        }; defaultServer();
    }, [trigger]);


    const serverChange = async (newServer) => {
        setTriggerPlayerWindow(false);
        const delay = await new Promise(res => setTimeout(res, 0));
        if (newServer === "both") setCurrentServer(mongoRequestRoute);
        else if (newServer === "mongo") setCurrentServer(mongoRequestRoute);
        else if (newServer === "elegance") setCurrentServer(eleganceRequestRoute);
        setTriggerPlayerWindow(true);
    };


    return (
        <>
            {
                (trigger === true) ?
                    (<PlayerWindow>
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
                            <button className="actions" onClick={() => { setTrigger(false); setTriggerPlayerWindow(false); }}>Close</button>
                        </div>
                        <div className="playerBox">
                            <div className="player">
                                {
                                    (triggerPlayerWindow) ?
                                        (<video id="videoPlayer" controls controlsList="noplaybackrate nodownload" autoPlay={true}>
                                            <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                        </video>)
                                        :
                                        ("")
                                }
                            </div>
                            <p className="title">{fileTitle}</p>
                            <p className="description">{fileDescription}</p>
                        </div>
                    </PlayerWindow>)
                    :
                    ("")
            }
        </>
    )
}

// styling of components
const PlayerWindow = styled.div`
z-index: 2;
background-color: white;
height: 90vh;
width: 100vw;
position: fixed;
display: flex;
flex-direction: column;
.normalServerTag{
    background-color: white;
    border: none;
    margin-left: 100px;
    opacity: 1;
    font-size: 23px;
}
.actions{
    background-color: white;
    border: none;
    margin-left: 100px;
    opacity: 0.6;
    transition: 0.3s;
    font-size: 20px;
    cursor: pointer;
}
 .actions: hover {
    opacity: 1;
    color: black;
}
.topBanner{
    height: 10vh;
    display: flex;
    align-items: center;
    justify-content: space-around;
     .serverInformation{
        display: flex;
        align-items: center;
        .serverButtons{
            display: flex;
            align-items: center;
        }
    }
}
.playerBox{
    margin-left: 20px;
    height: 70vh;
    width: 50vw;
    overflow: hidden;
    .player{
        background-color: black;
        height: 55vh;
        display: flex;
        align-items: center;
        video{
            width: 50vw;
            max-height: 60vh;
        }
    }
    .title{
        padding-top: 10px;
        padding-left: 5px;
        font-size: 30px;
    }
     .description {
        padding-left: 5px;
        opacity: 0.7;
        font-size: 20px;
    }
}
`;