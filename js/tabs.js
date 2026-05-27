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
                <button class="btn btn-weather" onclick="sendCommand('weather')">🌤 Погода</button>
                <button class="btn btn-news" onclick="sendCommand('news')">📰 Новости</button>
                <button class="btn btn-camera" onclick="sendCommand('снимок')">📸 Снимок</button>
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
            <div class="section-title">УПРАВЛЕНИЕ МУЗЫКОЙ</div>
            <div class="buttons">
                <button class="btn btn-music" onclick="sendCommand('music_play')">▶ Плей / Пауза</button>
                <button class="btn btn-music-next" onclick="sendCommand('music_next')">⏭ Следующий</button>
                <button class="btn btn-music-prev" onclick="sendCommand('music_prev')">⏮ Предыдущий</button>
            </div>
            <p class="music-hint">Работает с любым плеером<br>(ВК, YouTube Music, Spotify, AIMP)</p>
        `;
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

// ==================== ТРАМВАИ ====================
function openTramWindow() {
    // Создаём модальное окно
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
    
    // Ифрейм с tram.html
    const iframe = document.createElement('iframe');
    iframe.src = 'tram.html';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    
    // Кнопка закрытия
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
// ==================== МОДАЛЬНОЕ ОКНО С ФОТО ====================

// Проверяем появление новых фото в логе
function checkForPhoto() {
    const log = document.getElementById('log');
    if (!log) return;
    
    const logText = log.innerHTML;
    if (logText.includes('/show_photo')) {
        const match = logText.match(/\/show_photo\s+(.+)/);
        if (match) {
            const fileId = match[1].trim();
            openPhotoModal(fileId);
            // Очищаем команду из лога
            log.innerHTML = logText.replace(/\/show_photo\s+\S+/, '📸 Фото получено');
        }
    }
}

// Загружаем токен бота из конфига
let botToken = '';
fetch('config.json')
    .then(res => res.json())
    .then(cfg => {
        botToken = cfg.telegram?.server_bot_token || '';
    })
    .catch(() => {});

function openPhotoModal(fileId) {
    // Удаляем старое окно, если есть
    const oldModal = document.getElementById('photoModal');
    if (oldModal) document.body.removeChild(oldModal);
    
    // Создаём модальное окно
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
    
    // Заглушка на время загрузки
    const img = document.createElement('img');
    img.src = `https://api.telegram.org/file/bot${botToken}/${fileId}`;
    img.style.cssText = `
        max-width: 95%;
        max-height: 75vh;
        border-radius: 12px;
        object-fit: contain;
    `;
    img.onerror = function() {
        // Пробуем получить URL файла через getFile
        fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) {
                    img.src = `https://api.telegram.org/file/bot${botToken}/${data.result.file_path}`;
                } else {
                    img.alt = 'Не удалось загрузить фото';
                }
            });
    };
    
    // Подпись
    const caption = document.createElement('div');
    caption.textContent = '📸 Снимок с камеры';
    caption.style.cssText = `
        color: #FFD700;
        font-size: 18px;
        margin-top: 16px;
        font-weight: bold;
    `;
    
    // Кнопка закрытия
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
        transition: all 0.2s;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.background = '#E55';
    closeBtn.onmouseleave = () => closeBtn.style.background = '#FF6B6B';
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    // Клик вне фото — закрыть
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

// Проверяем логи каждые 2 секунды
setInterval(checkForPhoto, 2000);
