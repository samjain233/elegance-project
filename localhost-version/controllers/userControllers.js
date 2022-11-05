const { Users } = require("../collections/mongoCollections");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

//user verfication function
function verificationHandler(email) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: "badsubrat.services@hotmail.com",
            pass: "{$badsubrat}.{$services}"
        }
    });
    transporter.sendMail({
        from: "badsubrat.services@hotmail.com",
        to: `${email}`,
        subject: "Verify your Email",
        text: `Enter this 10 digit code to verify : ${result}`,
    });
    return result;
}

//register post request handler
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await Users.findOne({ username: username });
        {
            if (usernameCheck) return res.json({ msg: "Username Already used", status: false });
        }
        const emailCheck = await Users.findOne({ email: email });
        {
            if (emailCheck) return res.json({ msg: "Email Already used", status: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = verificationHandler(email);
        const userAdd = await Users.insertOne({ email: email, username: username, password: hashedPassword, verificationCode: verificationCode, isVerified: false, mediaCount: 0 });
        {
            if (!userAdd.acknowledged) return res.json({ msg: "Something Went Wrong", status: false });
        }
        const user = await Users.findOne({ username: username });
        const localID = { ID: user._id, username: user.username, isVerified: user.isVerified };
        return res.json({ status: true, localID });
    }
    catch (ex) {
        next(ex);
    }

};

//verification post request handler
module.exports.verify = async (req, res, next) => {
    try {
        const { username, verificationCode } = req.body;
        const user = await Users.findOne({ username: username });
        if (user.verificationCode === verificationCode) {
            await Users.updateOne({ username: username }, { $set: { isVerified: true, verificationCode: "N/A" } });
            const userData = await Users.findOne({ username: username });
            return res.json({ status: true, isVerified: userData.isVerified });
        }
        else return res.json({ status: false, msg: "Wrong verification code" });
    }
    catch (ex) {
        next(ex);
    }

};

// login post request handler
module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ username: username });
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false });
        const localID = { ID: user._id, username: user.username, isVerified: user.isVerified };
        return res.json({ status: true, localID });
    } catch (ex) {
        next(ex);
    }
};