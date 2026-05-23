// ==================== УРАВНЕНИЯ v3.0 ====================
let eqExpression = "";
let eqExpression2 = "";  // Для систем
let eqSolved = false;
let eqType = "linear";
let eqActiveInput = 1;  // Какое поле ввода активно (1 или 2)

function switchEqType(type) {
    eqType = type;
    eqExpression = "";
    eqExpression2 = "";
    eqSolved = false;
    eqActiveInput = 1;
    document.getElementById("eqInput1").value = "";
    if (document.getElementById("eqInput2")) document.getElementById("eqInput2").value = "";
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqSteps").innerHTML = "";
    document.getElementById("eqAnswer").innerHTML = "";
    
    // Показываем/скрываем второе поле и кнопку y
    if (type === "system") {
        document.getElementById("eqInput2Row").style.display = "flex";
        document.getElementById("eqYBtn").style.display = "inline-block";
    } else {
        document.getElementById("eqInput2Row").style.display = "none";
        document.getElementById("eqYBtn").style.display = "inline-block";
    }
    
    document.querySelectorAll(".eq-type-btn").forEach(btn => btn.classList.remove("active"));
    let btn = document.getElementById(`eqType_${type}`);
    if (btn) btn.classList.add("active");
    
    updateEqHighlight();
}

function focusEqInput(num) {
    eqActiveInput = num;
    updateEqHighlight();
}

function updateEqHighlight() {
    let inp1 = document.getElementById("eqInput1");
    let inp2 = document.getElementById("eqInput2");
    if (inp1) inp1.style.borderColor = eqActiveInput === 1 ? "#FFD700" : "#3A5A6B";
    if (inp2) inp2.style.borderColor = eqActiveInput === 2 ? "#FFD700" : "#3A5A6B";
}

function eqInput(val) {
    if (eqSolved) {
        eqExpression = "";
        eqExpression2 = "";
        eqSolved = false;
        document.getElementById("eqSolution").style.display = "none";
        document.getElementById("eqCalcPad").style.display = "block";
    }
    if (eqType === "system") {
        if (eqActiveInput === 1) {
            eqExpression += val;
            document.getElementById("eqInput1").value = eqExpression;
        } else {
            eqExpression2 += val;
            document.getElementById("eqInput2").value = eqExpression2;
        }
    } else {
        eqExpression += val;
        document.getElementById("eqInput1").value = eqExpression;
    }
}

function eqClear() {
    eqExpression = "";
    eqExpression2 = "";
    eqSolved = false;
    document.getElementById("eqInput1").value = "";
    if (document.getElementById("eqInput2")) document.getElementById("eqInput2").value = "";
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
}

function eqBackspace() {
    if (eqType === "system") {
        if (eqActiveInput === 1) {
            eqExpression = eqExpression.slice(0, -1);
            document.getElementById("eqInput1").value = eqExpression;
        } else {
            eqExpression2 = eqExpression2.slice(0, -1);
            document.getElementById("eqInput2").value = eqExpression2;
        }
    } else {
        eqExpression = eqExpression.slice(0, -1);
        document.getElementById("eqInput1").value = eqExpression;
    }
}

function eqPaste() {
    navigator.clipboard.readText().then(text => {
        if (eqType === "system") {
            if (eqActiveInput === 1) {
                eqExpression = text.trim();
                document.getElementById("eqInput1").value = eqExpression;
            } else {
                eqExpression2 = text.trim();
                document.getElementById("eqInput2").value = eqExpression2;
            }
        } else {
            eqExpression = text.trim();
            document.getElementById("eqInput1").value = eqExpression;
        }
    }).catch(() => {
        document.getElementById(eqActiveInput === 1 ? "eqInput1" : "eqInput2").focus();
    });
}

function eqEdit() {
    eqSolved = false;
    document.getElementById("eqSolution").style.display = "none";
    document.getElementById("eqCalcPad").style.display = "block";
    document.getElementById("eqInput1").value = eqExpression;
    if (document.getElementById("eqInput2")) document.getElementById("eqInput2").value = eqExpression2;
}

function eqSolve() {
    if (eqType === "system") {
        const input1 = document.getElementById("eqInput1").value.trim();
        const input2 = document.getElementById("eqInput2").value.trim();
        if (!input1 || !input2) return;
        eqExpression = input1;
        eqExpression2 = input2;
        const result = solveSystem(input1, input2);
        if (result.error) {
            document.getElementById("eqSolution").style.display = "block";
            document.getElementById("eqCalcPad").style.display = "none";
            document.getElementById("eqSteps").innerHTML = `<div style="color:#FF5555; font-size:18px; text-align:center; padding:20px;">${result.error}</div>`;
            document.getElementById("eqAnswer").innerHTML = "";
            return;
        }
        showSolution(result);
        return;
    }
    
    const input = document.getElementById("eqInput1").value.trim();
    if (!input) return;
    eqExpression = input;
    
    if (eqType === "linear") {
        const result = solveLinear(input);
        if (result.error) {
            document.getElementById("eqSolution").style.display = "block";
            document.getElementById("eqCalcPad").style.display = "none";
            document.getElementById("eqSteps").innerHTML = `<div style="color:#FF5555; font-size:18px; text-align:center; padding:20px;">${result.error}</div>`;
            document.getElementById("eqAnswer").innerHTML = "";
            return;
        }
        showSolution(result);
    } else if (eqType === "quadratic") {
        const result = solveQuadratic(input);
        if (result.error) {
            document.getElementById("eqSolution").style.display = "block";
            document.getElementById("eqCalcPad").style.display = "none";
            document.getElementById("eqSteps").innerHTML = `<div style="color:#FF5555; font-size:18px; text-align:center; padding:20px;">${result.error}</div>`;
            document.getElementById("eqAnswer").innerHTML = "";
            return;
        }
        showSolution(result);
    }
}

function showSolution(result) {
    eqSolved = true;
    document.getElementById("eqCalcPad").style.display = "none";
    document.getElementById("eqSolution").style.display = "block";
    
    let html = "";
    
    if (result.title) {
        html += `<div style="font-size:18px; font-weight:bold; color:#58A6FF; margin-bottom:10px;">${result.title}</div>`;
    }
    
    html += `<div style="font-size:20px; font-weight:bold; color:#FFD700; margin-bottom:5px;">${result.original}</div>`;
    
    if (result.stepsShort) {
        html += `<div style="font-size:15px; color:#CCC; margin-bottom:15px;">${result.stepsShort}</div>`;
    }
    
    if (result.answer) {
        html += `<div style="padding:15px; background:#1A2E1A; border-radius:8px; color:#2D8A4E; font-weight:bold; font-size:22px; text-align:center;">${result.answer}</div>`;
    }
    
    if (result.detail) {
        window._eqDetail = result.detail;
        html += `<button onclick="showEqDetail(window._eqDetail)" 
            style="margin-top:15px; padding:14px 24px; background:#3A5A6B; border:none; color:white; font-size:16px; border-radius:8px; cursor:pointer; width:100%;">📋 Подробнее</button>`;
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
    
    let left = expr, right = "0";
    if (expr.includes("=")) [left, right] = expr.split("=");
    
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
        let rv = eval(right.replace(/x/g, "0")) || 0;
        b -= rv;
    } catch(e) { return { error: "❌ Не удалось разобрать уравнение" }; }
    
    if (a === 0) return { error: "❌ Коэффициент при x равен 0" };
    
    let x = -b / a;
    
    let detail = `Уравнение: ${input}\n\n`;
    detail += `1) Переносим все члены в левую часть:\n${a}x + ${b} = 0\n\n`;
    detail += `2) Переносим ${b} в правую часть:\n${a}x = ${-b}\n\n`;
    detail += `3) Делим обе части на ${a}:\nx = ${-b} / ${a}\nx = ${x.toFixed(4)}`;
    
    let stepsShort = `${a}x + ${b} = 0 → ${a}x = ${-b} → x = ${x.toFixed(4)}`;
    
    return {
        title: "",
        original: `${input}`,
        stepsShort: stepsShort,
        answer: `x = ${x.toFixed(4)}`,
        detail: detail
    };
}

function solveQuadratic(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    if (!expr.includes("x^2") && !expr.includes("x²")) {
        return { error: "❌ Это не квадратное уравнение (нет x²). Перейди в раздел «Линейные»" };
    }
    
    let left = expr, right = "0";
    if (expr.includes("=")) [left, right] = expr.split("=");
    
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
    if (cmatch) cmatch.forEach(m => { if (!m.includes("x")) c += parseFloat(m); });
    
    if (a === 0) return { error: "❌ Коэффициент при x² равен 0" };
    
    let D = b*b - 4*a*c;
    let stepsShort = `D = ${b}² − 4·${a}·${c} = ${D}`;
    let answer = "";
    let detail = `Уравнение: ${input}\n\n`;
    detail += `Приводим к виду ax² + bx + c = 0:\n${a}x² + ${b}x + ${c} = 0\n\n`;
    detail += `Дискриминант:\nD = b² − 4ac = ${b}² − 4·${a}·${c} = ${D}\n\n`;
    
    if (D > 0) {
        let x1 = (-b + Math.sqrt(D)) / (2*a);
        let x2 = (-b - Math.sqrt(D)) / (2*a);
        stepsShort += ` → x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
        answer = `x₁ = ${x1.toFixed(4)}  |  x₂ = ${x2.toFixed(4)}`;
        detail += `D > 0 → два корня:\nx₁ = (−b + √D) / 2a\nx₁ = (${-b} + √${D}) / ${2*a}\nx₁ = ${x1.toFixed(4)}\n\nx₂ = (−b − √D) / 2a\nx₂ = (${-b} − √${D}) / ${2*a}\nx₂ = ${x2.toFixed(4)}`;
    } else if (D === 0) {
        let x = -b / (2*a);
        stepsShort += ` → x = ${x.toFixed(4)}`;
        answer = `x = ${x.toFixed(4)}`;
        detail += `D = 0 → один корень:\nx = −b / 2a = ${-b} / ${2*a} = ${x.toFixed(4)}`;
    } else {
        stepsShort += ` → нет корней`;
        answer = `Нет действительных корней`;
        detail += `D < 0 → нет действительных корней`;
    }
    
    return {
        title: "",
        original: `${input}`,
        stepsShort: stepsShort,
        answer: answer,
        detail: detail
    };
}

function solveSystem(input1, input2) {
    // Парсим уравнения вида: ax + by = c
    function parseEq(str) {
        let s = str.replace(/\s/g, "").replace(/,/g, ".");
        let left = s, right = "0";
        if (s.includes("=")) [left, right] = s.split("=");
        let ax = 0, ay = 0, bv = 0;
        let terms = left.match(/([+-]?\d*\.?\d*)x|([+-]?\d*\.?\d*)y|([+-]?\d+\.?\d*)/g) || [];
        terms.forEach(t => {
            if (t.includes("x")) {
                let c = t.replace("x", "");
                if (c === "" || c === "+") ax += 1;
                else if (c === "-") ax -= 1;
                else ax += parseFloat(c);
            } else if (t.includes("y")) {
                let c = t.replace("y", "");
                if (c === "" || c === "+") ay += 1;
                else if (c === "-") ay -= 1;
                else ay += parseFloat(c);
            } else {
                bv += parseFloat(t);
            }
        });
        try { bv -= eval(right.replace(/x/g, "0").replace(/y/g, "0")) || 0; } catch(e) {}
        return { ax, ay, bv: -bv };
    }
    
    let eq1 = parseEq(input1);
    let eq2 = parseEq(input2);
    
    if (eq1.ax === 0 && eq1.ay === 0 || eq2.ax === 0 && eq2.ay === 0) {
        return { error: "❌ Не удалось разобрать систему" };
    }
    
    // Метод Крамера
    let det = eq1.ax * eq2.ay - eq1.ay * eq2.ax;
    
    if (det === 0) {
        if (eq1.ax * eq2.bv === eq2.ax * eq1.bv && eq1.ay * eq2.bv === eq2.ay * eq1.bv) {
            return {
                title: "",
                original: `${input1}  |  ${input2}`,
                stepsShort: `Δ = 0 → бесконечно много решений`,
                answer: `Бесконечно много решений`,
                detail: `Система:\n${input1}\n${input2}\n\nОпределитель Δ = ${eq1.ax}·${eq2.ay} − ${eq1.ay}·${eq2.ax} = 0\nУравнения пропорциональны → бесконечно много решений`
            };
        }
        return {
            title: "",
            original: `${input1}  |  ${input2}`,
            stepsShort: `Δ = 0 → нет решений`,
            answer: `Нет решений`,
            detail: `Система:\n${input1}\n${input2}\n\nОпределитель Δ = ${eq1.ax}·${eq2.ay} − ${eq1.ay}·${eq2.ax} = 0\nУравнения противоречат друг другу → нет решений`
        };
    }
    
    let x = (eq1.bv * eq2.ay - eq1.ay * eq2.bv) / det;
    let y = (eq1.ax * eq2.bv - eq1.bv * eq2.ax) / det;
    
    let detail = `Система:\n${input1}\n${input2}\n\n`;
    detail += `Приводим к виду:\n${eq1.ax}x + ${eq1.ay}y = ${eq1.bv}\n${eq2.ax}x + ${eq2.ay}y = ${eq2.bv}\n\n`;
    detail += `Метод Крамера:\nΔ = ${eq1.ax}·${eq2.ay} − ${eq1.ay}·${eq2.ax} = ${det}\n\n`;
    detail += `Δx = ${eq1.bv}·${eq2.ay} − ${eq1.ay}·${eq2.bv} = ${eq1.bv*eq2.ay - eq1.ay*eq2.bv}\n`;
    detail += `Δy = ${eq1.ax}·${eq2.bv} − ${eq1.bv}·${eq2.ax} = ${eq1.ax*eq2.bv - eq1.bv*eq2.ax}\n\n`;
    detail += `x = Δx / Δ = ${(eq1.bv*eq2.ay - eq1.ay*eq2.bv)} / ${det} = ${x.toFixed(4)}\n`;
    detail += `y = Δy / Δ = ${(eq1.ax*eq2.bv - eq1.bv*eq2.ax)} / ${det} = ${y.toFixed(4)}`;
    
    return {
        title: "",
        original: `${input1}  |  ${input2}`,
        stepsShort: `Δ = ${det} → x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`,
        answer: `x = ${x.toFixed(4)}  |  y = ${y.toFixed(4)}`,
        detail: detail
    };
}

function showEqDetail(detailText) {
    const content = `
        <div style="color:#FFD700; font-size:16px; margin-bottom:15px; font-weight:bold;">📋 Подробное решение</div>
        <div style="color:#CCC; font-size:15px; white-space:pre-line; line-height:1.8;">${detailText}</div>
    `;
    
    document.getElementById("calcModal").style.display = "none";
    document.getElementById("cheatsheetContent").innerHTML = content;
    document.getElementById("cheatsheetModal").style.display = "flex";
}
