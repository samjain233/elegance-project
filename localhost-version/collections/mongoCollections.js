//mongodb collections configuration
require("dotenv").config();
const mongodb = require("mongodb-legacy");
const { MongoClient } = require("mongodb-legacy");
const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("elegance");
client.connect();
const Users = db.collection("users");
const Playlist = db.collection("playlist");
const Metadata = db.collection("metaDatas");
const Media = new mongodb.GridFSBucket(db);
module.exports = {Users, Metadata, Playlist, Media, db};