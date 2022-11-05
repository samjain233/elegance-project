import React from "react";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import Share from "../components/Share";

export default function Room({ divName, roomMembers, roomJoinedName, isRoomCreated, isSharingMedia, isRecievingMedia, doWait, inRoom, hideShareButton, showShareButton, socket }) {
    return (
        <RoomWindow>
            <div id={divName}>
                <div id="media">
                    <Share isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} roomName={roomJoinedName} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
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

`;