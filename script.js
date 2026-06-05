// Estado da aplicação
let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');
const videoContainer = document.getElementById('videoContainer');
const fileInput = document.getElementById('fileInput');
const supportedAudioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/m4a'];
const supportedVideoFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv'];

// Event Listeners
fileInput.addEventListener('change', handleFiles);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('loadedmetadata', updateDuration);
audioPlayer.addEventListener('ended', handleTrackEnd);
videoPlayer.addEventListener('timeupdate', updateProgress);
videoPlayer.addEventListener('loadedmetadata', updateDuration);
videoPlayer.addEventListener('ended', handleTrackEnd);
document.getElementById('progressSlider').addEventListener('click', seekTo);
document.getElementById('volumeSlider').addEventListener('click', setVolume);
document.getElementById('searchBox').addEventListener('input', searchTracks);

function handleFiles(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const isVideo = supportedVideoFormats.includes(file.type) || file.name.match(/\.(mp4|webm|mkv|mov)$/i);
        
        const track = {
            id: Date.now() + Math.random(),
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Artista Desconhecido",
            album: "Biblioteca Local",
            duration: "0:00",
            type: isVideo ? 'video' : 'audio',
            file: file,
            url: URL.createObjectURL(file),
            favorite: false
        };
        
        playlist.push(track);
    });

    updatePlaylistUI();
    updateLibraryUI();

    if (currentTrackIndex === -1 && playlist.length > 0) {
        playTrack(0);
    }
}

function updatePlaylistUI() {
    const playlistContent = document.getElementById('playlistContent');
    if (playlist.length === 0) {
        playlistContent.innerHTML = '<div class="playlist-empty">Arraste arquivos ou clique em "Adicionar Mídia" para começar</div>';
        return;
    }
    
    playlistContent.innerHTML = playlist.map((track, index) => `
        <div class="playlist-item ${index === currentTrackIndex ? 'active' : ''}" onclick="playTrack(${index})">
            <div class="playlist-item-cover">${track.type === 'video' ? '🎬' : '🎵'}</div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${track.name}</div>
                <div class="playlist-item-artist">${track.artist}</div>
            </div>
            <button class="icon-btn" onclick="event.stopPropagation(); toggleFavorite(${index})" title="Favoritar">
                ${track.favorite ? '❤️' : '🤍'}
            </button>
        </div>
    `).join('');
}

function updateLibraryUI() {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = playlist.map((track, index) => `
        <div class="track-item ${index === currentTrackIndex ? 'active' : ''}" onclick="playTrack(${index})">
            <div class="track-number">${(index + 1).toString().padStart(2, '0')}</div>
            <div class="track-title">${track.name}</div>
            <div class="track-artist">${track.artist}</div>
            <div class="track-duration">${track.type.toUpperCase()}</div>
        </div>
    `).join('');
}

function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    stopAll();
    currentTrackIndex = index;
    const track = playlist[index];
    
    if (track.type === 'video') {
        videoContainer.style.display = 'block';
        videoPlayer.src = track.url;
        videoPlayer.play();
    } else {
        videoContainer.style.display = 'none';
        audioPlayer.src = track.url;
        audioPlayer.play();
    }

    isPlaying = true;
    updateNowPlaying(track);
    updatePlaylistUI();
    updateLibraryUI();
}

function stopAll() {
    audioPlayer.pause();
    videoPlayer.pause();
    audioPlayer.src = "";
    videoPlayer.src = "";
}

function updateNowPlaying(track) {
    document.getElementById('nowPlayingTitle').textContent = track.name;
    document.getElementById('nowPlayingArtist').textContent = track.artist;
    document.getElementById('nowPlayingCover').textContent = track.type === 'video' ? '🎬' : '🎵';
    document.getElementById('playBtn').textContent = '⏸';
}

function togglePlay() {
    if (playlist.length === 0) return;
    
    const track = playlist[currentTrackIndex];
    const activePlayer = track?.type === 'video' ? videoPlayer : audioPlayer;
    
    if (isPlaying) {
        activePlayer.pause();
        document.getElementById('playBtn').textContent = '▶';
    } else {
        activePlayer.play();
        document.getElementById('playBtn').textContent = '⏸';
    }
    isPlaying = !isPlaying;
}

function nextTrack() {
    let nextIndex = isShuffle ? Math.floor(Math.random() * playlist.length) : (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
}

function previousTrack() {
    let prevIndex = currentTrackIndex - 1 < 0 ? playlist.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
}

function handleTrackEnd() {
    if (isRepeat) {
        const track = playlist[currentTrackIndex];
        const activePlayer = track.type === 'video' ? videoPlayer : audioPlayer;
        activePlayer.currentTime = 0;
        activePlayer.play();
    } else {
        nextTrack();
    }
}

function updateProgress() {
    const track = playlist[currentTrackIndex];
    const activePlayer = track?.type === 'video' ? videoPlayer : audioPlayer;
    
    if (activePlayer.duration) {
        const progress = (activePlayer.currentTime / activePlayer.duration) * 100;
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('currentTime').textContent = formatTime(activePlayer.currentTime);
    }
}

function updateDuration() {
    const track = playlist[currentTrackIndex];
    const activePlayer = track?.type === 'video' ? videoPlayer : audioPlayer;
    document.getElementById('totalTime').textContent = formatTime(activePlayer.duration);
}

function seekTo(e) {
    const track = playlist[currentTrackIndex];
    const activePlayer = track?.type === 'video' ? videoPlayer : audioPlayer;
    const percent = e.offsetX / e.currentTarget.offsetWidth;
    
    if (activePlayer.duration) {
        activePlayer.currentTime = percent * activePlayer.duration;
    }
}

function setVolume(e) {
    const percent = e.offsetX / e.currentTarget.offsetWidth;
    audioPlayer.volume = percent;
    videoPlayer.volume = percent;
    document.getElementById('volumeFill').style.width = (percent * 100) + '%';
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    const btn = document.getElementById('shuffleBtn');
    btn.style.background = isShuffle ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)';
    btn.style.border = isShuffle ? 'none' : '1px solid rgba(255,255,255,0.2)';
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    const btn = document.getElementById('repeatBtn');
    btn.style.background = isRepeat ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)';
    btn.style.border = isRepeat ? 'none' : '1px solid rgba(255,255,255,0.2)';
}

function toggleFavorite(index) {
    playlist[index].favorite = !playlist[index].favorite;
    updatePlaylistUI();
}

function clearPlaylist() {
    stopAll();
    playlist = [];
    currentTrackIndex = -1;
    isPlaying = false;
    videoContainer.style.display = 'none';
    document.getElementById('nowPlayingTitle').textContent = 'Nenhuma música';
    document.getElementById('nowPlayingArtist').textContent = '-';
    document.getElementById('playBtn').textContent = '▶';
    updatePlaylistUI();
    updateLibraryUI();
}

function switchView(element, view) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    let filteredPlaylist = playlist;
    
    if (view === 'favorites') {
        filteredPlaylist = playlist.filter(track => track.favorite);
    } else if (view === 'playlists') {
        // Lógica para playlists (pode ser expandida)
        console.log('Visualizando playlists');
    } else if (view === 'folders') {
        filteredPlaylist = playlist;
    }
    
    updateFilteredView(filteredPlaylist, view);
}

function updateFilteredView(filteredTracks, view) {
    const trackList = document.getElementById('trackList');
    const contentTitle = document.querySelector('.content-title');
    
    const titles = {
        'folders': 'Pastas',
        'playlists': 'Playlists',
        'favorites': 'Favoritos'
    };
    
    contentTitle.textContent = titles[view] || 'Biblioteca';
    
    if (filteredTracks.length === 0) {
        trackList.innerHTML = '<div class="playlist-empty">Nenhuma mídia encontrada</div>';
        return;
    }
    
    trackList.innerHTML = filteredTracks.map((track, index) => {
        const originalIndex = playlist.indexOf(track);
        return `
            <div class="track-item ${originalIndex === currentTrackIndex ? 'active' : ''}" onclick="playTrack(${originalIndex})">
                <div class="track-number">${(originalIndex + 1).toString().padStart(2, '0')}</div>
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
                <div class="track-duration">${track.type.toUpperCase()}</div>
            </div>
        `;
    }).join('');
}

function filterLibrary(element, filter) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
    
    let filteredPlaylist = playlist;
    
    if (filter === 'audio') {
        filteredPlaylist = playlist.filter(track => track.type === 'audio');
    } else if (filter === 'video') {
        filteredPlaylist = playlist.filter(track => track.type === 'video');
    }
    
    const trackList = document.getElementById('trackList');
    
    if (filteredPlaylist.length === 0) {
        trackList.innerHTML = '<div class="playlist-empty">Nenhuma mídia encontrada</div>';
        return;
    }
    
    trackList.innerHTML = filteredPlaylist.map((track, index) => {
        const originalIndex = playlist.indexOf(track);
        return `
            <div class="track-item ${originalIndex === currentTrackIndex ? 'active' : ''}" onclick="playTrack(${originalIndex})">
                <div class="track-number">${(originalIndex + 1).toString().padStart(2, '0')}</div>
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
                <div class="track-duration">${track.type.toUpperCase()}</div>
            </div>
        `;
    }).join('');
}

function searchTracks() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    
    document.querySelectorAll('#trackList .track-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(query) ? 'grid' : 'none';
    });
    
    document.querySelectorAll('#playlistContent .playlist-item').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(query) ? 'flex' : 'none';
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleTheme() {
    const isHue = document.body.style.filter === 'hue-rotate(180deg)';
    document.body.style.filter = isHue ? '' : 'hue-rotate(180deg)';
}

function showAbout() {
    alert('Defaull7 Player v1.0\n\nPlayer de mídia moderno com interface transparente.\nSuporta Áudio e Vídeo.');
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT') return;
    
    if (e.code === 'Space') { 
        e.preventDefault(); 
        togglePlay(); 
    } else if (e.code === 'ArrowRight') {
        nextTrack();
    } else if (e.code === 'ArrowLeft') {
        previousTrack();
    }
});

// Inicialização
audioPlayer.volume = 0.7;
videoPlayer.volume = 0.7;