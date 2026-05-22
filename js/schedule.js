let scheduleData = null;

fetch('schedule.json')
    .then(response => response.json())
    .then(data => {
        scheduleData = data;
        console.log('Расписание загружено');
    })
    .catch(err => console.error('Ошибка загрузки расписания:', err));

function getCurrentLesson() {
    if (!scheduleData) return null;
    const now = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const day = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const daySchedule = scheduleData[day];
    if (!daySchedule) return null;
    for (let [num, lesson] of Object.entries(daySchedule)) {
        const bell = scheduleData.bells[num];
        if (!bell) continue;
        const [startH, startM] = bell.start.split(":").map(Number);
        const [endH, endM] = bell.end.split(":").map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        if (currentTime >= startTime && currentTime <= endTime) {
            return { num, subject: lesson.subject, room: lesson.room, teacher: lesson.teacher, end: bell.end, start: bell.start };
        }
    }
    return null;
}

function getNextLesson() {
    if (!scheduleData) return null;
    const now = new Date();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const day = days[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const daySchedule = scheduleData[day];
    if (!daySchedule) return null;
    for (let [num, lesson] of Object.entries(daySchedule)) {
        const bell = scheduleData.bells[num];
        if (!bell) continue;
        const [startH, startM] = bell.start.split(":").map(Number);
        const startTime = startH * 60 + startM;
        if (currentTime < startTime) {
            return { num, subject: lesson.subject, room: lesson.room, teacher: lesson.teacher, start: bell.start, end: bell.end };
        }
    }
    return null;
}

function updateCurrentLesson() {
    const current = getCurrentLesson();
    const next = getNextLesson();
    const container = document.getElementById("currentLesson");
    if (current && current.subject !== "---") {
        container.style.display = "block";
        document.getElementById("lessonSubject").textContent = `📚 ${current.num}-й урок: ${current.subject}`;
        document.getElementById("lessonDetails").textContent = `Каб. ${current.room} | ${current.teacher} | ${current.start}-${current.end}`;
        container.onclick = function() { showLessonDetail(current); };
    } else if (next && next.subject !== "---") {
        container.style.display = "block";
        document.getElementById("lessonSubject").textContent = `⏰ Далее: ${next.subject}`;
        document.getElementById("lessonDetails").textContent = `${next.num}-й урок | Каб. ${next.room} | ${next.start}-${next.end}`;
        container.onclick = function() { showLessonDetail(next); };
    } else {
        container.style.display = "none";
    }
}

function showFullSchedule() {
    if (!scheduleData) {
        document.getElementById("log").innerHTML = "❌ Расписание не загружено";
        return;
    }
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    let html = "";
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    const tomorrowIndex = (todayIndex + 1) % 6;
    const daysToShow = [todayIndex, tomorrowIndex];
    
    for (let idx of daysToShow) {
        if (idx >= 6) continue;
        const dayKey = days[idx];
        const daySchedule = scheduleData[dayKey];
        if (!daySchedule) continue;
        html += `<div class="day-block"><div class="day-title">${dayNames[idx]}</div>`;
        for (let [num, lesson] of Object.entries(daySchedule)) {
            const bell = scheduleData.bells[num];
            const timeStr = bell ? `${bell.start}-${bell.end}` : "???";
            if (lesson.subject === "---") continue;
            html += `
                <div class="lesson-row" onclick="showLessonDetail({num: '${num}', subject: '${lesson.subject}', room: '${lesson.room}', teacher: '${lesson.teacher}', start: '${bell ? bell.start : "???"}', end: '${bell ? bell.end : "???"}'})">
                    <span class="lesson-num">${num}</span>
                    <span class="lesson-subj">${lesson.subject}</span>
                    <span class="lesson-time">${timeStr}</span>
                    <span class="lesson-room">${lesson.room}</span>
                </div>`;
        }
        html += `</div>`;
    }
    document.getElementById("scheduleContent").innerHTML = html;
    document.getElementById("scheduleModal").style.display = "flex";
}

function closeSchedule() {
    document.getElementById("scheduleModal").style.display = "none";
}

function showLessonDetail(lesson) {
    const subjectMap = {
        "Алгебра": "algebra",
        "Геометрия": "geometry",
        "Физика": "physics",
        "Химия": "chemistry",
        "Информатика": "informatics",
        "История": "history",
        "Биология": "biology",
        "География": "geography",
        "Русский язык": "russian",
        "Литература": "literature",
        "Английский": "english",
        "ОБЗР": "obzr",
        "Физкультура": "pe",
        "Труд": "labour",
        "Музыка": "music"
    };
    
    const subjectKey = subjectMap[lesson.subject] || lesson.subject.toLowerCase().replace(/ /g, "_");
    
    document.getElementById("lessonDetailTitle").textContent = `📚 ${lesson.subject}`;
    document.getElementById("lessonDetailContent").innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Номер урока</div>
            <div class="detail-value">${lesson.num}-й урок</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Время</div>
            <div class="detail-value">${lesson.start} – ${lesson.end}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Кабинет</div>
            <div class="detail-value">${lesson.room}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Учитель</div>
            <div class="detail-value">${lesson.teacher}</div>
        </div>
        <div class="detail-row" style="text-align:center; padding-top:15px;">
            <span class="detail-link" onclick="openCheatsheet('${subjectKey}')">📝 Открыть шпаргалки</span>
        </div>
    `;
    document.getElementById("lessonDetailModal").style.display = "flex";
}

function closeLessonDetail() {
    document.getElementById("lessonDetailModal").style.display = "none";
}

function openCheatsheet(subjectKey) {
    closeSchedule();
    closeLessonDetail();
    document.getElementById("log").innerHTML = `📝 Шпаргалки: ${subjectKey} (в разработке)`;
    // Переключаем на вкладку "Школа"
    switchTab('school');
}
