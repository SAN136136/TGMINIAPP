// ==================== КАЛЬКУЛЯТОР ====================
let calcExpression = "";
let calcHistory = [];
let calcShowHistory = false;
let calcMode = "basic"; // basic | equations | geometry | physics | converter

function openCalculator() {
    document.getElementById("calcModal").style.display = "flex";
    document.getElementById("calcDisplay").textContent = "0";
    document.getElementById("calcResult").textContent = "";
    calcExpression = "";
    calcShowHistory = false;
    document.getElementById("calcHistory").style.display = "none";
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
    calcExpression = calcExpression.slice(0, -1);
    updateCalcDisplay();
    liveCalcResult();
}

function calcBrackets() {
    calcExpression += "()";
    updateCalcDisplay();
    liveCalcResult();
    // Установить курсор между скобками
    let display = document.getElementById("calcDisplay");
    // Фокус на дисплее
    display.focus();
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
    calcHistory.forEach((item, i) => {
        html += `<div class="calc-history-item" onclick="calcExpression='${item.result}'; updateCalcDisplay(); liveCalcResult();">${item.expr} = ${item.result}</div>`;
    });
    container.innerHTML = html;
}

function switchCalcMode(mode) {
    calcMode = mode;
    document.querySelectorAll(".calc-mode-btn").forEach(btn => btn.classList.remove("active"));
    let activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    
    let container = document.getElementById("calcExamples");
    if (!container) return;
    
    const examples = {
        "basic": [
            "2 + 2 × 3",
            "(5 + 3) × 2",
            "15% от 340 = 15/100 × 340",
            "√(144)",
            "sin(30)",
            "log(1000)"
        ],
        "equations": [
            "x² + 5x + 6 = 0 → D = 5² − 4·1·6 = 1",
            "x₁,₂ = (−5 ± √1) / 2",
            "x₁ = −2, x₂ = −3"
        ],
        "geometry": [
            "Круг: S = πR², R=5 → π×25 ≈ 78.54",
            "Треугольник (Герон): a=3, b=4, c=5",
            "p = 6, S = √(6×3×2×1) = 6",
            "Цилиндр: V = πR²h, R=3, h=10"
        ],
        "physics": [
            "F = ma, m=10, a=2 → F = 20 Н",
            "P = F/S, F=100, S=2 → P = 50 Па",
            "I = U/R, U=12, R=4 → I = 3 А"
        ],
        "converter": [
            "1 км = 1000 м",
            "1 кг = 1000 г",
            "°F = °C × 9/5 + 32",
            "100 км/ч = 27.78 м/с"
        ]
    };
    
    let html = "";
    if (examples[mode]) {
        examples[mode].forEach(ex => {
            html += `<div class="calc-example-item" onclick="calcExpression='${ex.replace(/'/g, "\\'")}'; updateCalcDisplay(); liveCalcResult();">${ex}</div>`;
        });
    }
    container.innerHTML = html;
}

// Ввод с клавиатуры
document.addEventListener("keydown", function(e) {
    if (document.getElementById("calcModal").style.display !== "flex") return;
    
    const key = e.key;
    if ("0123456789".includes(key)) calcInput(key);
    else if (key === "+") calcInput("+");
    else if (key === "-") calcInput("−");
    else if (key === "*") calcInput("×");
    else if (key === "/") calcInput("÷");
    else if (key === ".") calcInput(".");
    else if (key === "(") calcBrackets();
    else if (key === "Enter" || key === "=") { e.preventDefault(); calcCalculate(); }
    else if (key === "Backspace") calcBackspace();
    else if (key === "Escape" || key === "Delete") calcClear();
    else if (key === "h" && e.ctrlKey) { e.preventDefault(); calcToggleHistory(); }
});
