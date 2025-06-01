import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const VIDEO_PATH =
  "C:\\Users\\farid\\Downloads\\1080_[PUSATFILM21.INFO]the-ugly-stepsister-2025-WEB-DL.mp4";

const r = express.Router();

// Rute utama untuk menampilkan halaman HTML dengan video player
// r.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '/public/index.html'));
// });

r.get("/watch", (req, res) => {
  const { q } = req.query;
  if (q) {
    console.log(q);
    return res.render("watch", { q });
  } else {
    return res.redirect("/watch.html");
  }
});

r.get("/watch/:url", (req, res) => {
  const { url } = req.params;
  res.render("nobar", {
    videoUrl: url,
        videoTitle: 'Movie Title', // Bisa diambil dari database
        roomName: 'Movie Night',
        viewerCount: 0,
  })
})

// Rute untuk streaming video
r.get("/video", (req, res) => {
  // Cek apakah file video ada
  fs.stat(VIDEO_PATH, (err, stats) => {
    if (err) {
      console.error(`Error saat mengakses file video: ${err.message}`);
      return res.status(404).send("File video tidak ditemukan.");
    }

    const fileSize = stats.size; // Ukuran total file video
    const range = req.headers.range; // Ambil header 'Range' dari permintaan client

    if (range) {
      // Parsing header Range: "bytes=start-end"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1; // Ukuran chunk yang diminta

      // Set header HTTP untuk partial content (kode 206)
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4", // Sesuaikan dengan tipe video Anda
      });

      // Buat readable stream hanya untuk rentang bytes yang diminta
      const videoStream = fs.createReadStream(VIDEO_PATH, { start, end });

      // Pipe stream video ke response (writable stream)
      videoStream.pipe(res);

      // Penanganan error pada stream
      videoStream.on("error", (streamErr) => {
        console.error(`Error saat streaming video: ${streamErr.message}`);
        // Express secara otomatis menangani penutupan response jika pipe berakhir dengan error
        // res.end() tidak perlu dipanggil secara eksplisit di sini karena pipe akan mengurusnya
      });

      console.log(`Streaming video: bytes ${start}-${end}/${fileSize}`);
    } else {
      // Jika tidak ada header Range (permintaan penuh)
      // Set header HTTP untuk full content (kode 200)
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4", // Sesuaikan dengan tipe video Anda
      });

      // Buat readable stream untuk seluruh file
      const videoStream = fs.createReadStream(VIDEO_PATH);

      // Pipe stream video ke response
      videoStream.pipe(res);

      // Penanganan error pada stream
      videoStream.on("error", (streamErr) => {
        console.error(
          `Error saat streaming video (full): ${streamErr.message}`
        );
      });

      console.log("Streaming video: full content");
    }
  });
});

r.get("/video/:path", (req, res) => {
  const path = req.params.path;
  console.log(path);
  // Cek apakah file video ada
  fs.stat(VIDEO_PATH, (err, stats) => {
    if (err) {
      console.error(`Error saat mengakses file video: ${err.message}`);
      return res.status(404).send("File video tidak ditemukan.");
    }

    const fileSize = stats.size; // Ukuran total file video
    const range = req.headers.range; // Ambil header 'Range' dari permintaan client

    if (range) {
      // Parsing header Range: "bytes=start-end"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1; // Ukuran chunk yang diminta

      // Set header HTTP untuk partial content (kode 206)
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4", // Sesuaikan dengan tipe video Anda
      });

      // Buat readable stream hanya untuk rentang bytes yang diminta
      const videoStream = fs.createReadStream(VIDEO_PATH, { start, end });

      // Pipe stream video ke response (writable stream)
      videoStream.pipe(res);

      // Penanganan error pada stream
      videoStream.on("error", (streamErr) => {
        console.error(`Error saat streaming video: ${streamErr.message}`);
        // Express secara otomatis menangani penutupan response jika pipe berakhir dengan error
        // res.end() tidak perlu dipanggil secara eksplisit di sini karena pipe akan mengurusnya
      });

      console.log(`Streaming video: bytes ${start}-${end}/${fileSize}`);
    } else {
      // Jika tidak ada header Range (permintaan penuh)
      // Set header HTTP untuk full content (kode 200)
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4", // Sesuaikan dengan tipe video Anda
      });

      // Buat readable stream untuk seluruh file
      const videoStream = fs.createReadStream(VIDEO_PATH);

      // Pipe stream video ke response
      videoStream.pipe(res);

      // Penanganan error pada stream
      videoStream.on("error", (streamErr) => {
        console.error(
          `Error saat streaming video (full): ${streamErr.message}`
        );
      });

      console.log("Streaming video: full content");
    }
  });
});

export default r;
