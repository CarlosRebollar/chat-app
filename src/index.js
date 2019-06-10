const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Filter = require("bad-words");
const { generatedMessage, generateLocationMessage } = require("./utlis/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utlis/users");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", socket => {
    console.log("New WebSocket connection");

    socket.on("join", (options, cb) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return cb(error);
        }

        socket.join(user.room);

        socket.emit("message", generatedMessage("Admin", "Welcome!"));
        socket.broadcast.to(user.room).emit("message", generatedMessage("Admin", `${user.username} has joined!`));
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        cb();
    });

    socket.on("sendMessage", (message, cb) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return cb("Profanity is not allowed")
        }

        io.to(user.room).emit("message", generatedMessage(user.username, message));
        cb();
    });

    socket.on("sendLocation", ({ latitude, longitude }, cb) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("locationMessage", generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        cb();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message",generatedMessage( "Admin",`${user.username} has left!`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    })
});

server.listen(PORT, () => console.log(`Server is up on port ${PORT}.`));