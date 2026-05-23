// ==================== УРАВНЕНИЯ v2.0 ====================
let eqExpression = "";
let eqSolved = false;
let eqType = "linear"; // linear | quadratic

function switchEqType(type) {
    eqType = type;
    eqExpression = "";
    eqSolved = false;
    document.getElementById("eqInput").value = "";
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqSteps").innerHTML = "";
    document.getElementById("eqAnswer").innerHTML = "";
    
    // Подсветка активной кнопки
    document.querySelectorAll(".eq-type-btn").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`eqType_${type}`).classList.add("active");
}

function eqInput(val) {
    if (eqSolved) {
        eqExpression = "";
        eqSolved = false;
        document.getElementById("eqSolution").style.display = "none";
        document.getElementById("eqCalcPad").style.display = "block";
    }
    eqExpression += val;
    document.getElementById("eqInput").value = eqExpression;
}

function eqClear() {
    eqExpression = "";
    eqSolved = false;
    document.getElementById("eqInput").value = "";
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
}

function eqBackspace() {
    eqExpression = eqExpression.slice(0, -1);
    document.getElementById("eqInput").value = eqExpression;
}

function eqPaste() {
    navigator.clipboard.readText().then(text => {
        eqExpression = text.trim();
        document.getElementById("eqInput").value = eqExpression;
    }).catch(() => {
        document.getElementById("eqInput").focus();
    });
}

function eqEdit() {
    // Показать калькулятор для редактирования
    eqSolved = false;
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqInput").value = eqExpression;
}

function eqSolve() {
    const input = document.getElementById("eqInput").value.trim();
    if (!input) return;
    
    eqExpression = input;
    eqSolved = true;
    document.getElementById("eqCalcPad").style.display = "none";
    document.getElementById("eqSolution").style.display = "block";
    
    if (eqType === "linear") {
        solveLinear(input);
    } else if (eqType === "quadratic") {
        solveQuadratic(input);
    }
}

function solveLinear(input) {
    // Формат: ax + b = 0 или ax + b = c или ax + b = cx + d
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    // Переносим всё в левую часть: ax + b = 0
    let left = expr;
    let right = "0";
    if (expr.includes("=")) {
        [left, right] = expr.split("=");
    }
    
    // Парсим коэффициенты
    let a = 0, b = 0;
    
    // Обрабатываем левую часть
    let terms = left.match(/([+-]?\d*\.?\d*)x|([+-]?\d+\.?\d*)/g) || [];
    terms.forEach(term => {
        if (term.includes("x")) {
            let coef = term.replace("x", "");
            if (coef === "" || coef === "+") a += 1;
            else if (coef === "-") a -= 1;
            else a += parseFloat(coef);
        } else {
            b += parseFloat(term);
        }
    });
    
    // Обрабатываем правую часть (вычитаем)
    let rightVal = eval(right.replace(/x/g, "*0")) || 0;
    b -= rightVal;
    
    let steps = `<div style="color:#FFD700; font-size:14px; font-weight:bold; margin-bottom:8px;">Решение линейного уравнения</div>`;
    steps += `<div style="color:#CCC; font-size:13px; margin-bottom:5px;">Исходное: ${input}</div>`;
    steps += `<div style="color:#CCC; font-size:13px; margin-bottom:5px;">Переносим всё в левую часть:</div>`;
    steps += `<div style="color:#58A6FF; font-size:14px; margin-bottom:10px;">${a}x + ${b} = 0</div>`;
    
    if (a === 0) {
        steps += `<div style="color:#C72A2A;">❌ Коэффициент при x равен 0. Нет решения.</div>`;
    } else {
        let x = -b / a;
        steps += `<div style="color:#CCC; font-size:13px;">Переносим ${b} в правую часть:</div>`;
        steps += `<div style="color:#58A6FF; font-size:14px; margin-bottom:5px;">${a}x = ${-b}</div>`;
        steps += `<div style="color:#CCC; font-size:13px;">Делим на ${a}:</div>`;
        steps += `<div style="color:#2D8A4E; font-size:18px; font-weight:bold; margin-top:8px;">x = ${x.toFixed(4)}</div>`;
    }
    
    document.getElementById("eqSteps").innerHTML = steps;
    document.getElementById("eqAnswer").innerHTML = "";
}

function solveQuadratic(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    // Приводим к виду ax² + bx + c = 0
    if (expr.includes("=")) {
        let [left, right] = expr.split("=");
        expr = `(${left})-(${right})`;
    }
    
    // Парсим a, b, c
    let a = 0, b = 0, c = 0;
    
    // Ищем x²
    let x2match = expr.match(/([+-]?\d*\.?\d*)x\^2|([+-]?\d*\.?\d*)x²/);
    if (x2match) {
        let coef = x2match[1] || x2match[2] || "";
        if (coef === "" || coef === "+") a = 1;
        else if (coef === "-") a = -1;
        else a = parseFloat(coef);
    }
    
    // Ищем x (не x²)
    let x1match = expr.match(/([+-]?\d*\.?\d*)x(?![\^²])/);
    if (x1match) {
        let coef = x1match[1] || "";
        if (coef === "" || coef === "+") b = 1;
        else if (coef === "-") b = -1;
        else b = parseFloat(coef);
    }
    
    // Ищем свободный член
    let cmatch = expr.match(/([+-]?\d+\.?\d*)(?!x)/g);
    if (cmatch) {
        cmatch.forEach(m => {
            if (!m.includes("x")) c += parseFloat(m);
        });
    }
    
    let steps = `<div style="color:#FFD700; font-size:14px; font-weight:bold; margin-bottom:8px;">Решение квадратного уравнения</div>`;
    steps += `<div style="color:#CCC; font-size:13px; margin-bottom:5px;">Исходное: ${input}</div>`;
    steps += `<div style="color:#58A6FF; font-size:14px; margin-bottom:10px;">${a}x² + ${b}x + ${c} = 0</div>`;
    
    if (a === 0) {
        steps += `<div style="color:#C72A2A;">❌ Это не квадратное уравнение (a = 0)</div>`;
    } else {
        let D = b*b - 4*a*c;
        steps += `<div style="color:#CCC; font-size:13px;">D = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}</div>`;
        
        if (D > 0) {
            let x1 = (-b + Math.sqrt(D)) / (2*a);
            let x2 = (-b - Math.sqrt(D)) / (2*a);
            steps += `<div style="color:#2D8A4E; font-size:14px; margin-top:5px;">D > 0 → два корня:</div>`;
            steps += `<div style="color:#2D8A4E; font-size:16px; font-weight:bold; margin-top:5px;">x₁ = ${x1.toFixed(4)}</div>`;
            steps += `<div style="color:#2D8A4E; font-size:16px; font-weight:bold;">x₂ = ${x2.toFixed(4)}</div>`;
        } else if (D === 0) {
            let x = -b / (2*a);
            steps += `<div style="color:#2D8A4E; font-size:14px; margin-top:5px;">D = 0 → один корень:</div>`;
            steps += `<div style="color:#2D8A4E; font-size:16px; font-weight:bold; margin-top:5px;">x = ${x.toFixed(4)}</div>`;
        } else {
            steps += `<div style="color:#C72A2A; font-size:14px; margin-top:5px;">D < 0 → нет действительных корней</div>`;
        }
    }
    
    document.getElementById("eqSteps").innerHTML = steps;
    document.getElementById("eqAnswer").innerHTML = "";
}
