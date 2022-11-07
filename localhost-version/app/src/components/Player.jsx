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
                                        (<video id="videoPlayer" controls controlsList="noplaybackrate nodownload" muted autoPlay={true}>
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
background-color: rgba(0, 0, 0, 0.7 );
height: 90vh;
width: 100vw;
position: fixed;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
 #serverButtons {
    color: white;
    background-color: blue;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    }
}
`;