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

class main {
  // frdiskndr
  // Api (Application prgraming interface)

  static main() {
    // init app and middleware
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);
    app.use(express.json());
    app.use(cors());
    app.use(express.static("public"));
    // set render view
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '/api/app/views'))

    // route
    app.use(router);

    // config
    dotenv.config();
    const Port = process.env.PORT || 3000;
    server.listen(Port, () => {
      console.log(`Server running on http://localhost:${Port}`);
    });

    // const activeRooms = {};

    // // web socket
    // io.on("connection", (socket) => {
    //   const userId = socket.id;
    //   console.log(`a user connected: ${userId}`);

    //   // Event untuk membuat room baru
    //   socket.on("createRoom", (roomName, callback) => {
    //     if (activeRooms[roomName]) {
    //       // Jika room sudah ada
    //       callback({
    //         success: false,
    //         message: `Room "${roomName}" sudah ada.`,
    //       });
    //       return;
    //     }
    //     socket.join(roomName); // Klien otomatis bergabung ke room yang dibuatnya
    //     activeRooms[roomName] = {
    //       users: [userId],
    //       videoState: { currentTime: 0, isPlaying: false, videoSrc: "" },
    //     }; // Inisialisasi state room
    //     console.log(
    //       `Pengguna ${userId} membuat dan bergabung ke room: ${roomName}`
    //     );
    //     callback({
    //       success: true,
    //       message: `Room "${roomName}" berhasil dibuat.`,
    //       roomName: roomName,
    //     });
    //     // Broadcast ke semua (opsional, jika ingin menampilkan daftar room aktif)
    //     io.emit("roomListUpdate", Object.keys(activeRooms));
    //   });

    //   // Event untuk bergabung ke room yang sudah ada
    //   socket.on("joinRoom", (roomName, callback) => {
    //     if (!activeRooms[roomName]) {
    //       callback({
    //         success: false,
    //         message: `Room "${roomName}" tidak ditemukan.`,
    //       });
    //       return;
    //     }
    //     socket.join(roomName);
    //     activeRooms[roomName].users.push(userId);
    //     console.log(`Pengguna ${userId} bergabung ke room: ${roomName}`);

    //     // Kirim state video saat ini ke pengguna yang baru bergabung
    //     socket.emit("initialVideoState", activeRooms[roomName].videoState);

    //     callback({
    //       success: true,
    //       message: `Berhasil bergabung ke room "${roomName}".`,
    //       roomName: roomName,
    //     });
    //     // Bisa juga broadcast ke anggota room lain bahwa ada user baru (opsional)
    //     socket.to(roomName).emit("userJoined", userId);
    //   });

    //   // Event untuk menyinkronkan sumber video
    //   socket.on("setVideoSource", (data) => {
    //     // data = { room, src }
    //     if (activeRooms[data.room]) {
    //       activeRooms[data.room].videoState.videoSrc = data.src;
    //       activeRooms[data.room].videoState.currentTime = 0; // Reset waktu saat video baru
    //       activeRooms[data.room].videoState.isPlaying = false;
    //       // Broadcast ke semua di room bahwa sumber video berubah
    //       io.to(data.room).emit("videoSourceChanged", data.src);
    //     }
    //   });

    //   // Event sinkronisasi video (play, pause, seek)
    //   socket.on("syncPlay", (data) => {
    //     // data = { room, time }
    //     if (activeRooms[data.room]) {
    //       activeRooms[data.room].videoState.isPlaying = true;
    //       activeRooms[data.room].videoState.currentTime = data.time;
    //       socket.to(data.room).emit("playVideo", data.time);
    //     }
    //   });

    //   socket.on("syncPause", (data) => {
    //     // data = { room }
    //     if (activeRooms[data.room]) {
    //       activeRooms[data.room].videoState.isPlaying = false;
    //       // Waktu terakhir mungkin sudah disimpan dari event 'play' atau 'seek'
    //       socket
    //         .to(data.room)
    //         .emit("pauseVideo", activeRooms[data.room].videoState.currentTime);
    //     }
    //   });

    //   socket.on("syncSeek", (data) => {
    //     // data = { room, time }
    //     if (activeRooms[data.room]) {
    //       activeRooms[data.room].videoState.currentTime = data.time;
    //       socket.to(data.room).emit("seekVideo", data.time);
    //     }
    //   });

    //   socket.on("cursorMove", (data) => {
    //     socket.to(data.room).emit("updateCursor", {
    //       id: userId,
    //       x: data.x,
    //       y: data.y,
    //     });
    //   });

    //   socket.on("disconnecting", () => {
    //     // Iterasi melalui semua room tempat socket ini bergabung
    //     socket.rooms.forEach((room) => {
    //       if (room !== socket.id) {
    //         // Jangan proses room default socket itu sendiri
    //         if (activeRooms[room]) {
    //           // Hapus user dari daftar di room
    //           activeRooms[room].users = activeRooms[room].users.filter(
    //             (id) => id !== userId
    //           );
    //           console.log(`Pengguna ${userId} keluar dari room: ${room}`);
    //           // Jika room kosong, hapus room (opsional)
    //           if (activeRooms[room].users.length === 0) {
    //             delete activeRooms[room];
    //             console.log(`Room ${room} dihapus karena kosong.`);
    //             io.emit("roomListUpdate", Object.keys(activeRooms)); // Update daftar room
    //           } else {
    //             // Beri tahu anggota room lain bahwa user ini keluar
    //             io.to(room).emit("userLeft", userId);
    //           }
    //         }
    //         io.to(room).emit("removeCursor", userId); // Hapus kursor pengguna yang disconnect
    //       }
    //     });
    //   });

    //   socket.on("disconnect", () => {
    //     console.log(`user disconnected : ${userId}`);
    //   });
    // });
  }
}

main["main"]();