let lastUpdateId = 0;
let offlineTimers = {};
const OFFLINE_TIMEOUT = 7000;

function checkMessages() {
    if (!API_URL) return;
    fetch(`${API_URL}/getUpdates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offset: lastUpdateId + 1, timeout: 2 })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok && data.result.length > 0) {
            data.result.forEach(update => {
                lastUpdateId = update.update_id;
                if (update.channel_post && update.channel_post.chat.id === CHANNEL_ID) {
                    const text = update.channel_post.text;
                    document.getElementById("log").innerHTML = `📥 ${text}`;
                    document.getElementById("statusIndicator").textContent = "🟢";
                    // Сбрасываем таймер офлайна
                    if (offlineTimers["last"]) {
                        clearTimeout(offlineTimers["last"]);
                        delete offlineTimers["last"];
                    }
                }
            });
        }
    })
    .catch(err => console.error("Ошибка проверки сообщений:", err));
}

function sendCommand(command) {
    if (!command || !command.trim()) return;
    if (!API_URL) {
        document.getElementById("log").innerHTML = "❌ Конфиг ещё не загружен";
        return;
    }
    
    document.getElementById("log").innerHTML = `⏳ Выполняется...`;
    document.getElementById("cmdInput").value = "";
    
    fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHANNEL_ID, text: command })
    })
    .then(res => res.json())
    .then(data => {
        if (data.ok) {
            offlineTimers["last"] = setTimeout(() => {
                document.getElementById("log").innerHTML = "⚠️ ПК офлайн";
                document.getElementById("statusIndicator").textContent = "🔴";
            }, OFFLINE_TIMEOUT);
        } else {
            document.getElementById("log").innerHTML = `❌ Ошибка: ${data.description}`;
        }
    })
    .catch(err => {
        document.getElementById("log").innerHTML = "⚠️ ПК офлайн";
        document.getElementById("statusIndicator").textContent = "🔴";
    });
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("cmdInput").addEventListener("keydown", function(e) {
        if (e.key === "Enter") sendCommand(this.value);
    });
});
