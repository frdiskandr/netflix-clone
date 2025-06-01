// public/client-nobar.js
const socket = io();

// Elemen UI
const userIdSpan = document.getElementById('userIdSpan');
const roomStatusSpan = document.getElementById('roomStatus');
const newRoomNameInput = document.getElementById('newRoomName');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomNameInput = document.getElementById('joinRoomName');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const messageArea = document.getElementById('messageArea');

const videoSection = document.getElementById('video-section');
const currentRoomNameSpan = document.getElementById('currentRoomName');
const videoUrlInput = document.getElementById('videoUrlInput');
const setVideoBtn = document.getElementById('setVideoBtn');
const videoPlayer = document.getElementById('mainVideoPlayer');
const videoPlayerContainer = document.getElementById('video-player-container');

let myId = null;
let currentRoom = null;
let isSeekingInternally = false; // Flag untuk mencegah loop event seek

// Tampilkan ID pengguna saat terhubung
socket.on('connect', () => {
    myId = socket.id;
    userIdSpan.textContent = myId;
    console.log('Terhubung ke server dengan ID:', myId);
});

function showMessage(text, type = 'info') {
    messageArea.textContent = text;
    messageArea.className = `message ${type}`; // 'success', 'error', atau 'info' (default)
}

// Fungsi untuk menangani UI setelah join/create room
function handleRoomJoined(roomName) {
    currentRoom = roomName;
    roomStatusSpan.textContent = `Di room "${roomName}"`;
    currentRoomNameSpan.textContent = roomName;
    videoSection.style.display = 'block'; // Tampilkan bagian video
    // Sembunyikan kontrol room
    document.querySelector('.room-controls').style.display = 'none';
}

// Membuat Room Baru
createRoomBtn.addEventListener('click', () => {
    const roomName = newRoomNameInput.value.trim();
    if (roomName) {
        socket.emit('createRoom', roomName, (response) => {
            if (response.success) {
                showMessage(response.message, 'success');
                handleRoomJoined(response.roomName);
            } else {
                showMessage(response.message, 'error');
            }
        });
    } else {
        showMessage('Nama room tidak boleh kosong.', 'error');
    }
});

// Bergabung ke Room
joinRoomBtn.addEventListener('click', () => {
    const roomName = joinRoomNameInput.value.trim();
    if (roomName) {
        socket.emit('joinRoom', roomName, (response) => {
            if (response.success) {
                showMessage(response.message, 'success');
                handleRoomJoined(response.roomName);
            } else {
                showMessage(response.message, 'error');
            }
        });
    } else {
        showMessage('Nama room tidak boleh kosong.', 'error');
    }
});

// Mengatur Sumber Video untuk Room
setVideoBtn.addEventListener('click', () => {
    const videoSrc = videoUrlInput.value.trim();
    if (videoSrc && currentRoom) {
        // Validasi sederhana untuk URL (bisa diperketat)
        if (videoSrc.startsWith('http://') || videoSrc.startsWith('https://')) {
            socket.emit('setVideoSource', { room: currentRoom, src: videoSrc });
        } else {
            showMessage('URL video tidak valid. Harus dimulai dengan http:// atau https://', 'error');
        }
    } else if (!currentRoom) {
        showMessage('Anda harus bergabung atau membuat room terlebih dahulu.', 'error');
    } else {
        showMessage('URL video tidak boleh kosong.', 'error');
    }
});

// Menerima perubahan sumber video dari server
socket.on('videoSourceChanged', (src) => {
    videoPlayer.src = src;
    videoPlayer.currentTime = 0; // Reset waktu
    videoPlayer.pause(); // Jeda video baru
    showMessage(`Sumber video di room ini diubah.`, 'info');
});

// Menerima state video awal saat bergabung ke room
socket.on('initialVideoState', (state) => {
    if (state.videoSrc) {
        videoPlayer.src = state.videoSrc;
    }
    videoPlayer.currentTime = state.currentTime;
    if (state.isPlaying) {
        videoPlayer.play().catch(e => console.error("Error auto play:", e));
    } else {
        videoPlayer.pause();
    }
    console.log('Menerima state video awal:', state);
});


// Logika Sinkronisasi Video Player
videoPlayer.addEventListener('play', () => {
    if (isSeekingInternally || !currentRoom) return;
    console.log('Kirim: play', videoPlayer.currentTime);
    socket.emit('syncPlay', { room: currentRoom, time: videoPlayer.currentTime });
});

videoPlayer.addEventListener('pause', () => {
    if (isSeekingInternally || !currentRoom || videoPlayer.ended) return;
    console.log('Kirim: pause');
    socket.emit('syncPause', { room: currentRoom });
});

videoPlayer.addEventListener('seeked', () => {
    if (!currentRoom) return;
    console.log('Kirim: seeked', videoPlayer.currentTime);
    isSeekingInternally = false;
    socket.emit('syncSeek', { room: currentRoom, time: videoPlayer.currentTime });
});

videoPlayer.addEventListener('seeking', () => {
    if (!currentRoom) return;
    isSeekingInternally = true;
});

// Menerima perintah sinkronisasi dari server
socket.on('playVideo', (time) => {
    console.log('Terima: playVideo, waktu:', time);
    if (Math.abs(videoPlayer.currentTime - time) > 0.5) { // Toleransi perbedaan waktu
        videoPlayer.currentTime = time;
    }
    videoPlayer.play().catch(e => console.error("Error play dari server:", e));
});

socket.on('pauseVideo', (time) => {
    console.log('Terima: pauseVideo, waktu:', time);
     if (Math.abs(videoPlayer.currentTime - time) > 0.5) {
        videoPlayer.currentTime = time;
    }
    videoPlayer.pause();
});

socket.on('seekVideo', (time) => {
    console.log('Terima: seekVideo, waktu:', time);
    isSeekingInternally = true; // Set flag agar tidak memicu event 'seeked' lokal
    videoPlayer.currentTime = time;
    // Flag akan di-reset oleh event 'seeked' alami dari video player setelah seek selesai
    // Namun, untuk memastikan, kita bisa reset setelah timeout singkat jika 'seeked' tidak terpicu
    setTimeout(() => { isSeekingInternally = false; }, 200);
});

// Logika Kursor
document.addEventListener('mousemove', (e) => {
    if (!currentRoom || !videoSection.contains(e.target)) return; // Hanya kirim jika di dalam room & kursor di area video

    const rect = videoPlayerContainer.getBoundingClientRect();
    // Pastikan kursor berada di dalam batas video player container
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        socket.emit('cursorMove', { room: currentRoom, x, y });
    }
});

socket.on('updateCursor', (data) => {
    if (data.id === myId) return; // Jangan tampilkan kursor sendiri

    let cursor = document.getElementById(`cursor-${data.id}`);
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = `cursor-${data.id}`;
        cursor.className = 'cursor';
        // Beri warna acak untuk setiap kursor (opsional)
        // cursor.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 70%)`;
        videoPlayerContainer.appendChild(cursor);
    }
    cursor.style.left = `${data.x}px`;
    cursor.style.top = `${data.y}px`;
});

socket.on('removeCursor', (userId) => {
    const cursor = document.getElementById(`cursor-${userId}`);
    if (cursor) {
        cursor.remove();
    }
});

socket.on('userJoined', (userId) => {
    showMessage(`Pengguna ${userId.substring(0,6)}... bergabung ke room.`, 'info');
});

socket.on('userLeft', (userId) => {
    showMessage(`Pengguna ${userId.substring(0,6)}... keluar dari room.`, 'info');
    const cursor = document.getElementById(`cursor-${userId}`);
    if (cursor) {
        cursor.remove();
    }
});

// (Opsional) Menampilkan daftar room aktif jika server mengirimkannya
socket.on('roomListUpdate', (rooms) => {
    console.log('Room aktif:', rooms);
    // Anda bisa menambahkan UI untuk menampilkan daftar room ini
});