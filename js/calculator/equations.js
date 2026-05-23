// ==================== УРАВНЕНИЯ v3.1 (Final) ====================
let eqExpression = "";
let eqExpression2 = "";
let eqSolved = false;
let eqType = "linear";
let eqActiveInput = 1;

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
    
    if (type === "system") {
        document.getElementById("eqInput2Row").style.display = "flex";
    } else {
        document.getElementById("eqInput2Row").style.display = "none";
    }
    
    document.querySelectorAll(".eq-type-btn").forEach(btn => btn.classList.remove("active"));
    let btn = document.getElementById(`eqType_${type}`);
    if (btn) btn.classList.add("active");
}

function focusEqInput(num) {
    eqActiveInput = num;
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
        showResult(result);
        return;
    }
    
    const input = document.getElementById("eqInput1").value.trim();
    if (!input) return;
    eqExpression = input;
    
    if (eqType === "linear") {
        showResult(solveLinear(input));
    } else if (eqType === "quadratic") {
        showResult(solveQuadratic(input));
    }
}

function showResult(result) {
    if (result.error) {
        document.getElementById("eqSolution").style.display = "block";
        document.getElementById("eqCalcPad").style.display = "none";
        document.getElementById("eqSteps").innerHTML = `<div style="color:#FF5555; font-size:18px; text-align:center; padding:20px;">${result.error}</div>`;
        document.getElementById("eqAnswer").innerHTML = "";
        return;
    }
    
    eqSolved = true;
    document.getElementById("eqCalcPad").style.display = "none";
    document.getElementById("eqSolution").style.display = "block";
    
    let html = "";
    
    if (result.title) {
        html += `<div style="font-size:18px; font-weight:bold; color:#58A6FF; margin-bottom:8px;">${result.title}</div>`;
    }
    
    html += `<div style="font-size:18px; font-weight:bold; color:#FFD700; margin-bottom:12px;">${result.original}</div>`;
    html += `<div style="font-size:14px; color:#CCC; white-space:pre-line; line-height:2; margin-bottom:10px;">${result.steps}</div>`;
    
    if (result.answer) {
        html += `<div style="padding:15px; background:#1A2E1A; border-radius:8px; color:#2D8A4E; font-weight:bold; font-size:22px; text-align:center;">${result.answer}</div>`;
    }
    
    document.getElementById("eqSteps").innerHTML = html;
}

function solveLinear(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    if (!expr.includes("x")) return { error: "❌ Это не линейное уравнение (нет x)" };
    if (expr.includes("x^2") || expr.includes("x²")) return { error: "❌ Есть x² — перейди в «Квадратные»" };
    
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
    
    try { b -= eval(right.replace(/x/g, "0")) || 0; }
    catch(e) { return { error: "❌ Не удалось разобрать уравнение" }; }
    
    if (a === 0) return { error: "❌ Коэффициент при x равен 0" };
    
    let x = -b / a;
    
    return {
        original: input,
        steps: `${a}x + ${b} = 0\n${a}x = ${-b}\nx = ${-b} / ${a}\nx = ${x.toFixed(4)}`,
        answer: `x = ${x.toFixed(4)}`
    };
}

function solveQuadratic(input) {
    let expr = input.replace(/\s/g, "").replace(/,/g, ".");
    
    if (!expr.includes("x^2") && !expr.includes("x²")) return { error: "❌ Нет x² — перейди в «Линейные»" };
    
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
    
    if (a === 0) return { error: "❌ a = 0 — не квадратное" };
    
    let D = b*b - 4*a*c;
    let steps = `${a}x² + ${b}x + ${c} = 0\n\n`;
    steps += `D = b² − 4ac\n`;
    steps += `D = ${b}² − 4·${a}·${c}\n`;
    steps += `D = ${b*b} − ${4*a*c}\n`;
    steps += `D = ${D}\n\n`;
    
    if (D > 0) {
        let x1 = (-b + Math.sqrt(D)) / (2*a);
        let x2 = (-b - Math.sqrt(D)) / (2*a);
        steps += `D > 0 → два корня\n\n`;
        steps += `x₁ = (−b + √D) / 2a\n`;
        steps += `x₁ = (${-b} + ${Math.sqrt(D).toFixed(2)}) / ${2*a}\n`;
        steps += `x₁ = ${x1.toFixed(4)}\n\n`;
        steps += `x₂ = (−b − √D) / 2a\n`;
        steps += `x₂ = (${-b} − ${Math.sqrt(D).toFixed(2)}) / ${2*a}\n`;
        steps += `x₂ = ${x2.toFixed(4)}`;
        return { original: input, steps, answer: `x₁ = ${x1.toFixed(4)}  |  x₂ = ${x2.toFixed(4)}` };
    } else if (D === 0) {
        let x = -b / (2*a);
        steps += `D = 0 → один корень\n\n`;
        steps += `x = −b / 2a\n`;
        steps += `x = ${-b} / ${2*a}\n`;
        steps += `x = ${x.toFixed(4)}`;
        return { original: input, steps, answer: `x = ${x.toFixed(4)}` };
    } else {
        steps += `D < 0 → нет действительных корней`;
        return { original: input, steps, answer: `Нет действительных корней` };
    }
}

function solveSystem(input1, input2) {
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
    
    let e1 = parseEq(input1);
    let e2 = parseEq(input2);
    
    if ((e1.ax === 0 && e1.ay === 0) || (e2.ax === 0 && e2.ay === 0)) {
        return { error: "❌ Не удалось разобрать систему" };
    }
    
    let steps = `Система:\n${input1}\n${input2}\n\n`;
    steps += `Приводим к стандартному виду:\n`;
    steps += `${e1.ax}x + ${e1.ay}y = ${e1.bv}\n`;
    steps += `${e2.ax}x + ${e2.ay}y = ${e2.bv}\n\n`;
    
    // Пробуем подстановку
    if (e1.ax !== 0 && e1.ax === 1) {
        steps += `Метод подстановки:\n`;
        steps += `Из первого уравнения: x = ${e1.bv} − ${e1.ay}y\n\n`;
        steps += `Подставляем во второе:\n`;
        let newA = e2.ax * (-e1.ay) + e2.ay;
        let newB = e2.bv - e2.ax * e1.bv;
        steps += `${e2.ax}(${e1.bv} − ${e1.ay}y) + ${e2.ay}y = ${e2.bv}\n`;
        let y = newB / newA;
        let x = e1.bv - e1.ay * y;
        steps += `${newA}y = ${newB}\n`;
        steps += `y = ${y.toFixed(4)}\n\n`;
        steps += `x = ${e1.bv} − ${e1.ay}·${y.toFixed(4)}\n`;
        steps += `x = ${x.toFixed(4)}`;
        return { original: `${input1}  |  ${input2}`, steps, answer: `x = ${x.toFixed(4)}  |  y = ${y.toFixed(4)}` };
    }
    
    // Метод сложения
    steps += `Метод сложения:\n`;
    let mult1 = e2.ax;
    let mult2 = -e1.ax;
    steps += `Умножаем первое на ${mult1}, второе на ${mult2}:\n`;
    let a1 = e1.ax*mult1, b1 = e1.ay*mult1, c1 = e1.bv*mult1;
    let a2 = e2.ax*mult2, b2 = e2.ay*mult2, c2 = e2.bv*mult2;
    steps += `${a1}x + ${b1}y = ${c1}\n`;
    steps += `${a2}x + ${b2}y = ${c2}\n\n`;
    steps += `Складываем:\n`;
    let sumA = a1+a2, sumB = b1+b2, sumC = c1+c2;
    steps += `(${a1}+${a2})x + (${b1}+${b2})y = ${c1}+${c2}\n`;
    steps += `${sumA}x + ${sumB}y = ${sumC}\n`;
    
    if (sumA === 0 && sumB === 0) {
        if (sumC === 0) return { original: `${input1}  |  ${input2}`, steps: steps + `\n0 = 0 → бесконечно много решений`, answer: `Бесконечно много решений` };
        return { original: `${input1}  |  ${input2}`, steps: steps + `\n0 = ${sumC} → нет решений`, answer: `Нет решений` };
    }
    
    if (sumA === 0) {
        let y = sumC / sumB;
        let x = (e1.bv - e1.ay*y) / e1.ax;
        steps += `\ny = ${sumC} / ${sumB} = ${y.toFixed(4)}\n`;
        steps += `x = (${e1.bv} − ${e1.ay}·${y.toFixed(4)}) / ${e1.ax} = ${x.toFixed(4)}`;
        return { original: `${input1}  |  ${input2}`, steps, answer: `x = ${x.toFixed(4)}  |  y = ${y.toFixed(4)}` };
    }
    
    let x = sumC / sumA;
    let y = (e1.bv - e1.ax*x) / e1.ay;
    steps += `\nx = ${sumC} / ${sumA} = ${x.toFixed(4)}\n`;
    steps += `y = (${e1.bv} − ${e1.ax}·${x.toFixed(4)}) / ${e1.ay} = ${y.toFixed(4)}`;
    return { original: `${input1}  |  ${input2}`, steps, answer: `x = ${x.toFixed(4)}  |  y = ${y.toFixed(4)}` };
}
