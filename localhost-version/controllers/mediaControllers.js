const { Users, Metadata, Media, Playlist } = require("../collections/mongoCollections");
const { Readable } = require('stream');
const fs = require("fs");
const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017';

//elegance server upload request handler
module.exports.eleganceServer = async (req, res, next) => {
    try {
        if (req.files === null) { return res.status(400).json({ msg: "No file Selected" }); }


        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const fileType = file.mimetype;
        const username = req.body.username;
        const user = await Users.findOne({ username: username });
        let newMediaCount = user.mediaCount + 1;
        const fileName = user._id + newMediaCount + ".mp4";
        file.name = fileName;
        file.mv(`${__dirname}/uploads/${file.name}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: "Something went wrong" });
            }
            await Users.updateOne({ username: username }, { $set: { mediaCount: newMediaCount } });
            const metaAdd = await Metadata.insertOne({ name: fileName, title: title, description: description, type: fileType, owner: username, server: "elegance" });
            if (!metaAdd.acknowledged) return res.json({ msg: "Something Went Wrong", status: false });
            return res.json({ status: true, msg: "Upload Successfull" });
        });
    }
    catch (ex) {
        next(ex);
    }

};

//mongo server upload request handler
module.exports.mongoServer = async (req, res, next) => {
    try {
        if (req.files === null) { return res.status(400).json({ msg: "No file Selected" }); }


        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const fileType = file.mimetype;
        const username = req.body.username;
        const user = await Users.findOne({ username: username });
        let newMediaCount = user.mediaCount + 1;
        const fileName = user._id + newMediaCount + ".mp4";
        file.name = fileName;
        const buffer = file.data;
        const stream = Readable.from(buffer);
        const videoUploadStream = Media.openUploadStream(`${fileName}`);
        const videoReadStream = stream;
        videoReadStream.pipe(videoUploadStream);
        await Users.updateOne({ username: username }, { $set: { mediaCount: newMediaCount } });
        const metaAdd = await Metadata.insertOne({ name: fileName, title: title, description: description, type: fileType, owner: username, server: "mongo" });
        if (!metaAdd.acknowledged) return res.json({ msg: "Something Went Wrong", status: false });
        return res.json({ status: true, msg: "Upload Successfull" });
    }
    catch (ex) {
        next(ex);
    }

};

//both server upload request handler
module.exports.emServer = async (req, res, next) => {
    try {
        if (req.files === null) { return res.status(400).json({ msg: "No file Selected" }); }


        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const fileType = file.mimetype;
        const username = req.body.username;
        const user = await Users.findOne({ username: username });
        let newMediaCount = user.mediaCount + 1;
        const fileName = user._id + newMediaCount + ".mp4";
        file.name = fileName;
        file.mv(`${__dirname}/uploads/${file.name}`, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ msg: "Something went wrong" });
            }
            const buffer = file.data;
            const stream = Readable.from(buffer);
            const videoUploadStream = Media.openUploadStream(`${fileName}`);
            const videoReadStream = stream;
            videoReadStream.pipe(videoUploadStream);
            const metaAdd = await Metadata.insertOne({ name: fileName, title: title, description: description, type: fileType, owner: username, server: "both" });
            if (!metaAdd.acknowledged) return res.json({ msg: "Something Went Wrong", status: false });
            await Users.updateOne({ username: username }, { $set: { mediaCount: newMediaCount } });
            return res.json({ status: true, msg: "Upload Successfull" });
        });
    }
    catch (ex) {
        next(ex);
    }

};


//stream content from elegance server
module.exports.eleganceRequest = async (req, res, next) => {
    try {
        const range = req.headers.range;
        if (!range) { res.status(400).send("Requires Range header"); }
        const videoPath = `controllers/uploads/` + req.params.fileName;
        const videoSize = fs.statSync(`controllers/uploads/` + req.params.fileName).size;
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, { start, end });
        videoStream.pipe(res);
    }
    catch (ex) {
        next(ex);
    }
};

//stream content from mongo server
module.exports.mongoRequest = async (req, res, next) => {
    try {
        const fileName = req.params.fileName;
        const client = await mongodb.MongoClient.connect(url, { useUnifiedTopology: true });
        const range = req.headers.range;
        if (!range) { res.status(400).send("Requires Range header"); }
        const db = client.db('elegance');
        db.collection('fs.files').findOne({ filename: fileName }, (err, video) => {
            if (!video) { res.status(404).send("No video uploaded!"); return; }
            const videoSize = video.length;
            const start = Number(range.replace(/\D/g, ""));
            const end = videoSize - 1;
            const contentLength = end - start + 1;
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/mp4",
            };
            res.writeHead(206, headers);
            const bucket = new mongodb.GridFSBucket(db);
            const downloadStream = bucket.openDownloadStreamByName(`${fileName}`, { start });
            downloadStream.pipe(res);
        });
    }
    catch (ex) {
        next(ex);
    }
};


//getting all videos
module.exports.videoRequest = async (req, res, next) => {
    try {
        const videos = await Metadata.find({}).toArray();
        return res.json({ status: true, videos: videos });
    }
    catch (ex) {
        next(ex);
    }

};



//save playlists
module.exports.playlistSave = async (req, res, next) => {
    try {
        const { playlistName, username } = req.body;
        const playlistNameCheck = await Playlist.findOne({ username: username, playlistName: playlistName });
        {
            if (playlistNameCheck) return res.json({ msg: "Playlist name already exist", status: false });
        }
        const playlistAdd = await Playlist.insertOne({ username: username, playlistName: playlistName, videos: [] });
        {
            if (!playlistAdd.acknowledged) return res.json({ msg: "Something Went Wrong", status: false });
        }
        const playlist = await Playlist.findOne({ username: username, playlistName: playlistName });
        return res.json({ msg: "Playlist succesfully added", playlist: playlist, status: true });
    }
    catch (ex) {
        next(ex);
    }
};

//get playlists
module.exports.playlistRequest = async (req, res, next) => {
    try {
        const { username } = req.body;
        const playlist = await Playlist.find({ username: username }).toArray();
        return res.json({ status: true, playlist: playlist });
    }
    catch (ex) {
        next(ex);
    }
};

//update playlists
module.exports.playlistUpdate = async (req, res, next) => {
    try {
        const { videoToAdd, playlistName, username } = req.body;
        const findPlaylist = await Playlist.findOne({ username: username, playlistName: playlistName });
        const videosList = findPlaylist.videos;
        if (videosList.filter(e => e.name === videoToAdd.name).length) {
            console.log(videosList.filter(e => e.name === videoToAdd.name).length);
            return res.json({ msg: "Video already exist", status: false });
        }
        const videoAdd = await Playlist.updateOne({ username: username, playlistName: playlistName }, { $push: { videos: videoToAdd } });
        {
            if (!videoAdd.acknowledged) return res.json({ msg: "Something went wrong", status: false });
        }
        return res.json({ msg: "Video successfully added", status: true });
    }
    catch (ex) {
        next(ex);
    }
};

//videos in a playlists
module.exports.playlistVideos = async (req, res, next) => {
    try {
        const { playlistName, username } = req.body;
        const playlistVideos = await Playlist.findOne({ username: username, playlistName: playlistName });
        return res.json({ status: true, playlistVideos: playlistVideos.videos });
    }
    catch (ex) {
        next(ex);
    }
};

module.exports.playlistDelete = async (req, res, next) => {
    try {
        const { playlistName, username } = req.body;
        const result = await Playlist.deleteOne({ username: username, playlistName: playlistName });
        const playlist = await Playlist.find({ username: username }).toArray();
        return res.json({ status: true, playlist: playlist });
    }
    catch (ex) {
        next(ex);
    }
};