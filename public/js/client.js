// public/client.js
const socket = io();

// Elemen UI
const video = document.getElementById('main-video');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messages = document.getElementById('messages');

// Elemen UI Baru untuk Tampilan Netflix
const videoTitleElement = document.getElementById('videoTitle'); // Untuk menampilkan judul video
const toggleChatButton = document.getElementById('toggleChatButton');
const chatSidebar = document.getElementById('chatSidebar');
const closeChatButton = document.getElementById('closeChatButton');
const backButton = document.getElementById('backButton');
const refreshButton = document.getElementById('refreshButton');

// Flag untuk mencegah event loop tak terbatas
let isReceivingSync = false;

// --- KONTROL UI BARU ---
if (toggleChatButton && chatSidebar && closeChatButton) {
    toggleChatButton.addEventListener('click', () => {
        chatSidebar.classList.toggle('open');
    });

    closeChatButton.addEventListener('click', () => {
        chatSidebar.classList.remove('open');
    });
}

if (backButton) {
    backButton.addEventListener('click', () => {
        // Logika tombol kembali:
        // Jika ada histori, kembali. Jika tidak, mungkin ke halaman utama.
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Anda bisa mengarahkan ke halaman utama aplikasi Anda
            // window.location.href = '/'; 
            console.log("Tombol kembali: Tidak ada histori atau ke halaman utama.");
        }
    });
}

// --- SINKRONISASI VIDEO ---
socket.on('syncInitialState', (state) => {
    isReceivingSync = true;
    console.log('Menerima state awal:', state);
    
    video.src = state.src;
    if (videoTitleElement && state.title) { // Jika ada elemen judul dan data judul
        videoTitleElement.textContent = state.title;
    } else if (videoTitleElement) {
        // Judul default jika tidak ada dari server
        // Anda bisa mengambil dari nama file video.src jika memungkinkan
        try {
            const urlParts = state.src.split('/');
            const fileName = urlParts[urlParts.length - 1];
            videoTitleElement.textContent = decodeURIComponent(fileName).replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
        } catch (e) {
            videoTitleElement.textContent = "Video Sedang Diputar";
        }
    }

    video.currentTime = state.currentTime;
    if (state.isPlaying) {
        video.play().catch(e => console.log("Browser mencegah autoplay. Klik untuk memulai.", e));
    } else {
        video.pause();
    }
    setTimeout(() => { isReceivingSync = false; }, 200); // Sedikit lebih lama untuk stabilitas
});

video.addEventListener('play', () => {
    if (isReceivingSync) return;
    socket.emit('play', video.currentTime);
});

video.addEventListener('pause', () => {
    if (isReceivingSync) return;
    socket.emit('pause', video.currentTime);
});

video.addEventListener('seeked', () => {
    if (isReceivingSync) return;
    socket.emit('seek', video.currentTime);
});

socket.on('playVideo', (time) => {
    isReceivingSync = true;
    if (Math.abs(video.currentTime - time) > 0.8) { // Toleransi sedikit lebih besar
        video.currentTime = time;
    }
    video.play().catch(e => console.error("Error saat play dari server:", e));
    setTimeout(() => { isReceivingSync = false; }, 200);
});

socket.on('pauseVideo', (time) => {
    isReceivingSync = true;
    video.currentTime = time;
    video.pause();
    setTimeout(() => { isReceivingSync = false; }, 200);
});

socket.on('seekVideo', (time) => {
    isReceivingSync = true;
    video.currentTime = time;
    setTimeout(() => { isReceivingSync = false; }, 200);
});


// --- LOGIKA CHAT ---
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (chatInput.value.trim()) { // Tambahkan trim untuk pesan kosong
        socket.emit('chatMessage', chatInput.value.trim());
        chatInput.value = '';
    }
});

// Tambahkan di bagian awal file setelah deklarasi socket
let username = getCookie('username');
const usernameModal = document.getElementById('usernameModal');
const usernameForm = document.getElementById('usernameForm');
const changeVideoModal = document.getElementById('changeVideoModal');
const changeVideoForm = document.getElementById('changeVideoForm');
const changeVideoButton = document.getElementById('changeVideoButton');
const onlineUsersList = document.getElementById('onlineUsersList');

// Cookie functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Username handling
if (!username) {
    usernameModal.classList.add('show');
}

usernameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    username = document.getElementById('usernameInput').value.trim();
    if (username) {
        setCookie('username', username, 7);
        usernameModal.classList.remove('show');
        socket.emit('setUsername', username);
    }
});

// Change video handling
changeVideoButton.addEventListener('click', () => {
    changeVideoModal.classList.add('show');
});

changeVideoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrlInput').value.trim();
    if (videoUrl) {
        socket.emit('changeVideo', { url: videoUrl, title: 'Video Baru' });
        changeVideoModal.classList.remove('show');
        document.getElementById('videoUrlInput').value = '';
    }
});

// Update chat message handling
socket.on('newChatMessage', (msg) => {
    const item = document.createElement('li');
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    item.innerHTML = `<span class="message-time">[${time}]</span> <strong>${msg.user}:</strong> ${msg.text}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

// Online users handling
socket.on('updateOnlineUsers', (users) => {
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        onlineUsersList.appendChild(li);
    });
});

// Video change handling
socket.on('videoChanged', (data) => {
    video.src = data.url;
    videoTitleElement.textContent = data.title;
});

// Emit username on connection if exists
if (username) {
    socket.emit('setUsername', username);
}
// (Opsional) Memberi tahu server jika judul video berubah di klien (jika ada fitur ganti video)
// video.addEventListener('loadedmetadata', () => {
// if (!isReceivingSync && video.src !== videoState.src) { // Cek jika sumber video berubah oleh klien
// socket.emit('videoSourceChanged', video.src);
// }
// });


//membuat fungsi refresh button untuk refresh semua halaman
refreshButton.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit('refresh', true);
    window.location.reload();
    return
})

socket.on('refresh', (s) => {
    window.location.reload();
    return
})
