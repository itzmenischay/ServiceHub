import "./src/config/env.js";

import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import socketHandler from "./src/sockets/socketHandler.js";
import socketMiddleware from "./src/sockets/socketMiddleware.js";

connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketMiddleware);

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
