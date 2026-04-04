const express = require("express");
const dotenv = require('dotenv');

const app = express();

app.use(express.json({
    limit: "16kb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

module.exports = app;