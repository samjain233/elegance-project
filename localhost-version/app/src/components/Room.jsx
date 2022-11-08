import React from "react";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import Share from "../components/Share";

export default function Room({ roomPlayerFileName, roomPlayerFileServer, roomPlayerFileTitle, roomPlayerFileDescription, divName, roomMembers, roomJoinedName, isRoomCreated, isSharingMedia, isRecievingMedia, doWait, inRoom, hideShareButton, showShareButton, socket }) {
    return (
        <RoomWindow>
            <div id={divName}>
                <div id="media">
                    <Share roomPlayerFileName={roomPlayerFileName} roomPlayerFileServer={roomPlayerFileServer} roomPlayerFileTitle={roomPlayerFileTitle} roomPlayerFileDescription={roomPlayerFileDescription} isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} roomName={roomJoinedName} roomMembers={roomMembers} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
                </div>
                <div id="roomInfo">
                    <button>Owner</button>
                    <button className="button">{roomMembers.owner}</button>
                    <button>Visitors</button>
                    {
                        roomMembers.visitors.map((visitor) => {
                            return (
                                <div key={visitor}>
                                    <button className="button">{visitor}</button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </RoomWindow>)

}

// styling of components
const RoomWindow = styled.div`
#roomContainerHidden{
    display: none !important;
}
#roomContainer{
    z-index: 1;
    background-color: white;
    height: 90vh;
    width: 100vw;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: auto;
    #roomInfo{
     display: flex;
     flex-direction: row;
     align-items: center;
     height: 10vh;
     width: 100vw;
     background-color: black;
     overflow-x: auto;
     button{
        width: 100px;
        height: 40px;
     }
     }
    #media{
     height: 80vh;
     width: 100vw;
     background-color: white;
     }
}
`;