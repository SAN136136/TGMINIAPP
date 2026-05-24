// ==================== ГРАФИКИ v1.1 ====================
let graphExpression = "";
let graphSolved = false;
let graphScale = 1;
let graphOffsetX = 0;
let graphOffsetY = 0;
let graphDragging = false;
let graphLastX = 0;
let graphLastY = 0;

function switchToGraph() {
    graphExpression = "";
    graphSolved = false;
    graphScale = 1;
    graphOffsetX = 0;
    graphOffsetY = 0;
    document.getElementById("graphInput").value = "";
    document.getElementById("graphCanvas").style.display = "none";
    document.getElementById("graphCalcPad").style.display = "block";
    document.getElementById("graphError").innerHTML = "";
}

function graphInput(val) {
    if (graphSolved) {
        graphExpression = "";
        graphSolved = false;
        document.getElementById("graphCanvas").style.display = "none";
        document.getElementById("graphCalcPad").style.display = "block";
    }
    
    // Защита от двойного "y ="
    if (val === "y" && graphExpression.includes("y")) return;
    if (val === "=" && graphExpression.includes("=")) return;
    
    graphExpression += val;
    document.getElementById("graphInput").value = graphExpression;
}

function graphClear() {
    graphExpression = "";
    graphSolved = false;
    graphScale = 1;
    graphOffsetX = 0;
    graphOffsetY = 0;
    document.getElementById("graphInput").value = "";
    document.getElementById("graphCanvas").style.display = "none";
    document.getElementById("graphCalcPad").style.display = "block";
}

function graphBackspace() {
    graphExpression = graphExpression.slice(0, -1);
    document.getElementById("graphInput").value = graphExpression;
}

function graphPaste() {
    navigator.clipboard.readText().then(text => {
        graphExpression = text.trim();
        document.getElementById("graphInput").value = graphExpression;
    }).catch(() => {
        document.getElementById("graphInput").focus();
    });
}

function graphEdit() {
    graphSolved = false;
    document.getElementById("graphCanvas").style.display = "none";
    document.getElementById("graphCalcPad").style.display = "block";
    document.getElementById("graphInput").value = graphExpression;
}

function graphSolve() {
    const input = document.getElementById("graphInput").value.trim();
    if (!input) return;
    
    graphExpression = input;
    graphSolved = true;
    document.getElementById("graphCalcPad").style.display = "none";
    document.getElementById("graphCanvas").style.display = "block";
    
    drawGraph(graphExpression);
}

function parseFunction(expr) {
    // Убираем "y =" в начале
    let cleaned = expr.replace(/^y\s*=\s*/, "");
    
    // Заменяем Unicode-минус и красивые символы
    cleaned = cleaned.replace(/−/g, "-");
    cleaned = cleaned.replace(/×/g, "*");
    cleaned = cleaned.replace(/÷/g, "/");
    cleaned = cleaned.replace(/²/g, "**2");
    cleaned = cleaned.replace(/√\(/g, "Math.sqrt(");
    cleaned = cleaned.replace(/π/g, "Math.PI");
    cleaned = cleaned.replace(/sin/g, "Math.sin");
    cleaned = cleaned.replace(/cos/g, "Math.cos");
    cleaned = cleaned.replace(/tan/g, "Math.tan");
    cleaned = cleaned.replace(/log/g, "Math.log10");
    
    // Правильно обрабатываем коэффициенты: 2x → 2*x, -3x → -3*x, x → 1*x
    cleaned = cleaned.replace(/(\d)\(/g, "$1*(");  // 2( → 2*(
    cleaned = cleaned.replace(/(\d)x/g, "$1*x");   // 2x → 2*x
    cleaned = cleaned.replace(/(\d)Math/g, "$1*Math"); // 2sin → 2*sin
    
    // Обрабатываем x без коэффициента: +x → +1*x, -x → -1*x, x → 1*x
    cleaned = cleaned.replace(/(?<!\*)x/g, "1*x");  // x → 1*x (если перед x нет *)
    cleaned = cleaned.replace(/\+1\*x/g, "+x");     // +1*x → +x (красивее)
    cleaned = cleaned.replace(/\-1\*x/g, "-x");     // -1*x → -x (красивее)
    cleaned = cleaned.replace(/1\*1\*x/g, "1*x");   // фикс двойной замены
    
    return cleaned;
}

function drawGraph(expr) {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    // Очищаем
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0A0A14";
    ctx.fillRect(0, 0, w, h);
    
    // Парсим функцию
    let func;
    try {
        let parsed = parseFunction(expr);
        console.log("Parsed:", parsed);
        func = new Function("x", `return ${parsed}`);
        // Проверяем, что функция работает
        func(0);
    } catch(e) {
        document.getElementById("graphError").innerHTML = "❌ Ошибка в формуле: " + e.message;
        return;
    }
    
    document.getElementById("graphError").innerHTML = "";
    
    // Масштаб
    let scale = graphScale * 20;
    let offsetX = graphOffsetX;
    let offsetY = graphOffsetY;
    let xMin = (-w/2 - offsetX) / scale;
    let xMax = (w/2 - offsetX) / scale;
    
    // Сетка
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 0.5;
    let gridStep = scale;
    if (gridStep < 10) gridStep = 10;
    if (gridStep > 100) gridStep = 100;
    
    for (let x = -20; x <= 20; x++) {
        let px = w/2 + x * gridStep + offsetX;
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
    }
    for (let y = -20; y <= 20; y++) {
        let py = h/2 - y * gridStep + offsetY;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
    }
    
    // Оси
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    let axisY = h/2 + offsetY;
    let axisX = w/2 + offsetX;
    ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(w, axisY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, h); ctx.stroke();
    
    // Числа на осях
    ctx.fillStyle = "#888";
    ctx.font = "11px sans-serif";
    for (let x = -20; x <= 20; x++) {
        if (x === 0) continue;
        let px = w/2 + x * gridStep + offsetX;
        if (px > 10 && px < w - 10) {
            ctx.fillText(x, px - 8, axisY + 15);
        }
    }
    for (let y = -20; y <= 20; y++) {
        if (y === 0) continue;
        let py = h/2 - y * gridStep + offsetY;
        if (py > 15 && py < h - 5) {
            ctx.fillText(y, axisX + 5, py + 4);
        }
    }
    ctx.fillText("0", axisX + 5, axisY + 15);
    
    // Рисуем график
    ctx.strokeStyle = "#58A6FF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#58A6FF";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    
    let firstPoint = true;
    let step = (xMax - xMin) / 500;
    
    for (let i = 0; i <= 500; i++) {
        let x = xMin + i * step;
        let y;
        try {
            y = func(x);
        } catch(e) {
            firstPoint = true;
            continue;
        }
        
        if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) {
            firstPoint = true;
            continue;
        }
        
        let px = w/2 + x * scale + offsetX;
        let py = h/2 - y * scale + offsetY;
        
        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Находим и рисуем корни
    findAndDrawRoots(ctx, func, w, h, scale, offsetX, offsetY);
}

function findAndDrawRoots(ctx, func, w, h, scale, offsetX, offsetY) {
    let roots = [];
    let xMin = (-w/2 - offsetX) / scale;
    let xMax = (w/2 - offsetX) / scale;
    let step = (xMax - xMin) / 1000;
    
    let prevY;
    try { prevY = func(xMin); } catch(e) { prevY = NaN; }
    
    for (let i = 1; i <= 1000; i++) {
        let x = xMin + i * step;
        let y;
        try { y = func(x); } catch(e) { prevY = NaN; continue; }
        
        if (!isNaN(y) && isFinite(y) && !isNaN(prevY) && isFinite(prevY)) {
            if (prevY * y <= 0 && Math.abs(y) < 50) {
                let rootX = x - y * step / (y - prevY);
                roots.push(rootX);
            }
        }
        prevY = y;
    }
    
    // Убираем дубликаты
    roots = roots.filter((r, i) => {
        for (let j = 0; j < i; j++) {
            if (Math.abs(r - roots[j]) < 0.1) return false;
        }
        return true;
    });
    
    // Рисуем корни
    roots.forEach(root => {
        let px = w/2 + root * scale + offsetX;
        let py = h/2 + offsetY;
        
        if (px > 0 && px < w) {
            ctx.fillStyle = "#FF5555";
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 14px sans-serif";
            ctx.fillText(`x=${root.toFixed(2)}`, px + 8, py - 8);
        }
    });
}

// ==================== ЗУМ И ПЕРЕТАСКИВАНИЕ ====================
(function() {
    let canvas = null;
    let lastTouchDist = 0;
    
    document.addEventListener("DOMContentLoaded", function() {
        canvas = document.getElementById("graphCanvas");
        if (!canvas) return;
        
        // Мышь (ПК)
        canvas.addEventListener("mousedown", e => {
            graphDragging = true;
            graphLastX = e.clientX;
            graphLastY = e.clientY;
        });
        canvas.addEventListener("mousemove", e => {
            if (!graphDragging || !graphSolved) return;
            graphOffsetX += e.clientX - graphLastX;
            graphOffsetY += e.clientY - graphLastY;
            graphLastX = e.clientX;
            graphLastY = e.clientY;
            drawGraph(graphExpression);
        });
        canvas.addEventListener("mouseup", () => { graphDragging = false; });
        canvas.addEventListener("wheel", e => {
            if (!graphSolved) return;
            e.preventDefault();
            graphScale *= e.deltaY < 0 ? 1.2 : 0.8;
            graphScale = Math.max(0.1, Math.min(10, graphScale));
            drawGraph(graphExpression);
        });
        
        // Тач (телефон)
        canvas.addEventListener("touchstart", e => {
            if (e.touches.length === 1) {
                graphDragging = true;
                graphLastX = e.touches[0].clientX;
                graphLastY = e.touches[0].clientY;
            }
            if (e.touches.length === 2) {
                let dx = e.touches[0].clientX - e.touches[1].clientX;
                let dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx*dx + dy*dy);
            }
        });
        canvas.addEventListener("touchmove", e => {
            if (!graphSolved) return;
            if (e.touches.length === 2) {
                let dx = e.touches[0].clientX - e.touches[1].clientX;
                let dy = e.touches[0].clientY - e.touches[1].clientY;
                let dist = Math.sqrt(dx*dx + dy*dy);
                graphScale *= dist / lastTouchDist;
                graphScale = Math.max(0.1, Math.min(10, graphScale));
                lastTouchDist = dist;
                drawGraph(graphExpression);
            } else if (graphDragging && e.touches.length === 1) {
                graphOffsetX += e.touches[0].clientX - graphLastX;
                graphOffsetY += e.touches[0].clientY - graphLastY;
                graphLastX = e.touches[0].clientX;
                graphLastY = e.touches[0].clientY;
                drawGraph(graphExpression);
            }
        });
        canvas.addEventListener("touchend", () => { graphDragging = false; });
        canvas.addEventListener("dblclick", () => {
            graphScale = 1;
            graphOffsetX = 0;
            graphOffsetY = 0;
            drawGraph(graphExpression);
        });
    });
})();
