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

app.use("/api/v1/auth", require("../routes/auth.routes.js"));
app.use("/api/v1/users", require("../routes/user.routes.js"));
app.use("/api/v1/transactions", require("../routes/transaction.routes.js"));
app.use("/api/v1/dashboard", require("../routes/dashboard.routes.js"));

const errorHandler = require("../middleware/errorHandler.middleware.js");
app.use(errorHandler);

module.exports = app;