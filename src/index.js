const connectDB = require("../db/index.js");
const app = require("../src/app.js");
require("dotenv/config");

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB CONNECTION FAILED!!", error);
})