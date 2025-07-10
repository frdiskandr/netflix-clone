# Iflix - Nonton Bareng

Iflix adalah aplikasi web streaming video yang memungkinkan pengguna untuk menonton video secara sinkron bersama teman-teman, dilengkapi dengan fitur obrolan real-time. Proyek ini dibangun dengan tujuan untuk menciptakan pengalaman menonton bersama yang menyenangkan dan interaktif.

## Fitur Utama

- **Pemutaran Video Sinkron**: Kontrol pemutaran (play, pause, seek) disinkronkan secara otomatis untuk semua pengguna dalam satu ruangan.
- **Obrolan Real-time**: Berkomunikasi dengan teman-teman melalui fitur chat yang terintegrasi.
- **Ganti Video**: Pengguna dapat mengganti video yang sedang ditonton dengan video lain melalui URL.
- **Daftar Pengguna Online**: Menampilkan daftar pengguna yang sedang online di dalam ruangan.
- **Desain Responsif**: Tampilan yang menyesuaikan dengan berbagai ukuran layar, baik desktop maupun mobile.

## Teknologi yang Digunakan

- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [Express.js](https://expressjs.com/)
  - [Socket.IO](https://socket.io/) untuk komunikasi real-time.
  - [Prisma](https://www.prisma.io/) sebagai ORM untuk interaksi dengan database.
- **Database**:
  - [MongoDB](https://www.mongodb.com/)
- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
- **Deployment**:
  - [Docker](https://www.docker.com/) & Docker Compose
  - Konfigurasi untuk [Vercel](https://vercel.com/)

## Cara Menjalankan Proyek di Lokal

### Prasyarat

- [Node.js](https://nodejs.org/en/download/) (versi 18 atau lebih baru)
- [npm](https://www.npmjs.com/get-npm) (biasanya terinstal bersama Node.js)
- [MongoDB](https://www.mongodb.com/try/download/community) (atau akun MongoDB Atlas)
- [Docker](https://www.docker.com/products/docker-desktop/) (Opsional, untuk menjalankan dengan container)

### Instalasi

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/frdiskandr/netflix-clone.git
    cd netflix-clone
    ```

2.  **Instal dependensi proyek:**
    ```bash
    npm install
    ```

### Menjalankan Aplikasi

#### 1. Mode Pengembangan (Lokal)

Jalankan perintah berikut untuk memulai server pengembangan dengan `nodemon` yang akan otomatis me-restart server setiap kali ada perubahan pada file.

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

#### 2. Menggunakan Docker (Opsional)

Jika Anda memiliki Docker, Anda dapat menjalankan aplikasi dalam sebuah container.

```bash
docker compose up --build
```

Aplikasi akan berjalan di `http://localhost:3000`.

## Cara Menggunakan

1.  Buka browser dan akses `http://localhost:3000`.
2.  Klik menu **"Nonton Bareng"** untuk masuk ke halaman utama fitur nonton bersama.
3.  Masukkan *username* Anda pada modal yang muncul.
4.  Bagikan URL halaman tersebut kepada teman-teman Anda.
5.  Gunakan tombol **"Ganti Video"** (ikon film) untuk memutar video dari URL lain.
6.  Kontrol video (play, pause, seek) akan tersinkronisasi dengan semua peserta.
7.  Gunakan panel obrolan di sisi kanan untuk berdiskusi.
