//server routes to handle get and post requests
const { eleganceServer, mongoServer, emServer, videoRequest, eleganceRequest, mongoRequest } = require("../controllers/mediaControllers");
const router = require("express").Router();
router.post("/eleganceServer", eleganceServer);
router.post("/mongoServer", mongoServer);
router.post("/emServer", emServer);
router.get("/videoRequest", videoRequest);
router.get("/eleganceRequest/:fileName", eleganceRequest);
router.get("/mongoRequest/:fileName", mongoRequest);
module.exports = router;