import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { eleganceRequestRoute, mongoRequestRoute } from "../Routes";
import "react-toastify/dist/ReactToastify.css";

export default function Player({ trigger, setTrigger, fileName, server }) {

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
                console.log("gadga");
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
                        <div id="serverButtons">
                            {
                                (server === "both") ?
                                    (
                                        <div>
                                            <div onClick={() => { serverChange("elegance"); }}>Elegance</div>
                                            <div onClick={() => { serverChange("mongo"); }}>Mongo</div>
                                        </div>
                                    )
                                    :
                                    (<div>This Video is available in only {server}</div>)
                            }
                        </div>
                        <div>
                            {
                                (triggerPlayerWindow) ?
                                    (<video id="videoPlayer" width="300" controls controlsList="noplaybackrate nodownload" muted autoPlay={true}>
                                        <source src={`${currentServer}` + `${fileName}`} type="video/mp4" />
                                    </video>)
                                    :
                                    (<div>Loading</div>)
                            }
                        </div>
                        <button onClick={() => { setTrigger(false); setTriggerPlayerWindow(false); }}>Close</button>
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