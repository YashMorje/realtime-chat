const socket = io();
const username = localStorage.getItem("username");

if (!username) location.href = "login.html";

socket.emit("join", username);

const messages = document.getElementById("messages");
const usersDiv = document.getElementById("users");
const input = document.getElementById("msg");

function send() {
  if (!input.value.trim()) return;
  socket.emit("chat", input.value);
  input.value = "";
}

function addEmoji(e) {
  input.value += e;
}

socket.on("chat", data => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${data.user}</b>: ${data.message} <small>${data.time}</small>`;
  messages.appendChild(div);
});

socket.on("users", users => {
  usersDiv.innerHTML = "Online: " + users.join(", ");
});

socket.on("oldMessages", msgs => {
  msgs.forEach(m => socket.emit("chat", m.message));
});

function toggleDark() {
  document.body.classList.toggle("dark");
}
