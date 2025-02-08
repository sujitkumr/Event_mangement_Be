const express = require("express");
require("dotenv").config();
const http = require("http"); // Import the http module
const cors = require("cors");
const connectionDB = require("./config/db");
const authRoutes = require("./routes/user.route");
const EventRoute = require("./routes/event.route");
const cookieParser = require("cookie-parser");


const app = express();

// Middleware

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true ,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Log the JWT secret for debugging (remove or secure this in production)
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Connect to the database
connectionDB();

// Mount routes
app.use("/api/user", authRoutes);
app.use("/api/events", EventRoute);

// Create an HTTP server from the Express app
const server = http.createServer(app);
const io = require("./config/socket")(server, app);
// Start the server using the HTTP server (so Socket.IO works properly)
server.listen(process.env.PORT, async () => {
  try {
    console.log(`Server is running on port ${process.env.PORT}`);
  } catch (error) {
    console.error(error);
  }
});

module.exports = { app };



















































// const express = require("express");
// require("dotenv").config();

// const cors = require("cors");
// const  connectionDB  = require("./config/db");
// const authRoutes=require("./routes/user.route")
// const  bodyParser = require('express').json
// const app = express();
// const cookieParser = require('cookie-parser');
// const EventRoute= require('./routes/event.route')
// app.use(bodyParser());


// console.log("JWT_SECRET:", process.env.JWT_SECRET);
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// connectionDB();
// app.use("/api/user",authRoutes);
// app.use("/api/events", EventRoute);


// const server = http.createServer(app);
// const io = require("./socket")(server, app);

// app.listen(process.env.PORT, async() => {
//     try {
//         console.log(`Server is running on port ${process.env.PORT}`);
//     } catch (error) {
//         console.log(error);
//     }
// });

// module.exports= { app };  






