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
            </div>
            <div class="section-title" style="margin-top:15px;">ШКОЛА</div>
            <div class="buttons">
                <button class="btn btn-schedule" onclick="showFullSchedule()">📅 Расписание</button>
                <button class="btn btn-tram" onclick="showWip('Трамваи')">🚋 Трамваи<span class="wip-badge">WIP</span></button>
                <button class="btn btn-cheatsheet" onclick="showWip('Шпаргалки')">📝 Шпаргалки<span class="wip-badge">WIP</span></button>
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
        `;
    } else if (tab === "school") {
        html = `
            <div class="section-title">📚 ШКОЛА И УЧЁБА</div>
            <div class="buttons">
                <button class="btn btn-schedule" onclick="showFullSchedule()">📅 Расписание</button>
                <button class="btn btn-cheatsheet" onclick="showWip('Шпаргалки')">📝 Шпаргалки<span class="wip-badge">WIP</span></button>
                <button class="btn btn-calc" onclick="showWip('Калькулятор')">🧮 Калькулятор<span class="wip-badge">WIP</span></button>
                <button class="btn btn-tram" onclick="showWip('Трамваи')">🚋 Трамваи<span class="wip-badge">WIP</span></button>
            </div>
            <p class="music-hint">Скоро здесь будут:<br>шпаргалки по предметам,<br>калькулятор и трамваи</p>
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
                <button class="btn btn-calc" onclick="showWip('Калькулятор')">🧮 Калькулятор<span class="wip-badge">WIP</span></button>
                <button class="btn btn-weather" onclick="sendCommand('weather')">🌤 Погода</button>
                <button class="btn btn-news" onclick="sendCommand('news')">📰 Новости</button>
                <button class="btn btn-wip" onclick="showWip('Заметки')">📋 Заметки<span class="wip-badge">WIP</span></button>
            </div>
            <p class="music-hint">Скоро: калькулятор, заметки,<br>очистка ПК и многое другое</p>
        `;
    }
    
    container.innerHTML = html;
}
