// ==================== ОБЫЧНЫЙ КАЛЬКУЛЯТОР ====================
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

function calcBackspace() {
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
