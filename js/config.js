let BOT_TOKEN = "";
let CHANNEL_ID = "";
let API_URL = "";
let APP_PASSWORD = "пельмень"; // Значение по умолчанию

fetch('config.json')
    .then(response => response.json())
    .then(config => {
        BOT_TOKEN = config.telegram.client_bot_token;
        CHANNEL_ID = config.telegram.channel_id;
        API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
        // Пароль из конфига (если есть)
        if (config.app && config.app.password) {
            APP_PASSWORD = config.app.password;
        }
        console.log('Конфиг загружен');
        setInterval(checkMessages, 3000);
    })
    .catch(err => {
        console.error('Ошибка загрузки конфига:', err);
        document.getElementById('log').innerHTML = '❌ Ошибка загрузки конфига';
    });
