// ==================== КАЛЬКУЛЯТОР v3.0 ====================
let calcExpression = "";
let calcHistory = [];
let calcShowHistory = false;
let calcMode = "basic";
let calcShowTrig = false;

function openCalculator() {
    document.getElementById("calcModal").style.display = "flex";
    document.getElementById("calcDisplay").textContent = "0";
    document.getElementById("calcResult").textContent = "";
    calcExpression = "";
    calcShowHistory = false;
    calcShowTrig = false;
    document.getElementById("calcHistory").style.display = "none";
    document.getElementById("calcTrigRow").style.display = "none";
    document.getElementById("calcGeoInputs").style.display = "none";
    document.getElementById("calcPhysInputs").style.display = "none";
    document.getElementById("calcEqInputs").style.display = "none";
    document.getElementById("calcConverterOutput").style.display = "none";
    document.getElementById("calcMainButtons").style.display = "grid";
    document.getElementById("calcExtraBtns").style.display = "grid";
    document.getElementById("calcEquationBtns").style.display = "none";
    switchCalcMode("basic");
}

function closeCalc() {
    document.getElementById("calcModal").style.display = "none";
}

function calcInput(value) {
    if (calcExpression === "" && "0123456789".includes(value)) {
        calcExpression = value;
    } else {
        calcExpression += value;
    }
    updateCalcDisplay();
    liveCalcResult();
}

function updateCalcDisplay() {
    let displayExpr = calcExpression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−")
        .replace(/sqrt\(/g, "√(")
        .replace(/\^2/g, "²")
        .replace(/pi/g, "π");
    document.getElementById("calcDisplay").textContent = displayExpr || "0";
}

function liveCalcResult() {
    if (!calcExpression) {
        document.getElementById("calcResult").textContent = "";
        return;
    }
    let expr = prepareExpression(calcExpression);
    try {
        let result = eval(expr);
        if (result !== undefined && !isNaN(result) && isFinite(result)) {
            result = Math.round(result * 1000000) / 1000000;
            document.getElementById("calcResult").textContent = "= " + result;
        } else {
            document.getElementById("calcResult").textContent = "";
        }
    } catch (e) {
        document.getElementById("calcResult").textContent = "";
    }
}

function prepareExpression(expr) {
    expr = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, String(Math.PI))
        .replace(/²/g, "**2")
        .replace(/\^/g, "**");
    expr = expr.replace(/sin\(/g, "Math.sin(Math.PI/180*");
    expr = expr.replace(/cos\(/g, "Math.cos(Math.PI/180*");
    expr = expr.replace(/tan\(/g, "Math.tan(Math.PI/180*");
    expr = expr.replace(/log\(/g, "Math.log10(");
    expr = expr.replace(/sqrt\(/g, "Math.sqrt(");
    return expr;
}

function calcCalculate() {
    if (!calcExpression) return;
    let expr = prepareExpression(calcExpression);
    try {
        let result = eval(expr);
        if (result === undefined || isNaN(result) || !isFinite(result)) {
            document.getElementById("calcDisplay").textContent = "Ошибка";
            document.getElementById("calcResult").textContent = "";
        } else {
            result = Math.round(result * 1000000) / 1000000;
            document.getElementById("calcDisplay").textContent = result;
            document.getElementById("calcResult").textContent = "";
            calcHistory.unshift({ expr: calcExpression, result: result });
            if (calcHistory.length > 20) calcHistory.pop();
            calcExpression = String(result);
        }
    } catch (e) {
        document.getElementById("calcDisplay").textContent = "Ошибка";
        document.getElementById("calcResult").textContent = "";
    }
}

function calcClear() {
    calcExpression = "";
    document.getElementById("calcDisplay").textContent = "0";
    document.getElementById("calcResult").textContent = "";
}

function calcBackspace() {
    // Удаляем как обычный бэкспейс — по одному символу
    calcExpression = calcExpression.slice(0, -1);
    updateCalcDisplay();
    liveCalcResult();
}

function calcBrackets() {
    calcExpression += "()";
    updateCalcDisplay();
    liveCalcResult();
}

function calcToggleTrig() {
    calcShowTrig = !calcShowTrig;
    document.getElementById("calcTrigRow").style.display = calcShowTrig ? "grid" : "none";
}

function calcToggleHistory() {
    calcShowHistory = !calcShowHistory;
    if (calcShowHistory) {
        renderCalcHistory();
        document.getElementById("calcHistory").style.display = "block";
    } else {
        document.getElementById("calcHistory").style.display = "none";
    }
}

function calcClearHistory() {
    calcHistory = [];
    renderCalcHistory();
}

function renderCalcHistory() {
    const container = document.getElementById("calcHistory");
    if (calcHistory.length === 0) {
        container.innerHTML = "<p style='color:#666; text-align:center;'>История пуста</p>";
        return;
    }
    let html = "<button class='calc-history-clear' onclick='calcClearHistory()'>🗑 Очистить историю</button>";
    calcHistory.forEach((item) => {
        html += `<div class="calc-history-item" onclick="calcExpression='${item.result}'; updateCalcDisplay(); liveCalcResult();">${item.expr} = ${item.result}</div>`;
    });
    container.innerHTML = html;
}

// ==================== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ ====================
function switchCalcMode(mode) {
    calcMode = mode;
    document.querySelectorAll(".calc-mode-btn").forEach(btn => btn.classList.remove("active"));
    let activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    
    // Скрываем всё
    document.getElementById("calcMainButtons").style.display = "none";
    document.getElementById("calcExtraBtns").style.display = "none";
    document.getElementById("calcEquationBtns").style.display = "none";
    document.getElementById("calcGeoInputs").style.display = "none";
    document.getElementById("calcPhysInputs").style.display = "none";
    document.getElementById("calcEqInputs").style.display = "none";
    document.getElementById("calcConverterOutput").style.display = "none";
    document.getElementById("calcTrigRow").style.display = "none";
    calcShowTrig = false;
    
    if (mode === "basic") {
        document.getElementById("calcMainButtons").style.display = "grid";
        document.getElementById("calcExtraBtns").style.display = "grid";
    } else if (mode === "equations") {
        document.getElementById("calcEqInputs").style.display = "block";
        document.getElementById("calcEquationBtns").style.display = "grid";
    } else if (mode === "geometry") {
        document.getElementById("calcGeoInputs").style.display = "block";
        updateGeoShape();
    } else if (mode === "physics") {
        document.getElementById("calcPhysInputs").style.display = "block";
        updatePhysFormula();
    } else if (mode === "converter") {
        document.getElementById("calcConverterOutput").style.display = "block";
    }
    
    calcClear();
}

// ==================== ГЕОМЕТРИЯ ====================
function updateGeoShape() {
    const shape = document.getElementById("geoShape").value;
    let fields = "";
    if (shape === "circle") fields = "Радиус (R): <input id='geoR' type='number' step='any' class='calc-input'>";
    else if (shape === "triangle") fields = "Сторона a: <input id='geoA' type='number' step='any' class='calc-input'> Сторона b: <input id='geoB' type='number' step='any' class='calc-input'> Сторона c: <input id='geoC' type='number' step='any' class='calc-input'>";
    else if (shape === "rectangle") fields = "Длина (a): <input id='geoA' type='number' step='any' class='calc-input'> Ширина (b): <input id='geoB' type='number' step='any' class='calc-input'>";
    else if (shape === "cylinder") fields = "Радиус (R): <input id='geoR' type='number' step='any' class='calc-input'> Высота (h): <input id='geoH' type='number' step='any' class='calc-input'>";
    document.getElementById("geoFields").innerHTML = fields;
}

function calcGeo() {
    const shape = document.getElementById("geoShape").value;
    let output = "";
    if (shape === "circle") {
        const R = parseFloat(document.getElementById("geoR")?.value);
        if (isNaN(R)) { output = "❌ Нужен радиус (R)"; }
        else {
            output = `S = πR² = π×${R}² = ${(Math.PI*R*R).toFixed(4)}\nC = 2πR = 2π×${R} = ${(2*Math.PI*R).toFixed(4)}\nD = 2R = ${2*R}`;
        }
    } else if (shape === "triangle") {
        const a = parseFloat(document.getElementById("geoA")?.value);
        const b = parseFloat(document.getElementById("geoB")?.value);
        const c = parseFloat(document.getElementById("geoC")?.value);
        if (isNaN(a)||isNaN(b)||isNaN(c)) { output = "❌ Нужны все три стороны"; }
        else if (a+b<=c||a+c<=b||b+c<=a) { output = "❌ Такого треугольника не существует"; }
        else {
            const p = (a+b+c)/2;
            const S = Math.sqrt(p*(p-a)*(p-b)*(p-c));
            output = `p = (a+b+c)/2 = ${p.toFixed(2)}\nS = √(p(p-a)(p-b)(p-c)) = ${S.toFixed(4)}\nP = a+b+c = ${(a+b+c).toFixed(2)}`;
        }
    } else if (shape === "rectangle") {
        const a = parseFloat(document.getElementById("geoA")?.value);
        const b = parseFloat(document.getElementById("geoB")?.value);
        if (isNaN(a)||isNaN(b)) { output = "❌ Нужны длина и ширина"; }
        else { output = `S = a×b = ${a}×${b} = ${(a*b).toFixed(2)}\nP = 2(a+b) = 2×${(a+b).toFixed(2)} = ${(2*(a+b)).toFixed(2)}`; }
    } else if (shape === "cylinder") {
        const R = parseFloat(document.getElementById("geoR")?.value);
        const h = parseFloat(document.getElementById("geoH")?.value);
        if (isNaN(R)||isNaN(h)) { output = "❌ Нужны радиус и высота"; }
        else { output = `V = πR²h = π×${R}²×${h} = ${(Math.PI*R*R*h).toFixed(4)}\nS(бок) = 2πRh = ${(2*Math.PI*R*h).toFixed(4)}\nS(полн) = 2πR(R+h) = ${(2*Math.PI*R*(R+h)).toFixed(4)}`; }
    }
    document.getElementById("calcResult").textContent = output;
}

// ==================== ФИЗИКА ====================
function updatePhysFormula() {
    const formula = document.getElementById("physFormula").value;
    let fields = "";
    if (formula === "F=ma") fields = "Масса (m, кг): <input id='phys1' type='number' step='any' class='calc-input'> Ускорение (a, м/с²): <input id='phys2' type='number' step='any' class='calc-input'>";
    else if (formula === "P=F/S") fields = "Сила (F, Н): <input id='phys1' type='number' step='any' class='calc-input'> Площадь (S, м²): <input id='phys2' type='number' step='any' class='calc-input'>";
    else if (formula === "I=U/R") fields = "Напряжение (U, В): <input id='phys1' type='number' step='any' class='calc-input'> Сопротивление (R, Ом): <input id='phys2' type='number' step='any' class='calc-input'>";
    else if (formula === "v=S/t") fields = "Путь (S, м): <input id='phys1' type='number' step='any' class='calc-input'> Время (t, с): <input id='phys2' type='number' step='any' class='calc-input'>";
    document.getElementById("physFields").innerHTML = fields;
}

function calcPhys() {
    const formula = document.getElementById("physFormula").value;
    const v1 = parseFloat(document.getElementById("phys1")?.value);
    const v2 = parseFloat(document.getElementById("phys2")?.value);
    if (isNaN(v1)||isNaN(v2)) { document.getElementById("calcResult").textContent = "❌ Нужны оба значения"; return; }
    let result, expl;
    if (formula === "F=ma") { result = v1*v2; expl = `F = m×a = ${v1}×${v2} = ${result.toFixed(2)} Н`; }
    else if (formula === "P=F/S") { result = v1/v2; expl = `P = F/S = ${v1}/${v2} = ${result.toFixed(2)} Па`; }
    else if (formula === "I=U/R") { result = v1/v2; expl = `I = U/R = ${v1}/${v2} = ${result.toFixed(2)} А`; }
    else if (formula === "v=S/t") { result = v1/v2; expl = `v = S/t = ${v1}/${v2} = ${result.toFixed(2)} м/с`; }
    document.getElementById("calcResult").textContent = expl;
}

// ==================== УРАВНЕНИЯ ====================
function calcEquation() {
    const a = parseFloat(document.getElementById("eqA")?.value) || 0;
    const b = parseFloat(document.getElementById("eqB")?.value) || 0;
    const c = parseFloat(document.getElementById("eqC")?.value) || 0;
    const eqType = document.getElementById("eqType").value;
    
    if (eqType === "quadratic") {
        if (a === 0) { document.getElementById("calcResult").textContent = "❌ a ≠ 0 для квадратного уравнения"; return; }
        const D = b*b - 4*a*c;
        let steps = `${a}x² + ${b}x + ${c} = 0\n`;
        steps += `D = b² − 4ac = ${b}² − 4×${a}×${c} = ${D}\n`;
        if (D > 0) {
            const x1 = (-b + Math.sqrt(D)) / (2*a);
            const x2 = (-b - Math.sqrt(D)) / (2*a);
            steps += `D > 0 → два корня:\nx₁ = (−b + √D) / 2a = ${x1.toFixed(4)}\nx₂ = (−b − √D) / 2a = ${x2.toFixed(4)}`;
        } else if (D === 0) {
            const x = -b / (2*a);
            steps += `D = 0 → один корень:\nx = −b / 2a = ${x.toFixed(4)}`;
        } else {
            steps += `D < 0 → нет действительных корней`;
        }
        document.getElementById("calcResult").textContent = steps;
        document.getElementById("calcMainButtons").style.display = "none";
        document.getElementById("calcExtraBtns").style.display = "none";
        document.getElementById("calcEquationBtns").style.display = "none";
    } else if (eqType === "linear") {
        if (a === 0) { document.getElementById("calcResult").textContent = "❌ a ≠ 0"; return; }
        const x = -c / a;
        document.getElementById("calcResult").textContent = `${a}x + ${c} = 0\nx = −${c}/${a} = ${x.toFixed(4)}`;
    }
}

// ==================== КОНВЕРТЕР ====================
function calcConvert() {
    const type = document.getElementById("convType").value;
    const value = parseFloat(document.getElementById("convValue")?.value);
    if (isNaN(value)) { document.getElementById("calcResult").textContent = "❌ Введи число"; return; }
    
    let out = "";
    if (type === "length") {
        out = `мм: ${(value*1000).toFixed(2)}\nсм: ${(value*100).toFixed(2)}\nдм: ${(value*10).toFixed(2)}\nм: ${value}\nкм: ${(value/1000).toFixed(6)}\nдюймы: ${(value*39.3701).toFixed(2)}\nфуты: ${(value*3.28084).toFixed(2)}`;
    } else if (type === "mass") {
        out = `мг: ${(value*1e6).toFixed(0)}\nг: ${(value*1000).toFixed(0)}\nкг: ${value}\nц: ${(value/100).toFixed(4)}\nт: ${(value/1000).toFixed(6)}\nфунты: ${(value*2.20462).toFixed(2)}`;
    } else if (type === "speed") {
        out = `м/с: ${(value/3.6).toFixed(2)}\nкм/ч: ${value}\nмиль/ч: ${(value*0.621371).toFixed(2)}`;
    } else if (type === "temp") {
        out = `°C: ${value}\n°F: ${(value*9/5+32).toFixed(2)}\nK: ${(value+273.15).toFixed(2)}`;
    }
    document.getElementById("calcResult").textContent = out;
    document.getElementById("calcMainButtons").style.display = "none";
    document.getElementById("calcExtraBtns").style.display = "none";
}

// ==================== КЛАВИАТУРНЫЙ ВВОД ====================
document.addEventListener("keydown", function(e) {
    if (document.getElementById("calcModal").style.display !== "flex") return;
    
    const key = e.key;
    if ("0123456789".includes(key)) calcInput(key);
    else if (key === "+") calcInput("+");
    else if (key === "-") calcInput("−");
    else if (key === "*") calcInput("×");
    else if (key === "/") calcInput("÷");
    else if (key === "." || key === ",") calcInput(".");
    else if (key === "(") calcBrackets();
    else if (key === "Enter" || key === "=") { e.preventDefault(); calcCalculate(); }
    else if (key === "Backspace") calcBackspace();
    else if (key === "Delete" || key === "Escape") calcClear();
    else if (key === "h" && e.ctrlKey) { e.preventDefault(); calcToggleHistory(); }
    else if (key === "t" && e.ctrlKey) { e.preventDefault(); calcToggleTrig(); }
});
