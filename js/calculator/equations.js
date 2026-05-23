// ==================== УРАВНЕНИЯ v2.2 ====================
let eqExpression = "";
let eqSolved = false;
let eqType = "linear";

function switchEqType(type) {
    eqType = type;
    eqExpression = "";
    eqSolved = false;
    document.getElementById("eqInput").value = "";
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqSteps").innerHTML = "";
    document.getElementById("eqAnswer").innerHTML = "";
    
    document.querySelectorAll(".eq-type-btn").forEach(btn => btn.classList.remove("active"));
    let btn = document.getElementById(`eqType_${type}`);
    if (btn) btn.classList.add("active");
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
    eqSolved = false;
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqInput").value = eqExpression;
}

function eqSolve() {
    const input = document.getElementById("eqInput").value.trim();
    if (!input) return;
    
    eqExpression = input;
    
    if (eqType === "linear") {
        const result = solveLinear(input);
        if (result.error) {
            document.getElementById("eqSteps").innerHTML = `<div style="color:#C72A2A;">${result.error}</div>`;
            document.getElementById("eqSolution").style.display = "block";
            document.getElementById("eqCalcPad").style.display = "none";
            return;
        }
        showSolution(result);
    } else if (eqType === "quadratic") {
        const result = solveQuadratic(input);
        if (result.error) {
            document.getElementById("eqSteps").innerHTML = `<div style="color:#C72A2A;">${result.error}</div>`;
            document.getElementById("eqSolution").style.display = "block";
            document.getElementById("eqCalcPad").style.display = "none";
            return;
        }
        showSolution(result);
    }
}

function showSolution(result) {
    eqSolved = true;
    document.getElementById("eqCalcPad").style.display = "none";
    document.getElementById("eqSolution").style.display = "block";
    
    let html = `<div style="color:#FFD700; font-size:14px; font-weight:bold; margin-bottom:8px;">${result.title}</div>`;
    html += `<div style="color:#CCC; font-size:13px; margin-bottom:5px;">Исходное: ${result.original}</div>`;
    html += result.steps;
    
    if (result.answer) {
        html += `<div style="margin-top:10px; padding:10px; background:#1A2E1A; border-radius:6px; color:#2D8A4E; font-weight:bold; font-size:16px;">✅ ${result.answer}</div>`;
    }
    
    if (result.detail) {
        window._eqDetail = result.detail;
        html += `<button onclick="showEqDetail(window._eqDetail)" 
            style="margin-top:10px; padding:12px 20px; background:#3A5A6B; border:none; color:white; font-size:15px; border-radius:6px; cursor:pointer; width:100%;">📋 Подробнее</button>`;
    }
    
    document.getElementById("eqSteps").innerHTML = html;
}

function solveLinear(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    if (!expr.includes("x")) {
        return { error: "❌ Это не линейное уравнение (нет переменной x)" };
    }
    
    if (expr.includes("x^2") || expr.includes("x²")) {
        return { error: "❌ Это не линейное уравнение (есть x²). Перейди в раздел «Квадратные»" };
    }
    
    let left = expr;
    let right = "0";
    if (expr.includes("=")) {
        [left, right] = expr.split("=");
    }
    
    let a = 0, b = 0;
    
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
    
    try {
        let rightVal = eval(right.replace(/x/g, "0")) || 0;
        b -= rightVal;
    } catch(e) {
        return { error: "❌ Не удалось разобрать уравнение. Проверь формат." };
    }
    
    if (a === 0) {
        return { error: "❌ Коэффициент при x равен 0. Уравнение не имеет решения." };
    }
    
    let x = -b / a;
    
    return {
        title: "Решение линейного уравнения",
        original: input,
        steps: `
            <div style="color:#CCC; font-size:13px; margin-bottom:5px;">Переносим всё в левую часть:</div>
            <div style="color:#58A6FF; font-size:14px; margin-bottom:10px;">${a}x + ${b} = 0</div>
            <div style="color:#CCC; font-size:13px;">Переносим ${b} в правую часть:</div>
            <div style="color:#58A6FF; font-size:14px; margin-bottom:5px;">${a}x = ${-b}</div>
            <div style="color:#CCC; font-size:13px;">Делим на ${a}:</div>
        `,
        answer: `x = ${x.toFixed(4)}`,
        detail: `Линейное уравнение: ${input}\n\nПриводим к виду ax + b = 0:\n${a}x + ${b} = 0\n\nПереносим b вправо:\n${a}x = ${-b}\n\nДелим на a:\nx = ${-b}/${a} = ${x.toFixed(4)}`
    };
}

function solveQuadratic(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    if (!expr.includes("x^2") && !expr.includes("x²")) {
        return { error: "❌ Это не квадратное уравнение (нет x²). Перейди в раздел «Линейные»" };
    }
    
    let left = expr;
    let right = "0";
    if (expr.includes("=")) {
        [left, right] = expr.split("=");
    }
    
    let a = 0, b = 0, c = 0;
    
    let x2match = left.match(/([+-]?\d*\.?\d*)x[\^²]2/);
    if (x2match) {
        let coef = x2match[1] || "";
        if (coef === "" || coef === "+") a = 1;
        else if (coef === "-") a = -1;
        else a = parseFloat(coef);
    }
    
    let x1match = left.match(/([+-]?\d*\.?\d*)x(?![\^²2])/);
    if (x1match) {
        let coef = x1match[1] || "";
        if (coef === "" || coef === "+") b = 1;
        else if (coef === "-") b = -1;
        else b = parseFloat(coef);
    }
    
    let cmatch = left.match(/([+-]?\d+\.?\d*)(?![\^²2]?x)/g);
    if (cmatch) {
        cmatch.forEach(m => {
            if (!m.includes("x")) {
                c += parseFloat(m);
            }
        });
    }
    
    if (a === 0) {
        return { error: "❌ Коэффициент при x² равен 0. Это не квадратное уравнение." };
    }
    
    let D = b*b - 4*a*c;
    let steps = `
        <div style="color:#58A6FF; font-size:14px; margin-bottom:10px;">${a}x² + ${b}x + ${c} = 0</div>
        <div style="color:#CCC; font-size:13px;">D = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}</div>
    `;
    let answer = "";
    let detail = `Квадратное уравнение: ${input}\n\nПриводим к виду ax² + bx + c = 0:\n${a}x² + ${b}x + ${c} = 0\n\nДискриминант:\nD = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}\n\n`;
    
    if (D > 0) {
        let x1 = (-b + Math.sqrt(D)) / (2*a);
        let x2 = (-b - Math.sqrt(D)) / (2*a);
        steps += `<div style="color:#2D8A4E; font-size:14px; margin-top:5px;">D > 0 → два корня:</div>`;
        answer = `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
        detail += `D > 0 → два корня:\nx₁ = (−b + √D) / 2a = (${-b} + ${Math.sqrt(D).toFixed(2)}) / ${2*a} = ${x1.toFixed(4)}\nx₂ = (−b − √D) / 2a = (${-b} − ${Math.sqrt(D).toFixed(2)}) / ${2*a} = ${x2.toFixed(4)}`;
    } else if (D === 0) {
        let x = -b / (2*a);
        steps += `<div style="color:#2D8A4E; font-size:14px; margin-top:5px;">D = 0 → один корень:</div>`;
        answer = `x = ${x.toFixed(4)}`;
        detail += `D = 0 → один корень:\nx = −b / 2a = ${-b} / ${2*a} = ${x.toFixed(4)}`;
    } else {
        steps += `<div style="color:#C72A2A; font-size:14px; margin-top:5px;">D < 0 → нет действительных корней</div>`;
        answer = "Нет действительных корней";
        detail += `D < 0 → нет действительных корней`;
    }
    
    return {
        title: "Решение квадратного уравнения",
        original: input,
        steps: steps,
        answer: answer,
        detail: detail
    };
}

function showEqDetail(detailText) {
    const content = `
        <div style="color:#FFD700; font-size:14px; margin-bottom:10px;">📋 Подробное решение</div>
        <div style="color:#CCC; font-size:14px; white-space:pre-line;">${detailText}</div>
    `;
    
    document.getElementById("calcModal").style.display = "none";
    document.getElementById("cheatsheetContent").innerHTML = content;
    document.getElementById("cheatsheetModal").style.display = "flex";
}
