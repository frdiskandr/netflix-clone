import express from "express";
import cors from "cors";
import router from "./api/routers/router.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let videoState = {
  // Ganti dengan URL video default Anda
  src: "/video", // video
  isPlaying: false,
  currentTime: 0,
  lastUpdate: Date.now(),
};

// init app and middleware
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
// set render view
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/api/app/views"));

// route
app.use(router);

// config
dotenv.config();
const Port = process.env.PORT || 3000;
server.listen(Port, () => {
  console.log(`Server running on http://localhost:${Port}`);
});

//! socket
// --- LOGIKA SOCKET.IO ---
const onlineUsers = new Map();
const ROOM_NAME = "global-watch-party";

io.on("connection", (socket) => {
  console.log(`Pengguna terhubung: ${socket.id}`);

  // Langsung masukkan pengguna ke room global
  socket.join(ROOM_NAME);

  // Saat pengguna baru bergabung, kirim state video saat ini HANYA ke dia
  // agar videonya sinkron dengan yang lain.
  if (videoState.isPlaying) {
    // Jika video sedang berjalan, perkirakan waktu saat ini
    const elapsed = (Date.now() - videoState.lastUpdate) / 1000;
    videoState.currentTime += elapsed;
  }
  socket.emit("syncInitialState", videoState);

  // -- Menangani Event dari Klien --

 // Username handling
 socket.on('setUsername', (username) => {
  onlineUsers.set(socket.id, username);
  io.to(ROOM_NAME).emit('updateOnlineUsers', Array.from(onlineUsers.values()));
});


  // Video change handling
  socket.on('changeVideo', (data) => {
    videoState.src = data.url;
    videoState.currentTime = 0;
    videoState.isPlaying = false;
    io.to(ROOM_NAME).emit('videoChanged', {
      url: data.url,
      title: data.title
    });
  });

  // Ketika klien menekan play
  socket.on("play", (time) => {
    videoState.isPlaying = true;
    videoState.currentTime = time;
    videoState.lastUpdate = Date.now();
    // Broadcast ke semua pengguna LAIN di room bahwa video diputar
    socket.to(ROOM_NAME).emit("playVideo", time);
  });

  // Ketika klien menekan pause
  socket.on("pause", (time) => {
    videoState.isPlaying = false;
    videoState.currentTime = time;
    // Broadcast ke semua pengguna LAIN bahwa video dijeda
    socket.to(ROOM_NAME).emit("pauseVideo", time);
  });

  // Ketika klien melakukan seek (menggeser durasi)
  socket.on("seek", (time) => {
    videoState.currentTime = time;
    videoState.lastUpdate = Date.now();
    // Broadcast ke semua pengguna LAIN
    socket.to(ROOM_NAME).emit("seekVideo", time);
  });


   // Update chat message handling
   socket.on('chatMessage', (msg) => {
    const username = onlineUsers.get(socket.id) || `User-${socket.id.substring(0, 5)}`;
    io.to(ROOM_NAME).emit('newChatMessage', {
      user: username,
      text: msg
    });
  });

  // ketika refresh button ditekan
  socket.on('refresh', () => {
    socket.to(ROOM_NAME).emit('refresh');
  });

  // Update disconnect handling
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.to(ROOM_NAME).emit('updateOnlineUsers', Array.from(onlineUsers.values()));
    console.log(`Pengguna terputus: ${socket.id}`);
  });
});

export default { app, server, io, __dirname, __filename };
// export default main;
