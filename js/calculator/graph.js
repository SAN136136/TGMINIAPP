// ==================== ГРАФИКИ v2.2 ====================
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
function graphBackspace() { let expr = graphExpressions[graphActiveInput]; graphExpressions[graphActiveInput] = expr.slice(0, -1); document.getElementById("graphInputs").innerHTML = renderGraphInputs(); graphAnimProgress = 0.3; animateGraph(); }
function graphPaste() { navigator.clipboard.readText().then(text => { graphExpressions[graphActiveInput] = text.trim(); document.getElementById("graphInputs").innerHTML = renderGraphInputs(); graphAnimProgress = 0.3; animateGraph(); }).catch(() => { document.getElementById(`graphInput${graphActiveInput}`).focus(); }); }

function clearCanvas() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0A0A14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animateGraph() {
    if (graphAnimFrame) cancelAnimationFrame(graphAnimFrame);
    graphAnimFrame = requestAnimationFrame(() => {
        graphAnimProgress += 0.2;
        if (graphAnimProgress >= 1) {
            graphAnimProgress = 1;
            drawAllGraphs();
        } else {
            drawAllGraphs();
            animateGraph();
        }
    });
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

function drawAllGraphs() {
    const canvas = document.getElementById("graphCanvas");
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
    
    // Сетка
    ctx.strokeStyle = "#1A1A2E";
    ctx.lineWidth = 0.5;
    let gridStep = scale;
    if (gridStep < 15) gridStep = 15;
    if (gridStep > 200) gridStep = 200;
    let labelStep = gridStep;
    while (labelStep < 40) labelStep *= 2;
    
    for (let x = -50; x <= 50; x++) {
        let px = w/2 + x * gridStep + offsetX;
        if (px >= 0 && px <= w) { ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke(); }
    }
    for (let y = -50; y <= 50; y++) {
        let py = h/2 - y * gridStep + offsetY;
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
    let firstX = Math.ceil((-w/2 - offsetX) / labelStep);
    let lastX = Math.floor((w/2 - offsetX) / labelStep);
    for (let x = firstX; x <= lastX; x++) {
        if (x === 0) continue;
        let px = w/2 + x * labelStep + offsetX;
        if (px > 15 && px < w - 15) ctx.fillText(x, px - 8, axisY + 15);
    }
    let firstY = Math.ceil((-h/2 + offsetY) / labelStep);
    let lastY = Math.floor((h/2 + offsetY) / labelStep);
    for (let y = firstY; y <= lastY; y++) {
        if (y === 0) continue;
        let py = h/2 - y * labelStep + offsetY;
        if (py > 15 && py < h - 5) ctx.fillText(y, axisX + 5, py + 4);
    }
    ctx.fillText("0", axisX + 5, axisY + 15);
    ctx.fillText("x", w - 15, axisY - 10);
    ctx.fillText("y", axisX + 10, 15);
    
    // Графики
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
    
    // Следящая точка
    if (graphTracePos && funcs[0]) {
        let x = graphTracePos.x;
        let y;
        try { y = funcs[0](x); } catch(e) { y = null; }
        if (y !== null && isFinite(y)) {
            let px = w/2 + x * scale + offsetX;
            let py = h/2 - y * scale + offsetY;
            ctx.fillStyle = "#FFD700";
            ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 13px sans-serif";
            ctx.fillText(`(${x.toFixed(2)}, ${y.toFixed(2)})`, px + 10, py - 10);
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
    graphAnimProgress = 0.3;
    animateGraph();
}

function onGraphInput(i, value) {
    graphExpressions[i] = value;
    graphAnimProgress = 0.3;
    let letters = value.match(/[a-wzA-WZ]/g);
    if (letters && letters.length > 0) {
        let unique = [...new Set(letters)];
        let html = "";
        unique.forEach(letter => {
            if (graphParams[letter] === undefined) graphParams[letter] = 1;
            html += `
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:3px;">
                    <span style="color:#FFD700; width:20px;">${letter}</span>
                    <input type="range" min="1" max="10" step="0.5" value="${graphParams[letter]}" 
                        oninput="updateParam('${letter}', this.value)"
                        style="flex:1;">
                    <span style="color:#58A6FF; width:30px;">${graphParams[letter]}</span>
                </div>`;
        });
        document.getElementById("graphParams").innerHTML = html;
    } else {
        document.getElementById("graphParams").innerHTML = "";
    }
    animateGraph();
}

function updateParam(letter, value) {
    graphParams[letter] = parseFloat(value);
    let expr = graphExpressions[graphActiveInput];
    onGraphInput(graphActiveInput, expr);
}

// ==================== ЗУМ И ПЕРЕТАСКИВАНИЕ ====================
(function() {
    let canvas = null;
    let lastTouchDist = 0;
    
    function initCanvas() {
        canvas = document.getElementById("graphCanvas");
        if (!canvas) return;
        
        canvas.addEventListener("mousemove", e => {
            if (graphDragging) return;
            let rect = canvas.getBoundingClientRect();
            let scaleW = canvas.width / rect.width;
            let px = (e.clientX - rect.left) * scaleW;
            let x = (px - canvas.width/2 - graphOffsetX) / (graphScale * 20);
            graphTracePos = {x, y: 0};
            drawAllGraphs();
        });
        canvas.addEventListener("mouseleave", () => { graphTracePos = null; drawAllGraphs(); graphDragging = false; });
        canvas.addEventListener("mousedown", e => { graphDragging = true; graphLastX = e.clientX; graphLastY = e.clientY; });
        canvas.addEventListener("mousemove", e => {
            if (!graphDragging) return;
            graphOffsetX += e.clientX - graphLastX;
            graphOffsetY += e.clientY - graphLastY;
            graphLastX = e.clientX; graphLastY = e.clientY;
            graphTracePos = null;
            drawAllGraphs();
        });
        canvas.addEventListener("mouseup", () => { graphDragging = false; });
        canvas.addEventListener("wheel", e => { e.preventDefault(); graphScale *= e.deltaY < 0 ? 1.2 : 0.8; graphScale = Math.max(0.02, Math.min(20, graphScale)); graphTracePos = null; drawAllGraphs(); });
        canvas.addEventListener("touchstart", e => {
            if (e.touches.length === 1) { graphDragging = true; graphLastX = e.touches[0].clientX; graphLastY = e.touches[0].clientY; }
            if (e.touches.length === 2) { graphDragging = false; let dx = e.touches[0].clientX - e.touches[1].clientX; let dy = e.touches[0].clientY - e.touches[1].clientY; lastTouchDist = Math.sqrt(dx*dx+dy*dy); }
        });
        canvas.addEventListener("touchmove", e => {
            if (e.touches.length === 2) { let dx = e.touches[0].clientX - e.touches[1].clientX; let dy = e.touches[0].clientY - e.touches[1].clientY; let dist = Math.sqrt(dx*dx+dy*dy); if (lastTouchDist > 0) { graphScale *= dist / lastTouchDist; graphScale = Math.max(0.02, Math.min(20, graphScale)); } lastTouchDist = dist; graphTracePos = null; drawAllGraphs(); }
            else if (graphDragging && e.touches.length === 1) { graphOffsetX += e.touches[0].clientX - graphLastX; graphOffsetY += e.touches[0].clientY - graphLastY; graphLastX = e.touches[0].clientX; graphLastY = e.touches[0].clientY; graphTracePos = null; drawAllGraphs(); }
        });
        canvas.addEventListener("touchend", () => { graphDragging = false; });
        canvas.addEventListener("dblclick", () => { graphScale = 1; graphOffsetX = 0; graphOffsetY = 0; graphTracePos = null; drawAllGraphs(); });
    }
    
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initCanvas); }
    else { initCanvas(); }
})();
