//server routes to handle get and post requests
const { register, login, verify } = require("../controllers/userControllers");
const router = require("express").Router();
router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
module.exports = router;