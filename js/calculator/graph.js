// ==================== ГРАФИКИ v1.0 ====================
let graphExpression = "";
let graphSolved = false;

function switchToGraph() {
    graphExpression = "";
    graphSolved = false;
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
    graphExpression += val;
    document.getElementById("graphInput").value = graphExpression;
}

function graphClear() {
    graphExpression = "";
    graphSolved = false;
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

function graphSolve() {
    const input = document.getElementById("graphInput").value.trim();
    if (!input) return;
    
   // Убираем "y =" в начале, если есть
    graphExpression = input.replace(/^y\s*=\s*/, "");
    graphSolved = true;
    document.getElementById("graphCalcPad").style.display = "none";
    document.getElementById("graphCanvas").style.display = "block";
    
    drawGraph(input);
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
    
    // Сетка
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
        let x = i * w / 20;
        let y = i * h / 20;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    // Оси
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    // Ось X
    ctx.beginPath(); ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); ctx.stroke();
    // Ось Y
    ctx.beginPath(); ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); ctx.stroke();
    
    // Парсим функцию
    let func;
    try {
        func = new Function("x", `return ${expr.replace(/\^/g, "**").replace(/x/g, "(x)").replace(/−/g, "-").replace(/√/g, "Math.sqrt").replace(/sin/g, "Math.sin").replace(/cos/g, "Math.cos").replace(/tan/g, "Math.tan").replace(/log/g, "Math.log10").replace(/π/g, "Math.PI").replace(/²/g, "**2")}`);
    } catch(e) {
        document.getElementById("graphError").innerHTML = "❌ Ошибка в формуле";
        return;
    }
    
    // Рисуем график
    ctx.strokeStyle = "#58A6FF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#58A6FF";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    
    let firstPoint = true;
    for (let px = 0; px <= w; px++) {
        let x = (px - w/2) / (w/20);  // x от −10 до 10
        let y = func(x);
        
        if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) {
            firstPoint = true;
            continue;
        }
        
        let py = h/2 - y * (h/20);
        
        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Находим корни (только для многочленов)
    findAndDrawRoots(ctx, func, w, h);
}

function findAndDrawRoots(ctx, func, w, h) {
    let roots = [];
    let prevY = func(-10);
    
    for (let px = 1; px <= w; px++) {
        let x = (px - w/2) / (w/20);
        let y = func(x);
        
        // Пересечение оси X
        if (!isNaN(y) && isFinite(y) && prevY * y <= 0 && Math.abs(y) < 50) {
            let rootX = x - y * (0.01) / (func(x+0.01) - y);
            roots.push(rootX);
        }
        prevY = y;
    }
    
    // Рисуем корни
    ctx.fillStyle = "#FF5555";
    roots.forEach(root => {
        let px = w/2 + root * (w/20);
        let py = h/2;
        
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Подпись
        ctx.fillStyle = "#FFD700";
        ctx.font = "14px sans-serif";
        ctx.fillText(`x=${root.toFixed(2)}`, px + 8, py - 8);
        ctx.fillStyle = "#FF5555";
    });
}
