require("dotenv").config();
const express = require("express");
const cors = require("cors");
const indexRouter = require("./routes");
const mongoose = require("mongoose");

const DB_URL = process.env.DB_URL;
const PORT = process.env.PORT || 3000;

mongoose.connect(DB_URL).then(() => {
    console.log("database connected succesfully");
});
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static('public'))

app.use("/", indexRouter);

app.use((err, req, res, next) => {
  const errMsg = err ? err.toString() : "something went wrong";
  res.status(500).json({ datat: "", msg: errMsg });
});

app.listen(PORT, () => {
  console.log(`app is running on ${PORT}`);
});

