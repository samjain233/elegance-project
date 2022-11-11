import React from "react";
import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import Share from "../components/Share";
import { ToastContainer, toast } from "react-toastify";

export default function Room({ setRoomMembers, roomPlayerFileName, roomPlayerFileServer, roomPlayerFileTitle, roomPlayerFileDescription, divName, roomMembers, roomJoinedName, isRoomCreated, isSharingMedia, isRecievingMedia, doWait, inRoom, hideShareButton, showShareButton, socket }) {

    const roomAdminAction = (visitor) => {
        if (isRoomCreated) {
            console.log(visitor);
            toast(
                <div>
                    Actions: {visitor}
                    <button onClick={() => {
                        const payload = { roomName: roomJoinedName, username: visitor };
                        socket.current.emit("kick-request", payload);
                        const roomVisitors = roomMembers.visitors;
                        const newRoomVisitors = roomVisitors.filter(e => e !== visitor);
                        setRoomMembers({ owner: [roomMembers.owner[0]], visitors: newRoomVisitors });
                    }
                    }>Kick</button>
                    <button onClick={() => {
                        const payload = { roomName: roomJoinedName, username: visitor };
                        socket.current.emit("ban-request", payload);
                        const roomVisitors = roomMembers.visitors;
                        const newRoomVisitors = roomVisitors.filter(e => e !== visitor);
                        setRoomMembers({ owner: [roomMembers.owner[0]], visitors: newRoomVisitors });
                    }}>Ban</button>
                </div>
            );
        }
    }
    return (
        <RoomWindow>
            <div id={divName}>
                <div id="media">
                    <Share roomPlayerFileName={roomPlayerFileName} roomPlayerFileServer={roomPlayerFileServer} roomPlayerFileTitle={roomPlayerFileTitle} roomPlayerFileDescription={roomPlayerFileDescription} isSharingMedia={isSharingMedia} isRecievingMedia={isRecievingMedia} roomName={roomJoinedName} roomMembers={roomMembers} hideShareButton={hideShareButton} showShareButton={showShareButton} socket={socket} />
                </div>
                <div id="roomInfo">
                    <button className="buttonNoAction"><span className="text">{roomMembers.owner}</span></button>
                    {
                        roomMembers.visitors.map((visitor) => {
                            return (
                                <div key={visitor}>
                                    <button onClick={() => roomAdminAction(visitor)} className={`${isRoomCreated ? "buttonsAction" : "buttonNoAction"}`}><span className="text">{visitor}</span></button>
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
     background-color: white;
     overflow-x: auto;
    }
    #media{
     height: 80vh;
     width: 100vw;
     background-color: white;
    }
}
.buttonNoAction {
    appearance: none;
    background-color: #FFFFFF;
    border-width: 0;
    box-sizing: border-box;
    color: #000000;
    display: inline-block;
    font-family: Helvetica;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1em;
    margin: 0;
    opacity: 1;
    outline: 0;
    padding: 1.5em 2.2em;
    position: relative;
    text-align: center;
    text-decoration: none;
    text-rendering: geometricprecision;
    text-transform: uppercase;
    transition: opacity 300ms cubic-bezier(.694, 0, 0.335, 1),background-color 100ms cubic-bezier(.694, 0, 0.335, 1),color 100ms cubic-bezier(.694, 0, 0.335, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: baseline;
    white-space: nowrap;
}

.buttonsAction {
    appearance: none;
    background-color: #FFFFFF;
    border-width: 0;
    box-sizing: border-box;
    color: #000000;
    cursor: pointer;
    display: inline-block;
    font-family: Helvetica;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 1em;
    margin: 0;
    opacity: 1;
    outline: 0;
    padding: 1.5em 2.2em;
    position: relative;
    text-align: center;
    text-decoration: none;
    text-rendering: geometricprecision;
    text-transform: uppercase;
    transition: opacity 300ms cubic-bezier(.694, 0, 0.335, 1),background-color 100ms cubic-bezier(.694, 0, 0.335, 1),color 100ms cubic-bezier(.694, 0, 0.335, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: baseline;
    white-space: nowrap;
}

.buttonsAction:before {
    animation: opacityFallbackOut .5s step-end forwards;
    backface-visibility: hidden;
    background-color: #EBEBEB;
    clip-path: polygon(-1% 0, 0 0, -25% 100%, -1% 100%);
    content: "";
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: translateZ(0);
    transition: clip-path .5s cubic-bezier(.165, 0.84, 0.44, 1), -webkit-clip-path .5s cubic-bezier(.165, 0.84, 0.44, 1);
    width: 100%;
}
  
.buttonsAction:hover:before {
    animation: opacityFallbackIn 0s step-start forwards;
    clip-path: polygon(0 0, 101% 0, 101% 101%, 0 101%);
}
  
.buttonsAction:after {
    background-color: #FFFFFF;
}
  
.buttonsAction span {
    z-index: 1;
    position: relative;
}
`;