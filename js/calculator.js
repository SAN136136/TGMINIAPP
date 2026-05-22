let calcExpression = "";
let calcHistory = [];

function openCalculator() {
    document.getElementById("calcModal").style.display = "flex";
    document.getElementById("calcDisplay").textContent = "0";
    calcExpression = "";
    renderCalcHistory();
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
    document.getElementById("calcDisplay").textContent = calcExpression || "0";
}

function calcClear() {
    calcExpression = "";
    document.getElementById("calcDisplay").textContent = "0";
}

function calcBackspace() {
    calcExpression = calcExpression.slice(0, -1);
    document.getElementById("calcDisplay").textContent = calcExpression || "0";
}

function calcCalculate() {
    if (!calcExpression) return;
    
    let expr = calcExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, String(Math.PI))
        .replace(/\^2/g, "**2")
        .replace(/\^/g, "**");
    
    // Функции
    expr = expr.replace(/sin\(/g, "Math.sin(Math.PI/180*");
    expr = expr.replace(/cos\(/g, "Math.cos(Math.PI/180*");
    expr = expr.replace(/tan\(/g, "Math.tan(Math.PI/180*");
    expr = expr.replace(/log\(/g, "Math.log10(");
    expr = expr.replace(/sqrt\(/g, "Math.sqrt(");
    
    try {
        let result = eval(expr);
        if (result === undefined || result === null || isNaN(result)) {
            document.getElementById("calcDisplay").textContent = "Ошибка";
        } else {
            result = Math.round(result * 1000000) / 1000000;
            document.getElementById("calcDisplay").textContent = result;
            calcHistory.unshift({ expr: calcExpression, result: result });
            if (calcHistory.length > 10) calcHistory.pop();
            calcExpression = String(result);
            renderCalcHistory();
        }
    } catch (e) {
        document.getElementById("calcDisplay").textContent = "Ошибка";
    }
}

function renderCalcHistory() {
    const container = document.getElementById("calcHistory");
    if (calcHistory.length === 0) {
        container.innerHTML = "";
        return;
    }
    let html = "";
    calcHistory.forEach(item => {
        html += `<div class="calc-history-item" onclick="calcExpression='${item.result}'; document.getElementById('calcDisplay').textContent='${item.result}';">${item.expr} = ${item.result}</div>`;
    });
    container.innerHTML = html;
}
