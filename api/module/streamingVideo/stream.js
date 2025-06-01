import { Router } from "express";
class streamingVideo {
  constructor(app = Router(), url = "/stream", path = "") {
    this.app = app;
    this.url = url;
    this.path = path;

    this.app.get(this.url, (req, res) => {
      // Cek apakah file video ada
      fs.stat(this.path, (err, stats) => {
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
          const videoStream = fs.createReadStream(this.path, { start, end });

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
          const videoStream = fs.createReadStream(this.path);

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
  }
}


export default streamingVideo