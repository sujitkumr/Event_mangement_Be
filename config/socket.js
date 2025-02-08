// socket.js
// const socketIo = require("socket.io");

// module.exports = (server, app) => {
//   const io = socketIo(server, {
//     cors: {
//       // Specify the exact origin from which your client is served.
//       origin: "http://127.0.0.1:5500",
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       credentials: true,
//     },
//   });

//   // Store the io instance in your app so controllers can access it
//   app.set("socketio", io);

//   io.on("connection", (socket) => {
//     console.log("New client connected:", socket.id);

//     // Example: Allow clients to join a room (e.g., for a specific event)
//     socket.on("joinRoom", (roomId) => {
//       socket.join(roomId);
//       console.log(`Socket ${socket.id} joined room ${roomId}`);
//       socket.emit("testResponse", { message: "Hello, client!" });
//     });

//     socket.on("disconnect", () => {
//       console.log("Client disconnected:", socket.id);
//     });
//   });

//   return io;
// };


const socketIo = require("socket.io");

module.exports = (server, app) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust based on your frontend's URL
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  // Store the io instance in the app for global access
  app.set("socketio", io);

  io.on("connection", (socket) => {
    console.log(`[INFO] Client connected: ${socket.id}`);

    // Handle joining rooms
    socket.on("joinRoom", (roomId) => {
      if (!roomId || typeof roomId !== "string") {
        return socket.emit("error", { message: "Invalid room ID" });
      }
      socket.join(roomId);
      console.log(`[INFO] Socket ${socket.id} joined room ${roomId}`);
      socket.emit("roomJoined", { roomId, message: "Successfully joined the room!" });
    });

    // Example: Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[INFO] Client disconnected: ${socket.id}`);
    });

    // Example: Test event
    socket.on("testEvent", (data) => {
      console.log(`[INFO] Test event received from ${socket.id}:`, data);
      socket.emit("testResponse", { message: "Hello, client!" });
    });
  });

  return io;
};
