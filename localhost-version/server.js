const cors = require("cors");
const express = require("express");
const userRoutes = require("./routes/userRoutes");
const app = express();

require("dotenv").config();
app.use(express.json());
app.use(cors());
app.use("/api/auth", userRoutes);

const server = app.listen(process.env.PORT, () => { console.log(`server started on port ${process.env.PORT}`); });
