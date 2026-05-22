function checkPassword() {
    const pin = document.getElementById("pinInput").value;
    if (pin === APP_PASSWORD) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainScreen").style.display = "flex";
        setGreeting();
        updateCurrentLesson();
        renderTab("main");
        setInterval(updateCurrentLesson, 30000);
        // Автозапрос статуса ПК при входе
        setTimeout(() => sendCommand("status"), 1000);
    } else {
        document.getElementById("loginError").textContent = "Неверный пароль";
        document.getElementById("pinInput").value = "";
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("pinInput").addEventListener("keydown", function(e) {
        if (e.key === "Enter") checkPassword();
    });
});

function setGreeting() {
    const hour = new Date().getHours();
    let text;
    if (hour >= 6 && hour < 12) text = "Доброе утро, сэр!";
    else if (hour >= 12 && hour < 18) text = "Добрый день, сэр!";
    else if (hour >= 18 && hour < 23) text = "Добрый вечер, сэр!";
    else text = "Доброй ночи, сэр!";
    document.getElementById("greeting").textContent = text;
}
