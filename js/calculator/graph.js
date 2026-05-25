// ==================== ГРАФИКИ v2.6 ====================
let graphExpressions = [""];
let graphActiveInput = 0;
let graphScale = 1;
let graphOffsetX = 0;
let graphOffsetY = 0;
let graphDragging = false;
let graphLastX = 0;
let graphLastY = 0;
let graphParams = {};
let graphTracePos = null;
let graphAnimProgress = 1;
let graphAnimFrame = null;

function switchToGraph() {
    graphExpressions = [""];
    graphActiveInput = 0;
    graphScale = 1;
    graphOffsetX = 0;
    graphOffsetY = 0;
    graphParams = {};
    graphTracePos = null;
    graphAnimProgress = 1;
    document.getElementById("graphInputs").innerHTML = renderGraphInputs();
    document.getElementById("graphParams").innerHTML = "";
    document.getElementById("graphError").innerHTML = "";
    clearCanvas();
}

function renderGraphInputs() {
    let html = "";
    graphExpressions.forEach((expr, i) => {
        html += `
            <div style="display:flex; gap:8px; margin-bottom:5px;">
                <input type="text" id="graphInput${i}" value="${expr}" 
                    style="flex:1; padding:12px; background:#0A0A14; border:2px solid ${i === graphActiveInput ? '#FFD700' : '#3A5A6B'}; color:#FFD700; font-size:16px; border-radius:8px; text-align:center;"
                    onfocus="setActiveGraph(${i})"
                    oninput="onGraphInput(${i}, this.value)">
                ${i === graphExpressions.length - 1 ? 
                    `<button class="calc-btn" onclick="addGraphInput()" style="padding:12px 15px; font-size:18px;">+</button>` : 
                    `<button class="calc-btn calc-btn-clear" onclick="removeGraphInput(${i})" style="padding:12px 15px; font-size:18px;">✕</button>`}
            </div>`;
    });
    return html;
}

function setActiveGraph(i) { graphActiveInput = i; document.getElementById("graphInputs").innerHTML = renderGraphInputs(); }
function addGraphInput() { if (graphExpressions.length >= 3) return; graphExpressions.push(""); graphActiveInput = graphExpressions.length - 1; document.getElementById("graphInputs").innerHTML = renderGraphInputs(); }
function removeGraphInput(i) { if (graphExpressions.length <= 1) return; graphExpressions.splice(i, 1); if (graphActiveInput >= graphExpressions.length) graphActiveInput = graphExpressions.length - 1; document.getElementById("graphInputs").innerHTML = renderGraphInputs(); drawAllGraphs(); }

function graphClear() { graphExpressions = [""]; graphActiveInput = 0; graphScale = 1; graphOffsetX = 0; graphOffsetY = 0; graphParams = {}; graphTracePos = null; graphAnimProgress = 1; document.getElementById("graphInputs").innerHTML = renderGraphInputs(); document.getElementById("graphParams").innerHTML = ""; clearCanvas(); }
function graphBackspace() { let expr = graphExpressions[graphActiveInput]; graphExpressions[graphActiveInput] = expr.slice(0, -1); document.getElementById("graphInputs").innerHTML = renderGraphInputs(); startGraphAnimation(); }
function graphPaste() { navigator.clipboard.readText().then(text => { graphExpressions[graphActiveInput] = text.trim(); document.getElementById("graphInputs").innerHTML = renderGraphInputs(); startGraphAnimation(); }).catch(() => { document.getElementById(`graphInput${graphActiveInput}`).focus(); }); }

function clearCanvas() {
    const canvas = document.getElementById("graphCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0A0A14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Анимация — только для ввода с клавиатуры
function startGraphAnimation() {
    graphAnimProgress = 0;
    if (graphAnimFrame) cancelAnimationFrame(graphAnimFrame);
    animateGraph();
}

function animateGraph() {
    if (graphAnimFrame) cancelAnimationFrame(graphAnimFrame);
    graphAnimFrame = requestAnimationFrame(() => {
        graphAnimProgress += 0.05;
        if (graphAnimProgress >= 1) {
            graphAnimProgress = 1;
            drawAllGraphs();
        } else {
            drawAllGraphs();
            animateGraph();
        }
    });
}

// Мгновенная отрисовка — для ползунков и зума
function drawAllGraphsInstant() {
    graphAnimProgress = 1;
    if (graphAnimFrame) cancelAnimationFrame(graphAnimFrame);
    drawAllGraphs();
}

function parseFunction(expr) {
    let cleaned = expr.replace(/^y\s*=\s*/, "");
    cleaned = cleaned.replace(/−/g, "-");
    cleaned = cleaned.replace(/×/g, "*");
    cleaned = cleaned.replace(/÷/g, "/");
    cleaned = cleaned.replace(/²/g, "**2");
    cleaned = cleaned.replace(/\^2/g, "**2");
    cleaned = cleaned.replace(/(\d)\^(\d)/g, "$1**$2");
    cleaned = cleaned.replace(/\^/g, "**");
    cleaned = cleaned.replace(/√\(/g, "Math.sqrt(");
    cleaned = cleaned.replace(/π/g, "Math.PI");
    cleaned = cleaned.replace(/sin/g, "Math.sin");
    cleaned = cleaned.replace(/cos/g, "Math.cos");
    cleaned = cleaned.replace(/tan/g, "Math.tan");
    cleaned = cleaned.replace(/log/g, "Math.log10");
    cleaned = cleaned.replace(/(\d)\(/g, "$1*(");
    cleaned = cleaned.replace(/(\d)x/g, "$1*x");
    cleaned = cleaned.replace(/(\d)Math/g, "$1*Math");
    cleaned = cleaned.replace(/(^|[+\-*(])x/g, "$11*x");
    
    for (let [key, val] of Object.entries(graphParams)) {
        cleaned = cleaned.replace(new RegExp(key, "g"), val);
    }
    
    return cleaned;
}

function getAdaptiveStep(scale) {
    let rawStep = 40 / scale;
    let magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    let residual = rawStep / magnitude;
    let niceStep;
    if (residual <= 1.5) niceStep = 1;
    else if (residual <= 3.5) niceStep = 2;
    else if (residual <= 7.5) niceStep = 5;
    else niceStep = 10;
    return niceStep * magnitude;
}

function drawAllGraphs() {
    const canvas = document.getElementById("graphCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#0A0A14";
    ctx.fillRect(0, 0, w, h);
    
    let funcs = [];
    let colors = ["#58A6FF", "#FF6B6B", "#FFD93D"];
    
    for (let expr of graphExpressions) {
        if (!expr.trim()) { funcs.push(null); continue; }
        try {
            let parsed = parseFunction(expr);
            let f = new Function("x", `return ${parsed}`);
            f(0);
            funcs.push(f);
        } catch(e) { funcs.push(null); }
    }
    
    if (funcs.every(f => f === null)) { document.getElementById("graphError").innerHTML = ""; return; }
    document.getElementById("graphError").innerHTML = "";
    
    let scale = graphScale * 20;
    let offsetX = graphOffsetX;
    let offsetY = graphOffsetY;
    let xMin = (-w/2 - offsetX) / scale;
    let xMax = (w/2 - offsetX) / scale;
    
    // Адаптивная сетка
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 0.5;
    let gridStep = getAdaptiveStep(scale);
    let gridPixels = gridStep * scale;
    if (gridPixels < 20) gridStep = getAdaptiveStep(scale * 2);
    if (gridPixels > 150) gridStep = getAdaptiveStep(scale / 2);
    gridPixels = gridStep * scale;
    
    let firstGridX = Math.floor((-w/2 - offsetX) / gridPixels);
    let lastGridX = Math.ceil((w/2 - offsetX) / gridPixels);
    for (let i = firstGridX; i <= lastGridX; i++) {
        let px = w/2 + i * gridPixels + offsetX;
        if (px >= 0 && px <= w) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke(); }
    }
    let firstGridY = Math.floor((-h/2 + offsetY) / gridPixels);
    let lastGridY = Math.ceil((h/2 + offsetY) / gridPixels);
    for (let i = firstGridY; i <= lastGridY; i++) {
        let py = h/2 - i * gridPixels + offsetY;
        if (py >= 0 && py <= h) { ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke(); }
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
    let labelStep = gridStep;
    let labelPixels = labelStep * scale;
    while (labelPixels < 50) { labelStep *= 2; labelPixels = labelStep * scale; }
    
    let firstX = Math.ceil((-w/2 - offsetX) / labelPixels);
    let lastX = Math.floor((w/2 - offsetX) / labelPixels);
    for (let x = firstX; x <= lastX; x++) {
        if (x === 0) continue;
        let px = w/2 + x * labelPixels + offsetX;
        if (px > 15 && px < w - 15) ctx.fillText(x * labelStep, px - 8, axisY + 15);
    }
    let firstY = Math.ceil((-h/2 + offsetY) / labelPixels);
    let lastY = Math.floor((h/2 + offsetY) / labelPixels);
    for (let y = firstY; y <= lastY; y++) {
        if (y === 0) continue;
        let py = h/2 - y * labelPixels + offsetY;
        if (py > 15 && py < h - 5) ctx.fillText(y * labelStep, axisX + 5, py + 4);
    }
    ctx.fillText("0", axisX + 5, axisY + 15);
    ctx.fillText("x", w - 15, axisY - 10);
    ctx.fillText("y", axisX + 10, 15);
    
    // Графики с анимацией
    funcs.forEach((func, idx) => {
        if (!func) return;
        
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.lineWidth = 3;
        ctx.shadowColor = colors[idx % colors.length];
        ctx.shadowBlur = 8;
        ctx.beginPath();
        
        let firstPoint = true;
        let totalPoints = Math.floor(2000 * graphAnimProgress);
        if (totalPoints < 2) totalPoints = 2;
        
        for (let i = 0; i <= totalPoints; i++) {
            let x = xMin + i * (xMax - xMin) / 2000;
            let y;
            try { y = func(x); } catch(e) { firstPoint = true; continue; }
            if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e6) { firstPoint = true; continue; }
            let px = w/2 + x * scale + offsetX;
            let py = h/2 - y * scale + offsetY;
            if (px < -100 || px > w + 100 || py < -100 || py > h + 100) { firstPoint = true; continue; }
            if (firstPoint) { ctx.moveTo(px, py); firstPoint = false; }
            else { ctx.lineTo(px, py); }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    });
    
    // Следящая точка — ближайший график к курсору
    if (graphTracePos && funcs.some(f => f !== null)) {
        let x = graphTracePos.x;
        let bestIdx = 0;
        let bestDist = Infinity;
        funcs.forEach((f, idx) => {
            if (!f) return;
            try {
                let y = f(x);
                if (isFinite(y)) {
                    let py = h/2 - y * scale + offsetY;
                    let dist = Math.abs(py - graphTracePos.canvasY);
                    if (dist < bestDist) { bestDist = dist; bestIdx = idx; }
                }
            } catch(e) {}
        });
        
        if (funcs[bestIdx]) {
            let y;
            try { y = funcs[bestIdx](x); } catch(e) { y = null; }
            if (y !== null && isFinite(y)) {
                let px = w/2 + x * scale + offsetX;
                let py = h/2 - y * scale + offsetY;
                ctx.fillStyle = colors[bestIdx % colors.length];
                ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = "#FFF";
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.stroke();
                ctx.fillStyle = colors[bestIdx % colors.length];
                ctx.font = "bold 13px sans-serif";
                let labelX = px + 12;
                let labelY = py - 10;
                if (labelX > w - 80) labelX = px - 100;
                if (labelY < 15) labelY = py + 20;
                ctx.fillText(`(${x.toFixed(2)}, ${y.toFixed(2)})`, labelX, labelY);
            }
        }
    }
    
    // Точки пересечения
    for (let i = 0; i < funcs.length; i++) {
        for (let j = i + 1; j < funcs.length; j++) {
            if (funcs[i] && funcs[j]) {
                findAndDrawIntersections(ctx, funcs[i], funcs[j], w, h, scale, offsetX, offsetY, xMin, xMax);
            }
        }
    }
}

function findAndDrawIntersections(ctx, f1, f2, w, h, scale, offsetX, offsetY, xMin, xMax) {
    let intersections = [];
    let totalPoints = 2000;
    let prevDiff = null, prevX = xMin;
    for (let i = 0; i <= totalPoints; i++) {
        let x = xMin + i * (xMax - xMin) / totalPoints;
        let diff;
        try { diff = f1(x) - f2(x); } catch(e) { prevDiff = null; continue; }
        if (!isNaN(diff) && isFinite(diff) && prevDiff !== null && prevDiff * diff <= 0 && Math.abs(diff) < 100) {
            let rootX = x - diff * (x - prevX) / (diff - prevDiff);
            intersections.push({x: rootX, y: f1(rootX)});
        }
        prevDiff = diff; prevX = x;
    }
    intersections = intersections.filter((p, i) => { for (let j = 0; j < i; j++) { if (Math.abs(p.x - intersections[j].x) < 0.05) return false; } return true; });
    intersections.forEach(p => {
        let px = w/2 + p.x * scale + offsetX;
        let py = h/2 - p.y * scale + offsetY;
        if (px > 5 && px < w - 5 && py > 5 && py < h - 5) {
            ctx.fillStyle = "#FFD700";
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2); ctx.stroke();
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(`(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`, px + 8, py - 8);
        }
    });
}

function graphInputKey(val) {
    let expr = graphExpressions[graphActiveInput];
    if (val === "y" && expr.includes("y")) return;
    if (val === "=" && expr.includes("=")) return;
    graphExpressions[graphActiveInput] += val;
    document.getElementById("graphInputs").innerHTML = renderGraphInputs();
    onGraphInput(graphActiveInput, graphExpressions[graphActiveInput]);
}

function onGraphInput(i, value) {
    graphExpressions[i] = value;
    
    let allLetters = [];
    graphExpressions.forEach(expr => {
        let letters = expr.match(/[a-wzA-WZ]/g);
        if (letters) allLetters = allLetters.concat(letters);
    });
    let unique = [...new Set(allLetters)];
    
    let html = "";
    unique.forEach(letter => {
        if (graphParams[letter] === undefined) graphParams[letter] = 1;
        html += `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
                <span style="color:#FFD700; width:20px;">${letter}</span>
                <input type="range" min="0.5" max="10" step="0.1" value="${graphParams[letter]}" 
                    oninput="updateParam('${letter}', this.value)"
                    style="flex:1;">
                <span style="color:#58A6FF; width:35px;">${graphParams[letter]}</span>
            </div>`;
    });
    document.getElementById("graphParams").innerHTML = html;
    
    startGraphAnimation();
}

// Ползунок — мгновенное обновление, без анимации
function updateParam(letter, value) {
    graphParams[letter] = parseFloat(value);
    
    // Обновляем только число рядом с ползунком
    let paramDivs = document.getElementById("graphParams").children;
    for (let div of paramDivs) {
        let label = div.querySelector("span:first-child");
        if (label && label.textContent === letter) {
            let valueSpan = div.querySelector("span:last-child");
            if (valueSpan) valueSpan.textContent = graphParams[letter];
            break;
        }
    }
    
    // МГНОВЕННАЯ отрисовка — без анимации
    drawAllGraphsInstant():

    // ==================== ЗУМ И ПЕРЕТАСКИВАНИЕ + СЛЕДЯЩАЯ ТОЧКА ====================
(function() {
    let canvas = null;
    let lastTouchDist = 0;
    let mouseIsDown = false;
    let isNearGraph = false; // Флаг: курсор близко к графику?
    
    function initCanvas() {
        canvas = document.getElementById("graphCanvas");
        if (!canvas) return;
        
        // Блокируем скролл на canvas
        canvas.addEventListener("touchstart", e => {
            e.preventDefault();
            if (e.touches.length === 1) {
                mouseIsDown = true;
                graphLastX = e.touches[0].clientX;
                graphLastY = e.touches[0].clientY;
                updateTracePosFromTouch(e.touches[0]);
                // Проверяем, близко ли к графику
                isNearGraph = checkNearGraph();
            }
            if (e.touches.length === 2) {
                mouseIsDown = false;
                isNearGraph = false;
                graphTracePos = null;
                let dx = e.touches[0].clientX - e.touches[1].clientX;
                let dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDist = Math.sqrt(dx*dx+dy*dy);
            }
        }, { passive: false });
        
        canvas.addEventListener("touchmove", e => {
            e.preventDefault();
            if (e.touches.length === 2) {
                let dx = e.touches[0].clientX - e.touches[1].clientX;
                let dy = e.touches[0].clientY - e.touches[1].clientY;
                let dist = Math.sqrt(dx*dx+dy*dy);
                if (lastTouchDist > 0) {
                    graphScale *= dist / lastTouchDist;
                    graphScale = Math.max(0.02, Math.min(20, graphScale));
                }
                lastTouchDist = dist;
                graphTracePos = null;
                drawAllGraphsInstant();
            } else if (mouseIsDown && e.touches.length === 1) {
                if (isNearGraph) {
                    // Близко к графику — только следящая точка
                    updateTracePosFromTouch(e.touches[0]);
                } else {
                    // Далеко от графика — перетаскивание
                    graphOffsetX += e.touches[0].clientX - graphLastX;
                    graphOffsetY += e.touches[0].clientY - graphLastY;
                }
                graphLastX = e.touches[0].clientX;
                graphLastY = e.touches[0].clientY;
                drawAllGraphsInstant();
            }
        }, { passive: false });
        
        canvas.addEventListener("touchend", e => {
            if (e.touches.length === 0) {
                mouseIsDown = false;
                isNearGraph = false;
            }
            drawAllGraphsInstant();
        });
        
        canvas.addEventListener("dblclick", () => {
            graphScale = 1;
            graphOffsetX = 0;
            graphOffsetY = 0;
            graphTracePos = null;
            drawAllGraphsInstant();
        });
        
        // МЫШЬ
        canvas.addEventListener("mousemove", e => {
            let rect = canvas.getBoundingClientRect();
            let scaleW = canvas.width / rect.width;
            let scaleH = canvas.height / rect.height;
            let mouseCanvasX = (e.clientX - rect.left) * scaleW;
            let mouseCanvasY = (e.clientY - rect.top) * scaleH;
            
            // Вычисляем x для следящей точки
            let x = (mouseCanvasX - canvas.width/2 - graphOffsetX) / (graphScale * 20);
            graphTracePos = { x, y: 0, canvasY: mouseCanvasY };
            
            // Проверяем, близко ли к графику
            isNearGraph = checkNearGraph();
            
            if (mouseIsDown) {
                if (isNearGraph) {
                    // Близко к графику — только обновляем следящую точку, не двигаем плоскость
                    // Ничего не делаем с offset
                } else {
                    // Далеко от графика — перетаскивание плоскости
                    graphOffsetX += e.clientX - graphLastX;
                    graphOffsetY += e.clientY - graphLastY;
                }
                graphLastX = e.clientX;
                graphLastY = e.clientY;
            }
            
            drawAllGraphsInstant();
        });
        
        canvas.addEventListener("mouseleave", () => {
            graphTracePos = null;
            mouseIsDown = false;
            isNearGraph = false;
            drawAllGraphsInstant();
        });
        
        canvas.addEventListener("mousedown", e => {
            mouseIsDown = true;
            graphLastX = e.clientX;
            graphLastY = e.clientY;
            // Проверяем близость к графику при нажатии
            let rect = canvas.getBoundingClientRect();
            let scaleW = canvas.width / rect.width;
            let scaleH = canvas.height / rect.height;
            let mouseCanvasY = (e.clientY - rect.top) * scaleH;
            let x = ((e.clientX - rect.left) * scaleW - canvas.width/2 - graphOffsetX) / (graphScale * 20);
            graphTracePos = { x, y: 0, canvasY: mouseCanvasY };
            isNearGraph = checkNearGraph();
        });
        
        canvas.addEventListener("mouseup", () => {
            mouseIsDown = false;
            isNearGraph = false;
        });
        
        canvas.addEventListener("wheel", e => {
            e.preventDefault();
            graphScale *= e.deltaY < 0 ? 1.2 : 0.8;
            graphScale = Math.max(0.02, Math.min(20, graphScale));
            drawAllGraphsInstant();
        }, { passive: false });
    }
    
    // Проверяет, есть ли график в пределах 30 пикселей от курсора
    function checkNearGraph() {
        if (!graphTracePos) return false;
        
        let funcs = [];
        for (let expr of graphExpressions) {
            if (!expr.trim()) { funcs.push(null); continue; }
            try {
                let parsed = parseFunction(expr);
                let f = new Function("x", `return ${parsed}`);
                f(0);
                funcs.push(f);
            } catch(e) { funcs.push(null); }
        }
        
        if (funcs.every(f => f === null)) return false;
        
        let scale = graphScale * 20;
        let offsetY = graphOffsetY;
        let x = graphTracePos.x;
        let canvasY = graphTracePos.canvasY;
        
        for (let f of funcs) {
            if (!f) continue;
            try {
                let y = f(x);
                if (isFinite(y) && Math.abs(y) < 1e6) {
                    let py = canvas.height/2 - y * scale + offsetY;
                    let dist = Math.abs(py - canvasY);
                    if (dist < 30) return true; // 30 пикселей — порог близости
                }
            } catch(e) {}
        }
        return false;
    }
    
    function updateTracePosFromTouch(touch) {
        let rect = canvas.getBoundingClientRect();
        let scaleW = canvas.width / rect.width;
        let scaleH = canvas.height / rect.height;
        let touchCanvasX = (touch.clientX - rect.left) * scaleW;
        let touchCanvasY = (touch.clientY - rect.top) * scaleH;
        let x = (touchCanvasX - canvas.width/2 - graphOffsetX) / (graphScale * 20);
        graphTracePos = { x, y: 0, canvasY: touchCanvasY };
    }
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCanvas);
    } else {
        initCanvas();
    }
})();
}

            
