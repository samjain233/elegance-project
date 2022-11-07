//server routes to handle get and post requests
const { eleganceServer, mongoServer, emServer, videoRequest, eleganceRequest, mongoRequest, playlistSave, playlistRequest, playlistUpdate, playlistVideos } = require("../controllers/mediaControllers");
const router = require("express").Router();
router.post("/eleganceServer", eleganceServer);
router.post("/mongoServer", mongoServer);
router.post("/emServer", emServer);
router.get("/videoRequest", videoRequest);
router.post("/playlistRequest", playlistRequest);
router.post("/playlistUpdate", playlistUpdate);
router.post("/playlistVideos", playlistVideos);
router.get("/eleganceRequest/:fileName", eleganceRequest);
router.get("/mongoRequest/:fileName", mongoRequest);
router.post("/playlistSave", playlistSave);
module.exports = router;