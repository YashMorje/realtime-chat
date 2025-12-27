const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));


const ChatSchema = new mongoose.Schema({
  user: String,
  message: String,
  time: String
});

const Chat = mongoose.model("Chat", ChatSchema);

let users = {};

io.on("connection", socket => {

  socket.on("join", async username => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));

    const oldMessages = await Chat.find();
    socket.emit("oldMessages", oldMessages);
  });

  socket.on("chat", async msg => {
    const data = {
      user: users[socket.id],
      message: msg,
      time: new Date().toLocaleTimeString()
    };

    await Chat.create(data);
    io.emit("chat", data);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("users", Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
