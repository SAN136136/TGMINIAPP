// ==================== КАЛЬКУЛЯТОР v3.2 ====================
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
    document.getElementById("calcDisplay").style.display = "block";
    document.getElementById("calcResult").style.display = "block";
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
        document.getElementById("calcDisplay").style.display = "block";
        document.getElementById("calcResult").style.display = "block";
    } else if (mode === "equations") {
        document.getElementById("calcEqInputs").style.display = "block";
        document.getElementById("calcEquationBtns").style.display = "grid";
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
    } else if (mode === "geometry") {
        document.getElementById("calcGeoInputs").style.display = "block";
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
        if (!document.getElementById("geoShape").value) {
            document.getElementById("geoShape").value = "triangle";
        }
        switchGeoShape();
    } else if (mode === "physics") {
        document.getElementById("calcPhysInputs").style.display = "block";
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
        updatePhysFormula();
    } else if (mode === "converter") {
        document.getElementById("calcConverterOutput").style.display = "block";
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
    }
    
    calcClear();
}

// ==================== ГЕОМЕТРИЯ v3.2 ====================
let geoData = {};
let geoActiveCell = null;
let geoCalcExpr = "";

function switchGeoShape() {
    const shape = document.getElementById("geoShape").value;
    if (!shape) {
        document.getElementById("geoTable").style.display = "none";
        document.getElementById("geoCalcPad").style.display = "none";
        document.getElementById("geoError").textContent = "";
        geoActiveCell = null;
        return;
    }
    if (!geoData[shape]) geoData[shape] = {};
    document.getElementById("geoTable").style.display = "block";
    document.getElementById("geoCalcPad").style.display = "block";
    document.getElementById("geoError").textContent = "";
    geoActiveCell = null;
    geoCalcExpr = "";
    document.getElementById("geoCalcDisplay").textContent = "0";
    renderGeoTable(shape);
}

function clearGeoTable() {
    const shape = document.getElementById("geoShape").value;
    if (!shape) return;
    geoData[shape] = {};
    geoActiveCell = null;
    geoCalcExpr = "";
    document.getElementById("geoCalcDisplay").textContent = "0";
    document.getElementById("geoError").textContent = "";
    renderGeoTable(shape);
}

function renderGeoTable(shape) {
    const table = document.getElementById("geoTable");
    const fields = getGeoFields(shape);
    const cols = (shape === "triangle") ? 2 : 1;
    
    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <span style="color:#888; font-size:11px;">Введи известные данные</span>
        <button class="calc-btn calc-btn-clear" onclick="clearGeoTable()" style="padding:6px 10px; font-size:11px;">🗑 Очистить</button>
    </div>`;
    html += `<table class="geo-table" style="width:100%;">`;
    html += "<tr><th>Параметр</th><th>Значение</th><th></th>";
    if (cols === 2) html += "<th>Параметр</th><th>Значение</th><th></th>";
    html += "</tr>";
    
    for (let i = 0; i < fields.length; i += cols) {
        html += "<tr>";
        for (let j = 0; j < cols; j++) {
            const f = fields[i + j];
            if (f) {
                const rawVal = geoData[shape][f.key];
                const computed = computeGeoField(shape, f.key);
                let displayVal;
                let isComputed = false;
                
                if (computed !== null) {
                    displayVal = computed;
                    isComputed = true;
                } else if (rawVal !== undefined && rawVal !== "") {
                    displayVal = rawVal;
                } else {
                    displayVal = "н/д";
                }
                
                html += `<td style="padding:6px 8px;">${f.label}</td>
                    <td class="geo-val ${isComputed ? 'geo-computed' : ''}" 
                        onclick="editGeoCell('${shape}', '${f.key}')"
                        style="padding:6px 8px; cursor:pointer; ${isComputed ? 'color:#58A6FF;font-weight:bold;' : 'color:#CCC;'}">
                        ${displayVal}
                    </td>
                    <td style="padding:6px 4px;">
                        <button class="geo-info-btn" onclick="showGeoFormula('${shape}', '${f.key}')">!</button>
                    </td>`;
            } else {
                html += "<td></td><td></td><td></td>";
            }
        }
        html += "</tr>";
    }
    html += "</table>";
    table.innerHTML = html;
    
    const error = checkGeoImpossible(shape);
    document.getElementById("geoError").textContent = error || "";
}

function editGeoCell(shape, field) {
    geoActiveCell = { shape, field };
    document.getElementById("geoCalcPad").style.display = "block";
    geoCalcExpr = geoData[shape][field] !== undefined ? String(geoData[shape][field]) : "";
    document.getElementById("geoCalcDisplay").textContent = geoCalcExpr || "0";
}

function geoCalcInput(val) {
    if (geoCalcExpr === "" && "0123456789".includes(val)) geoCalcExpr = val;
    else geoCalcExpr += val;
    document.getElementById("geoCalcDisplay").textContent = geoCalcExpr || "0";
    liveGeoUpdate();
}

function geoCalcClear() { geoCalcExpr = ""; document.getElementById("geoCalcDisplay").textContent = "0"; liveGeoUpdate(); }
function geoCalcBackspace() { geoCalcExpr = geoCalcExpr.slice(0, -1); document.getElementById("geoCalcDisplay").textContent = geoCalcExpr || "0"; liveGeoUpdate(); }

function liveGeoUpdate() {
    if (!geoActiveCell) return;
    let val = geoCalcExpr.trim();
    
    try {
        let expr = val.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-")
            .replace(/π/g, String(Math.PI)).replace(/²/g, "**2").replace(/\^/g, "**");
        expr = expr.replace(/sqrt\(/g, "Math.sqrt(");
        let result = eval(expr);
        if (result !== undefined && !isNaN(result) && isFinite(result)) {
            val = Math.round(result * 1000000) / 1000000;
        }
    } catch (e) {}
    
    if (val !== "" && val !== undefined) {
        geoData[geoActiveCell.shape][geoActiveCell.field] = val;
        // Если пользователь вводит угол вручную, ставим пометку
        if (geoActiveCell.field === "A" || geoActiveCell.field === "B" || geoActiveCell.field === "C") {
            geoData[geoActiveCell.shape][geoActiveCell.field + "_manual"] = val;
        }
    } else if (geoCalcExpr === "") {
        delete geoData[geoActiveCell.shape][geoActiveCell.field];
        if (geoActiveCell.field === "A" || geoActiveCell.field === "B" || geoActiveCell.field === "C") {
            delete geoData[geoActiveCell.shape][geoActiveCell.field + "_manual"];
        }
    }
    renderGeoTable(document.getElementById("geoShape").value);
}

function getGeoFields(shape) {
    if (shape === "circle") return [
        { key: "R", label: "Радиус (R)" },
        { key: "D", label: "Диаметр (D)" },
        { key: "S", label: "Площадь (S)" },
        { key: "C", label: "Длина окр. (C)" }
    ];
    if (shape === "triangle") return [
        { key: "a", label: "Сторона a" },
        { key: "b", label: "Сторона b" },
        { key: "c", label: "Сторона c" },
        { key: "A", label: "Угол A (°)" },
        { key: "B", label: "Угол B (°)" },
        { key: "C", label: "Угол C (°)" },
        { key: "S", label: "Площадь (S)" },
        { key: "P", label: "Периметр (P)" }
    ];
    if (shape === "rectangle") return [
        { key: "a", label: "Длина (a)" },
        { key: "b", label: "Ширина (b)" },
        { key: "S", label: "Площадь (S)" },
        { key: "P", label: "Периметр (P)" }
    ];
    if (shape === "cylinder") return [
        { key: "R", label: "Радиус (R)" },
        { key: "h", label: "Высота (h)" },
        { key: "V", label: "Объём (V)" },
        { key: "S_side", label: "Боковая пов-ть"},
        { key: "S_full", label: "Полная пов-ть"}
    ];
    return [];
}

function computeGeoField(shape, field) {
    const d = geoData[shape];
    if (!d) return null;
    
    if (shape === "circle") {
        const R = d.R !== undefined ? parseFloat(d.R) : null;
        if (field === "R") return R !== null ? R : null;
        if (field === "D" && R !== null) return (2 * R).toFixed(4);
        if (field === "S" && R !== null) return (Math.PI * R * R).toFixed(4);
        if (field === "C" && R !== null) return (2 * Math.PI * R).toFixed(4);
    }
    if (shape === "triangle") {
        const a = d.a !== undefined ? parseFloat(d.a) : null;
        const b = d.b !== undefined ? parseFloat(d.b) : null;
        const c = d.c !== undefined ? parseFloat(d.c) : null;
        const A_manual = d.A_manual !== undefined ? parseFloat(d.A_manual) : null;
        const B_manual = d.B_manual !== undefined ? parseFloat(d.B_manual) : null;
        const C_manual = d.C_manual !== undefined ? parseFloat(d.C_manual) : null;
        
        if (field === "a") return a;
        if (field === "b") return b;
        if (field === "c") return c;
        
        if (field === "A") {
            if (A_manual !== null) return A_manual;
            if (B_manual !== null && C_manual !== null) {
                const calcA = 180 - B_manual - C_manual;
                if (calcA > 0 && calcA < 180) return calcA.toFixed(4);
            }
            if (a !== null && b !== null && c !== null) {
                const cosA = (b*b + c*c - a*a) / (2*b*c);
                if (cosA >= -1 && cosA <= 1) return (Math.acos(cosA) * 180 / Math.PI).toFixed(4);
            }
            return null;
        }
        if (field === "B") {
            if (B_manual !== null) return B_manual;
            if (A_manual !== null && C_manual !== null) {
                const calcB = 180 - A_manual - C_manual;
                if (calcB > 0 && calcB < 180) return calcB.toFixed(4);
            }
            if (a !== null && b !== null && c !== null) {
                const cosB = (a*a + c*c - b*b) / (2*a*c);
                if (cosB >= -1 && cosB <= 1) return (Math.acos(cosB) * 180 / Math.PI).toFixed(4);
            }
            return null;
        }
        if (field === "C") {
            if (C_manual !== null) return C_manual;
            if (A_manual !== null && B_manual !== null) {
                const calcC = 180 - A_manual - B_manual;
                if (calcC > 0 && calcC < 180) return calcC.toFixed(4);
            }
            if (a !== null && b !== null && c !== null) {
                const cosC = (a*a + b*b - c*c) / (2*a*b);
                if (cosC >= -1 && cosC <= 1) return (Math.acos(cosC) * 180 / Math.PI).toFixed(4);
            }
            return null;
        }
        if (field === "P" && a !== null && b !== null && c !== null) return (a + b + c).toFixed(4);
        if (field === "S" && a !== null && b !== null && c !== null) {
            const p = (a + b + c) / 2;
            const S = Math.sqrt(p * (p - a) * (p - b) * (p - c));
            return isNaN(S) ? null : S.toFixed(4);
        }
    }
    if (shape === "rectangle") {
        const a = d.a !== undefined ? parseFloat(d.a) : null;
        const b = d.b !== undefined ? parseFloat(d.b) : null;
        if (field === "a") return a;
        if (field === "b") return b;
        if (field === "S" && a !== null && b !== null) return (a * b).toFixed(4);
        if (field === "P" && a !== null && b !== null) return (2 * (a + b)).toFixed(4);
    }
    if (shape === "cylinder") {
        const R = d.R !== undefined ? parseFloat(d.R) : null;
        const h = d.h !== undefined ? parseFloat(d.h) : null;
        if (field === "R") return R;
        if (field === "h") return h;
        if (field === "V" && R !== null && h !== null) return (Math.PI * R * R * h).toFixed(4);
        if (field === "S_side" && R !== null && h !== null) return (2 * Math.PI * R * h).toFixed(4);
        if (field === "S_full" && R !== null && h !== null) return (2 * Math.PI * R * (R + h)).toFixed(4);
    }
    return null;
}

function checkGeoImpossible(shape) {
    const d = geoData[shape];
    if (!d) return null;
    
    if (shape === "triangle") {
        const a = d.a !== undefined ? parseFloat(d.a) : null;
        const b = d.b !== undefined ? parseFloat(d.b) : null;
        const c = d.c !== undefined ? parseFloat(d.c) : null;
        if (a !== null && b !== null && c !== null) {
            if (a + b <= c || a + c <= b || b + c <= a) return "❌ Такого треугольника не существует";
        }
        const A = d.A_manual !== undefined ? parseFloat(d.A_manual) : null;
        const B = d.B_manual !== undefined ? parseFloat(d.B_manual) : null;
        const C = d.C_manual !== undefined ? parseFloat(d.C_manual) : null;
        if (A !== null && (A <= 0 || A >= 180)) return "❌ Угол должен быть от 0 до 180°";
        if (B !== null && (B <= 0 || B >= 180)) return "❌ Угол должен быть от 0 до 180°";
        if (C !== null && (C <= 0 || C >= 180)) return "❌ Угол должен быть от 0 до 180°";
        if (A !== null && B !== null && C !== null && Math.abs(A + B + C - 180) > 0.5) return "❌ Сумма углов ≠ 180°";
    }
    if (shape === "circle" || shape === "cylinder") {
        const R = d.R !== undefined ? parseFloat(d.R) : null;
        if (R !== null && R <= 0) return "❌ Радиус должен быть > 0";
    }
    if (shape === "rectangle") {
        const a = d.a !== undefined ? parseFloat(d.a) : null;
        const b = d.b !== undefined ? parseFloat(d.b) : null;
        if (a !== null && a <= 0) return "❌ Сторона должна быть > 0";
        if (b !== null && b <= 0) return "❌ Сторона должна быть > 0";
    }
    return null;
}

function showGeoFormula(shape, field) {
    const d = geoData[shape];
    let formulaText = "";
    let appliedText = "";
    
    if (shape === "circle") {
        const formulas = { D: "D = 2R", S: "S = πR²", C: "C = 2πR" };
        formulaText = formulas[field] || "";
        const R = d?.R !== undefined ? parseFloat(d.R) : null;
        if (R !== null) {
            if (field === "D") appliedText = `D = 2 × ${R} = ${(2*R).toFixed(4)}`;
            else if (field === "S") appliedText = `S = π × ${R}² = ${(Math.PI*R*R).toFixed(4)}`;
            else if (field === "C") appliedText = `C = 2 × π × ${R} = ${(2*Math.PI*R).toFixed(4)}`;
        }
    } else if (shape === "triangle") {
        const formulas = { 
            P: "P = a + b + c", 
            S: "S = √(p(p-a)(p-b)(p-c)), p = (a+b+c)/2",
            A: "A = 180° − B − C (по двум углам)\ncos A = (b² + c² − a²) / (2bc) (по сторонам)",
            B: "B = 180° − A − C (по двум углам)\ncos B = (a² + c² − b²) / (2ac) (по сторонам)",
            C: "C = 180° − A − B (по двум углам)\ncos C = (a² + b² − c²) / (2ab) (по сторонам)"
        };
        formulaText = formulas[field] || "";
        const a = d?.a !== undefined ? parseFloat(d.a) : null;
        const b = d?.b !== undefined ? parseFloat(d.b) : null;
        const c = d?.c !== undefined ? parseFloat(d.c) : null;
        const A = d?.A_manual !== undefined ? parseFloat(d.A_manual) : null;
        const B = d?.B_manual !== undefined ? parseFloat(d.B_manual) : null;
        const C = d?.C_manual !== undefined ? parseFloat(d.C_manual) : null;
        
        if (field === "P" && a!==null && b!==null && c!==null) appliedText = `P = ${a} + ${b} + ${c} = ${(a+b+c).toFixed(4)}`;
        else if (field === "S" && a!==null && b!==null && c!==null) {
            const p = (a+b+c)/2;
            appliedText = `p = (${a}+${b}+${c})/2 = ${p.toFixed(2)}\nS = √(${p.toFixed(2)} × ${(p-a).toFixed(2)} × ${(p-b).toFixed(2)} × ${(p-c).toFixed(2)}) = ${(Math.sqrt(p*(p-a)*(p-b)*(p-c))).toFixed(4)}`;
        } else if (field === "A") {
            if (B !== null && C !== null) appliedText = `A = 180° − ${B} − ${C} = ${(180-B-C).toFixed(4)}°`;
            else if (a !== null && b !== null && c !== null) {
                const cosA = (b*b + c*c - a*a) / (2*b*c);
                appliedText = `cos A = (${b}² + ${c}² − ${a}²) / (2×${b}×${c}) = ${cosA.toFixed(4)}\nA = arccos(${cosA.toFixed(4)}) = ${(Math.acos(cosA)*180/Math.PI).toFixed(4)}°`;
            }
        } else if (field === "B") {
            if (A !== null && C !== null) appliedText = `B = 180° − ${A} − ${C} = ${(180-A-C).toFixed(4)}°`;
            else if (a !== null && b !== null && c !== null) {
                const cosB = (a*a + c*c - b*b) / (2*a*c);
                appliedText = `cos B = (${a}² + ${c}² − ${b}²) / (2×${a}×${c}) = ${cosB.toFixed(4)}\nB = arccos(${cosB.toFixed(4)}) = ${(Math.acos(cosB)*180/Math.PI).toFixed(4)}°`;
            }
        } else if (field === "C") {
            if (A !== null && B !== null) appliedText = `C = 180° − ${A} − ${B} = ${(180-A-B).toFixed(4)}°`;
            else if (a !== null && b !== null && c !== null) {
                const cosC = (a*a + b*b - c*c) / (2*a*b);
                appliedText = `cos C = (${a}² + ${b}² − ${c}²) / (2×${a}×${b}) = ${cosC.toFixed(4)}\nC = arccos(${cosC.toFixed(4)}) = ${(Math.acos(cosC)*180/Math.PI).toFixed(4)}°`;
            }
        }
    } else if (shape === "rectangle") {
        const formulas = { S: "S = a × b", P: "P = 2(a + b)" };
        formulaText = formulas[field] || "";
        const a = d?.a !== undefined ? parseFloat(d.a) : null;
        const b = d?.b !== undefined ? parseFloat(d.b) : null;
        if (field === "S" && a!==null && b!==null) appliedText = `S = ${a} × ${b} = ${(a*b).toFixed(4)}`;
        else if (field === "P" && a!==null && b!==null) appliedText = `P = 2 × (${a} + ${b}) = ${(2*(a+b)).toFixed(4)}`;
    } else if (shape === "cylinder") {
        const formulas = { V: "V = πR²h", S_side: "S(бок) = 2πRh", S_full: "S(полн) = 2πR(R+h)" };
        formulaText = formulas[field] || "";
        const R = d?.R !== undefined ? parseFloat(d.R) : null;
        const h = d?.h !== undefined ? parseFloat(d.h) : null;
        if (field === "V" && R!==null && h!==null) appliedText = `V = π × ${R}² × ${h} = ${(Math.PI*R*R*h).toFixed(4)}`;
        else if (field === "S_side" && R!==null && h!==null) appliedText = `S(бок) = 2 × π × ${R} × ${h} = ${(2*Math.PI*R*h).toFixed(4)}`;
        else if (field === "S_full" && R!==null && h!==null) appliedText = `S(полн) = 2 × π × ${R} × (${R} + ${h}) = ${(2*Math.PI*R*(R+h)).toFixed(4)}`;
    }
    
    if (!formulaText) formulaText = "Нет формулы для этого параметра";
    if (!appliedText) appliedText = "Недостаточно данных для расчёта";
    
    const content = `
        <div style="margin-bottom:10px; color:#FFD700; font-size:14px;">${formulaText}</div>
        <div style="color:#58A6FF; font-size:14px; white-space:pre-line;">${appliedText}</div>
    `;
    
    document.getElementById("calcModal").style.display = "none";
    document.getElementById("cheatsheetContent").innerHTML = content;
    document.getElementById("cheatsheetModal").style.display = "flex";
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
