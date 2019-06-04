const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Filter = require("bad-words");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on("connection", socket => {
    console.log("New WebSocket connection");

    socket.emit("message", "Welcome!");
    socket.broadcast.emit("message", "A new user has joined!");

    socket.on("sendMessage", (message, cb) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return cb("Profanity is not allowed")
        }

        io.emit("message", message);
        cb();
    });

    socket.on("sendLocation", ({ latitude, longitude }, cb) => {
        io.emit("message", `https://google.com/maps?q=${latitude},${longitude}`)
        cb();
    });

    socket.on("disconnect", () => {
        io.emit("message", "A user has left!")
    })
});

server.listen(PORT, () => console.log(`Server is up on port ${PORT}.`));