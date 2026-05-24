// ==================== ГРАФИКИ v1.2 ====================
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
    let cleaned = expr.replace(/^y\s*=\s*/, "");
    
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
    
    // Правильные коэффициенты: 2x → 2*x, но не трогаем Math.xxx
    cleaned = cleaned.replace(/(\d)\(/g, "$1*(");
    cleaned = cleaned.replace(/(\d)x/g, "$1*x");
    cleaned = cleaned.replace(/(\d)Math/g, "$1*Math");
    
    // x без коэффициента: в начале или после оператора
    cleaned = cleaned.replace(/(^|[+\-*(])x/g, "$11*x");
    
    return cleaned;
}

function drawGraph(expr) {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0A0A14";
    ctx.fillRect(0, 0, w, h);
    
    let func;
    try {
        let parsed = parseFunction(expr);
        func = new Function("x", `return ${parsed}`);
        func(0);
    } catch(e) {
        document.getElementById("graphError").innerHTML = "❌ Ошибка в формуле";
        return;
    }
    
    document.getElementById("graphError").innerHTML = "";
    
    let scale = graphScale * 20;
    let offsetX = graphOffsetX;
    let offsetY = graphOffsetY;
    let xMin = (-w/2 - offsetX) / scale;
    let xMax = (w/2 - offsetX) / scale;
    
    // Сетка
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 0.5;
    let gridStep = scale;
    if (gridStep < 15) gridStep = 15;
    if (gridStep > 120) gridStep = 120;
    
    for (let x = -30; x <= 30; x++) {
        let px = w/2 + x * gridStep + offsetX;
        if (px >= 0 && px <= w) {
            ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
        }
    }
    for (let y = -30; y <= 30; y++) {
        let py = h/2 - y * gridStep + offsetY;
        if (py >= 0 && py <= h) {
            ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
        }
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
    let stepX = gridStep;
    let stepY = gridStep;
    if (stepX < 30) { stepX = 30; stepY = 30; }
    
    for (let x = -30; x <= 30; x++) {
        if (x === 0) continue;
        let px = w/2 + x * stepX + offsetX;
        if (px > 15 && px < w - 15) {
            ctx.fillText(x, px - 8, axisY + 15);
        }
    }
    for (let y = -30; y <= 30; y++) {
        if (y === 0) continue;
        let py = h/2 - y * stepY + offsetY;
        if (py > 15 && py < h - 5) {
            ctx.fillText(y, axisX + 5, py + 4);
        }
    }
    ctx.fillText("0", axisX + 5, axisY + 15);
    ctx.fillText("x", w - 15, axisY - 10);
    ctx.fillText("y", axisX + 10, 15);
    
    // График
    ctx.strokeStyle = "#58A6FF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#58A6FF";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    
    let firstPoint = true;
    let totalPoints = 1000;
    
    for (let i = 0; i <= totalPoints; i++) {
        let x = xMin + i * (xMax - xMin) / totalPoints;
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
        
        if (px < -50 || px > w + 50 || py < -50 || py > h + 50) {
            firstPoint = true;
            continue;
        }
        
        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Корни
    findAndDrawRoots(ctx, func, w, h, scale, offsetX, offsetY, xMin, xMax);
}

function findAndDrawRoots(ctx, func, w, h, scale, offsetX, offsetY, xMin, xMax) {
    let roots = [];
    let totalPoints = 2000;
    let prevX = xMin;
    let prevY;
    try { prevY = func(prevX); } catch(e) { prevY = NaN; }
    
    for (let i = 1; i <= totalPoints; i++) {
        let x = xMin + i * (xMax - xMin) / totalPoints;
        let y;
        try { y = func(x); } catch(e) { prevY = NaN; continue; }
        
        if (!isNaN(y) && isFinite(y) && !isNaN(prevY) && isFinite(prevY) && Math.abs(y) < 100) {
            if (prevY * y <= 0) {
                let rootX = x - y * (x - prevX) / (y - prevY);
                roots.push(rootX);
            }
        }
        prevX = x;
        prevY = y;
    }
    
    roots = roots.filter((r, i) => {
        for (let j = 0; j < i; j++) {
            if (Math.abs(r - roots[j]) < 0.05) return false;
        }
        return true;
    });
    
    roots.forEach(root => {
        let px = w/2 + root * scale + offsetX;
        let py = h/2 + offsetY;
        
        if (px > 5 && px < w - 5) {
            ctx.fillStyle = "#FF5555";
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 14px sans-serif";
            let label = `x=${root.toFixed(2)}`;
            let textWidth = ctx.measureText(label).width;
            let labelX = px + 8;
            if (labelX + textWidth > w - 5) labelX = px - textWidth - 8;
            ctx.fillText(label, labelX, py - 8);
        }
    });
}

// ==================== ЗУМ И ПЕРЕТАСКИВАНИЕ ====================
(function() {
    let canvas = null;
    let lastTouchDist = 0;
    
    function initCanvas() {
        canvas = document.getElementById("graphCanvas");
        if (!canvas) return;
        
        canvas.addEventListener("mousedown", e => {
            if (!graphSolved) return;
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
        canvas.addEventListener("mouseleave", () => { graphDragging = false; });
        canvas.addEventListener("wheel", e => {
            if (!graphSolved) return;
            e.preventDefault();
            graphScale *= e.deltaY < 0 ? 1.2 : 0.8;
            graphScale = Math.max(0.05, Math.min(10, graphScale));
            drawGraph(graphExpression);
        });
        
        canvas.addEventListener("touchstart", e => {
            if (!graphSolved) return;
            if (e.touches.length === 1) {
                graphDragging = true;
                graphLastX = e.touches[0].clientX;
                graphLastY = e.touches[0].clientY;
            }
            if (e.touches.length === 2) {
                graphDragging = false;
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
                if (lastTouchDist > 0) {
                    graphScale *= dist / lastTouchDist;
                    graphScale = Math.max(0.05, Math.min(10, graphScale));
                }
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
            if (!graphSolved) return;
            graphScale = 1;
            graphOffsetX = 0;
            graphOffsetY = 0;
            drawGraph(graphExpression);
        });
    }
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCanvas);
    } else {
        initCanvas();
    }
})();
