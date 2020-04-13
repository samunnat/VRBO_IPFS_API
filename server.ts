
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use("/api/ipfs", require("./routes/api/ipfs.routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log(`Server is running on Port: ${PORT}`);
});

module.exports = app;
