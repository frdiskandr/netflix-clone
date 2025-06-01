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
    src: "https://resource.flexclip.com/templates/video/720p/high-tech-space-universe-science-fiction-star-war-earth-planet-movie-trailer-teaser-opener-intro.mp4?v=1.1.0.5.8", // video
    isPlaying: false,
    currentTime: 0,
    lastUpdate: Date.now()
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

  // Ketika klien mengirim pesan chat
  socket.on("chatMessage", (msg) => {
    // Broadcast pesan ke SEMUA pengguna di room (termasuk pengirim)
    io.to(ROOM_NAME).emit("newChatMessage", {
      user: `User-${socket.id.substring(0, 5)}`,
      text: msg,
    });
  });

  // Ketika klien terputus
  socket.on("disconnect", () => {
    console.log(`Pengguna terputus: ${socket.id}`);
  });
});

export default { app, server, io, __dirname, __filename };
// export default main;
