const http = require("http");
const express = require("express");
const path = require("path");
const app = express();
const filter = require("bad-words");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const users = require("./utils/users");
const port = process.env.PORT || 4000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// io.on('connection',()=>{
//     console.log("New websocket connection")
// })
// let count=0;

io.on("connection", (socket) => {
  // socket.emit('countupdatedEvent',count)

  // console.log("a user connected");
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      console.log("error");
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
      callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const filter1 = new filter();
    if (filter1.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });
  socket.on("sendLocation", (position, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${position.latitude},${position.longitude}`
      )
    );
    callback();
  });
  // socket.on('increment',()=>{
  //   count++;
  //   io.emit('countupdatedEvent',count)
  //   // socket.emit('countupdatedEvent',count)
  // })
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});
