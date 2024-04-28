const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

const rooms = { A: [], B: [] };

app.use(express.static(path.join(__dirname + "/public")));

app.get("/:roomName", (req, res) => {
  const roomName = req.params.roomName;

  if (!rooms[roomName]) {
    return res.status(404).send("Invalid chat room name");
  }

  res.sendFile(path.join(__dirname, "public/index.html"));
});

io.on("connection", (socket) => {
  let currentRoom = "";
  socket.on("newuser", (username, roomName) => {
    currentRoom = roomName;
    console.log(currentRoom);

    if (!currentRoom || !rooms[currentRoom]) {
      return socket.emit("error", "Invalid chat room name");
    }

    rooms[currentRoom].push(socket.id);
    socket.join(socket.id);
    console.log(rooms);

    socket
      .to(rooms[currentRoom])
      .emit("update", username + " joined the conversation");
    console.log(rooms);
  });

  socket.on("exituser", (username) => {
    socket
      .to(rooms[currentRoom])
      .emit("update", username + " left the conversation");
  });

  socket.on("chat", (message) => {
    socket.to(rooms[currentRoom]).emit("chat", message);
  });
});

server.listen(5555, () => {
  console.log("http://localhost:5555");
});
