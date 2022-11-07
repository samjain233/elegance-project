const cors = require("cors");
const express = require("express");
const fileUpload = require("express-fileupload");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const app = express();
const socket = require("socket.io");

//routes
app.use(fileUpload());
require("dotenv").config();
app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);
app.use("/api/auth", mediaRoutes);


const server = app.listen(process.env.PORT, () => { console.log(`server started on port ${process.env.PORT}`); });


const io = socket(server, { cors: { origin: "http://localhost:3000", credentials: true } });

//socket io part

//all rooms list
let rooms = {};

// all users socked id array
let users = [];

// all rooms list by username
let roomsByUsername = {};

// all users array mappped to socket id
global.onlineUsers = new Map();

//master socket io connection
io.on("connection", (socket) => {

    global.chatSocket = socket;

    //when user join the server
    socket.on("join-server", (username) => {
        users[socket.id] = username;
        onlineUsers.set(username, socket.id);
    });

    //when user create room
    socket.on("create-room", async (payload) => {
        await socket.join(payload.roomName);
        if (roomsByUsername[payload.username]) roomsByUsername[payload.username].activeRooms.push(payload.roomName);
        else roomsByUsername[payload.username] = { username: payload.username, activeRooms: [payload.roomName] };
        rooms[payload.roomName] = { owner: [payload.username], visitors: [] };
        socket.to(payload.roomName).emit("room-update", rooms[payload.roomName]);
    });

    //when user send request
    socket.on("send-join-request", async (payload) => {
        if (rooms[payload.roomName]) {
            socket.to(onlineUsers.get(rooms[payload.roomName].owner[0])).emit("recieve-join-request", payload.username);
        }
    });

    //when user approve request
    socket.on("approve-join-request", (payload) => {
        if (rooms[payload.roomName]) {
            socket.to(onlineUsers.get(payload.username)).emit("approved", payload.roomName);
        }
    });

    //when user reject request
    socket.on("reject-join-request", (payload) => {
        if (rooms[payload.roomName]) {
            socket.to(onlineUsers.get(payload.username)).emit("rejected");
        }
    });

    //when user join a room
    socket.on("join-room", (payload) => {
        if (rooms[payload.roomName]) {
            socket.join(payload.roomName);
            if (roomsByUsername[payload.username]) roomsByUsername[payload.username].activeRooms.push(payload.roomName);
            else roomsByUsername[payload.username] = { username: payload.username, activeRooms: [payload.roomName] };
            rooms[payload.roomName].visitors.push(payload.username);
            socket.to(payload.roomName).emit("room-update", rooms[payload.roomName]);
        }
    });

    //when a new user join, a update is sent to all
    socket.on("room-update-request", (payload) => {
        socket.emit("room-update", rooms[payload]);
    });

    //when a user leave a room
    socket.on("leave-room", async (payload) => {
        if (rooms[payload.roomName]) {
            socket.leave(payload.roomName);
            delete roomsByUsername[payload.username];
            rooms[payload.roomName].visitors = rooms[payload.roomName].visitors.filter((e) => e !== payload.username);
            socket.to(payload.roomName).emit("room-update", rooms[payload.roomName]);
            if (!rooms[payload.roomName].visitors.length && !roomsByUsername[rooms[payload.roomName].owner[0]]) delete rooms[payload.roomName];
        }
        socket.disconnect(true);
        delete users[socket.id];
        onlineUsers.delete(payload.username);
    });

    //when a user delete a room
    socket.on("delete-room", (payload) => {
        if (rooms[payload.roomName]) {
            socket.to(payload.roomName).emit("exit-room-request", payload.roomName);
            delete roomsByUsername[payload.username];
            delete rooms[payload.roomName];
            socket.leave(payload.roomName);
            socket.disconnect(true);
            delete users[socket.id];
            onlineUsers.delete(payload.username);
        }
    });

    //when a user delete a rooms, all member of room will follow this command
    socket.on("exit-room", (payload) => {
        socket.leave(payload.roomName);
        delete roomsByUsername[payload.username];
        socket.disconnect(true);
        delete users[socket.id];
        onlineUsers.delete(payload.username);
    });

    //disconnect request from user
    socket.on("disconnect-request", () => {
        socket.disconnect(true);
        delete users[socket.id];
    });

    //room media part

    //master command to share or recieve media
    socket.on("media-master-command", (payload) => {
        socket.to(payload.roomName).emit("master-reciever");
    });

    socket.on("media-master-action-command", (payload) => {
        socket.to(payload.roomName).emit("master-reciever-action", payload);
    });

    //to send a particular media
    socket.on("media-send", (payload) => {
        socket.to(payload.roomName).emit("media-recieve", payload);
        console.log("lulu");
    });

    //to kill active sharing
    socket.on("kill-active-sharing", (payload) => {
        socket.to(payload.roomName).emit("kill-active-recieving");
    });

    //to change position of playing content
    socket.on("change-position", (payload) => {
        socket.to(payload.roomName).emit("apply-new-position-request", payload.newPosition);
    });

    //to pause
    socket.on("pause", (payload) => {
        socket.to(payload.roomName).emit("pause-request");
    });

    //to pause
    socket.on("play", (payload) => {
        socket.to(payload.roomName).emit("play-request");
    });

    //server disconnect actions
    socket.on("disconnect", () => {
        if (roomsByUsername[users[socket.id]]) {
            const payload = { roomName: roomsByUsername[users[socket.id]].activeRooms, username: users[socket.id] };
            if (rooms[payload.roomName].owner[0] === users[socket.id]) {
                socket.to(payload.roomName).emit("exit-room-request", payload.roomName);
                delete roomsByUsername[users[socket.id]];
                delete rooms[payload.roomName];
                socket.leave(payload.roomName);
                socket.to(payload.roomName).emit("room-update", rooms[payload.roomName]);
            }
            if (rooms[payload.roomName]) {
                socket.leave(payload.roomName);
                delete roomsByUsername[users[socket.id]];
                rooms[payload.roomName].visitors = rooms[payload.roomName].visitors.filter((e) => e !== payload.username);
                socket.to(payload.roomName).emit("room-update", rooms[payload.roomName]);
                socket.to(payload.roomName).emit("kill-active-recieving");
                if (!rooms[payload.roomName].visitors.length && !roomsByUsername[rooms[payload.roomName].owner[0]]) delete rooms[payload.roomName];
            }
        }
        delete users[socket.id];
        onlineUsers.delete(users[socket.id]);
    });
});