let activeTab = "main";

function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");
    renderTab(tab);
}

function showWip(feature) {
    document.getElementById("log").innerHTML = `🚧 ${feature} — в разработке`;
}

function renderTab(tab) {
    const container = document.getElementById("tabContent");
    let html = "";
    
    if (tab === "main") {
        html = `
            <div class="section-title">БЫСТРЫЕ ДЕЙСТВИЯ</div>
            <div class="buttons">
                <button class="btn btn-ping" onclick="sendCommand('ping')">🟢 Пинг</button>
                <button class="btn btn-status" onclick="sendCommand('status')">📊 Статус ПК</button>
                <button class="btn btn-camera" onclick="sendCommand('снимок')">📸 Снимок</button>
                <button class="btn btn-weather" onclick="sendCommand('weather')">🌤 Погода</button>
                <button class="btn btn-news" onclick="sendCommand('news')">📰 Новости</button>
            </div>
            <div class="section-title" style="margin-top:15px;">ШКОЛА</div>
            <div class="buttons">
                <button class="btn btn-schedule" onclick="showFullSchedule()">📅 Расписание</button>
                <button class="btn btn-tram" onclick="openTramWindow()">🚋 Трамваи</button>
                <button class="btn btn-cheatsheet" onclick="openCheatsheetMenu()">📝 Шпаргалки</button>
            </div>
        `;
    } else if (tab === "control") {
        html = `
            <div class="section-title">ЗАПУСК</div>
            <div class="buttons">
                <button class="btn btn-ue5" onclick="sendCommand('launch_ue5')">🚀 Анрил</button>
                <button class="btn btn-wip" onclick="sendCommand('discord')">💬 Дискорд</button>
            </div>
            <div class="section-title" style="margin-top:15px;">ПИТАНИЕ</div>
            <div class="buttons">
                <button class="btn btn-shutdown" onclick="sendCommand('shutdown')">⏻ Выкл ПК</button>
                <button class="btn btn-cancel" onclick="sendCommand('cancel_shutdown')">❌ Отмена</button>
            </div>
            <div class="section-title" style="margin-top:15px;">ГОРОД</div>
            <div class="buttons">
                <button class="btn btn-tram" onclick="openTramWindow()">🚋 Трамваи</button>
            </div>
        `;
    } else if (tab === "school") {
        html = `
            <div class="section-title">📚 ШКОЛА И УЧЁБА</div>
            <div class="buttons">
                <button class="btn btn-schedule" onclick="showFullSchedule()">📅 Расписание</button>
                <button class="btn btn-cheatsheet" onclick="openCheatsheetMenu()">📝 Шпаргалки</button>
                <button class="btn btn-tram" onclick="openTramWindow()">🚋 Трамваи</button>
                <button class="btn btn-calc" onclick="openCalculator()">🧮 Калькулятор</button>
            </div>
            <p class="music-hint">Скоро здесь будут:<br>калькулятор и трамваи</p>
        `;
    } else if (tab === "music") {
        html = `
            <div class="section-title">🎵 СЕЙЧАС ИГРАЕТ</div>
            <div class="now-playing-card" id="nowPlayingCard">
                <div class="np-art" id="npArt">🎵</div>
                <div class="np-info">
                    <div class="np-title" id="npTitle">Нажми «Обновить»</div>
                    <div class="np-artist" id="npArtist">чтобы увидеть трек</div>
                    <div class="np-album" id="npAlbum"></div>
                    <div class="np-time" id="npTime">—</div>
                    <div class="np-progress-bar">
                        <div class="np-progress-fill" id="npProgress" style="width:0%"></div>
                    </div>
                </div>
            </div>
            <div class="section-title" style="margin-top:15px;">УПРАВЛЕНИЕ</div>
            <div class="buttons">
                <button class="btn btn-music" onclick="sendCommand('music_prev')">⏮</button>
                <button class="btn btn-music" onclick="sendCommand('music_play')">▶️</button>
                <button class="btn btn-music" onclick="sendCommand('music_next')">⏭</button>
            </div>
            <button class="btn btn-refresh-music" onclick="updateMusicInfo()" style="width:100%;margin-top:8px;background:#3A5A6B;color:#FFF;padding:12px;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">🔄 Обновить</button>
            <p class="music-hint" style="margin-top:10px;">Работает с VK, Spotify, YouTube Music и другими плеерами</p>
        `;
        // Автоматически запрашиваем трек при открытии вкладки
        setTimeout(() => sendCommand('трек'), 300);
    } else if (tab === "tools") {
        html = `
            <div class="section-title">ИНСТРУМЕНТЫ</div>
            <div class="buttons">
                <button class="btn btn-weather" onclick="sendCommand('weather')">🌤 Погода</button>
                <button class="btn btn-news" onclick="sendCommand('news')">📰 Новости</button>
                <button class="btn btn-wip" onclick="showWip('Заметки')">📋 Заметки<span class="wip-badge">WIP</span></button>
                <button class="btn btn-calc" onclick="openCalculator()">🧮 Калькулятор</button>
            </div>
            <p class="music-hint">Скоро: калькулятор, заметки,<br>очистка ПК и многое другое</p>
        `;
    }
    
    container.innerHTML = html;
}

// ==================== МУЗЫКА ====================
function updateMusicInfo() {
    sendCommand('трек');
}

function checkForMusicUpdate() {
    const log = document.getElementById('log');
    if (!log) return;

    const logText = log.innerHTML;
    if (logText.includes('🎵')) {
        const titleMatch = logText.match(/<b>(.+?)<\/b>/);
        const artistMatch = logText.match(/👤 (.+?)(?:\n|$)/);
        const timeMatch = logText.match(/⏱ (.+?)(?:\n|$)/);
        const statusMatch = logText.match(/(▶️|⏸)/);

        if (titleMatch) {
            const title = titleMatch[1];
            const artist = artistMatch ? artistMatch[1] : '';
            const timeStr = timeMatch ? timeMatch[1] : '0:00 / 0:00';
            const isPlaying = statusMatch ? statusMatch[1] === '▶️' : false;

            let position = 0, duration = 0;
            if (timeStr) {
                const parts = timeStr.split(' / ');
                if (parts.length === 2) {
                    position = parseTime(parts[0]);
                    duration = parseTime(parts[1]);
                }
            }
            updateNowPlayingCard(artist, title, '', position, duration, isPlaying);
        }
    }
}

function updateNowPlayingCard(artist, title, album, position, duration, isPlaying) {
    const titleEl = document.getElementById('npTitle');
    const artistEl = document.getElementById('npArtist');
    const albumEl = document.getElementById('npAlbum');
    const timeEl = document.getElementById('npTime');
    const progressEl = document.getElementById('npProgress');
    const artEl = document.getElementById('npArt');
    
    if (titleEl) titleEl.textContent = title || '—';
    if (artistEl) artistEl.textContent = artist || '';
    if (albumEl) albumEl.textContent = album ? '💿 ' + album : '';
    
    if (timeEl) {
        if (position !== undefined && duration !== undefined && duration > 0) {
            const fmt = (s) => { const m = Math.floor(s/60); const sec = Math.floor(s%60); return m + ':' + (sec<10?'0':'') + sec; };
            timeEl.textContent = (isPlaying ? '▶️ ' : '⏸ ') + fmt(position) + ' / ' + fmt(duration);
        } else {
            timeEl.textContent = isPlaying ? '▶️ Играет' : '⏸ Пауза';
        }
    }
    
    if (progressEl && duration > 0) {
        const pct = Math.min(100, Math.max(0, (position / duration) * 100));
        progressEl.style.width = pct + '%';
    }
    
    if (artEl) {
        artEl.textContent = isPlaying ? '🎶' : '⏸';
    }
}

function parseTime(str) {
    const parts = str.split(':');
    return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 0;
}

// Проверяем обновления музыки каждые 3 секунды
setInterval(checkForMusicUpdate, 3000);

// ==================== ТРАМВАИ ====================
function openTramWindow() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.style.display = 'none';
    
    const mainScreen = document.getElementById('mainScreen');
    if (mainScreen) mainScreen.style.display = 'block';
    
    const modal = document.createElement('div');
    modal.id = 'tramModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0A0A14;
        z-index: 9999;
        overflow-y: auto;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.src = 'tram/map.html';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: fixed;
        top: 12px;
        right: 12px;
        z-index: 10000;
        width: 40px;
        height: 40px;
        background: #FF6B6B;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
        document.body.removeChild(closeBtn);
    };
    
    modal.appendChild(iframe);
    document.body.appendChild(modal);
    document.body.appendChild(closeBtn);
}

// ==================== МОДАЛЬНОЕ ОКНО С ФОТО ====================
function checkForPhoto() {
    const log = document.getElementById('log');
    if (!log) return;
    
    const logText = log.innerHTML;
    
    if (logText.includes('/show_photo')) {
        let match = logText.match(/\/show_photo\s+(https?:\/\/\S+)/);
        if (!match) {
            match = logText.match(/\/show_photo\s+(.+)/);
        }
        
        if (match) {
            const url = match[1].trim();
            openPhotoModal(url);
            document.getElementById('log').innerHTML = logText.replace(/\/show_photo\s+\S+/, '📸 Фото получено');
        }
    }
}

function openPhotoModal(fileUrl) {
    const oldModal = document.getElementById('photoModal');
    if (oldModal) document.body.removeChild(oldModal);
    
    const modal = document.createElement('div');
    modal.id = 'photoModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;
    
    const loading = document.createElement('div');
    loading.textContent = 'Загрузка фото...';
    loading.style.cssText = 'color: #FFD700; font-size: 18px; margin-bottom: 16px;';
    modal.appendChild(loading);
    
    const img = document.createElement('img');
    img.style.cssText = `
        max-width: 95%;
        max-height: 75vh;
        border-radius: 12px;
        object-fit: contain;
        display: none;
    `;
    
    img.onload = function() {
        loading.style.display = 'none';
        img.style.display = 'block';
    };
    
    img.onerror = function() {
        loading.textContent = '❌ Не удалось загрузить фото';
        loading.style.color = '#FF6B6B';
    };
    
    img.src = fileUrl;
    
    const caption = document.createElement('div');
    caption.textContent = '📸 Снимок с камеры';
    caption.style.cssText = `
        color: #FFD700;
        font-size: 18px;
        margin-top: 16px;
        font-weight: bold;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Закрыть';
    closeBtn.style.cssText = `
        margin-top: 20px;
        padding: 14px 40px;
        background: #FF6B6B;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
    `;
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
    
    modal.appendChild(img);
    modal.appendChild(caption);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
}

setInterval(checkForPhoto, 2000);

// ==================== МЕНЮ ШПАРГАЛОК ====================
function openCheatsheetMenu() {
    if (!window.cheatsheetData) {
        document.getElementById("log").innerHTML = "📝 Загружаю шпаргалки...";
        fetch('cheatsheets.json')
            .then(res => res.json())
            .then(data => {
                window.cheatsheetData = data;
                showCheatsheetMenuModal();
            })
            .catch(err => {
                document.getElementById("log").innerHTML = "❌ Ошибка загрузки шпаргалок";
            });
    } else {
        showCheatsheetMenuModal();
    }
}

function showCheatsheetMenuModal() {
    const data = window.cheatsheetData;
    if (!data) {
        document.getElementById("log").innerHTML = "❌ Шпаргалки не загружены";
        return;
    }
    
    let html = `<h2>📝 Шпаргалки</h2>`;
    html += `<p style="color:#888; font-size:12px; margin-bottom:15px; text-align:center;">Выбери предмет</p>`;
    html += `<div class="buttons" style="grid-template-columns: 1fr 1fr;">`;
    
    for (let [key, subject] of Object.entries(data)) {
        const hasContent = subject.sections && subject.sections.length > 0;
        const badge = hasContent ? "" : `<span class="wip-badge">WIP</span>`;
        html += `
            <button class="btn" style="background:#3A5A6B;" 
                onclick="openCheatsheet('${key}')">
                ${subject.icon} ${subject.name}${badge}
            </button>`;
    }
    
    html += `</div>`;
    
    document.getElementById("cheatsheetContent").innerHTML = html;
    document.getElementById("cheatsheetModal").style.display = "flex";
}
