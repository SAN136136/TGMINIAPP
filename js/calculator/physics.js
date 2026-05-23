// ==================== ФИЗИКА v2.2 — Решатель ====================
let physGivens = [];
let physFinds = [];
let physShowAddGiven = false;
let physShowAddFind = false;
let physError = "";

const physQuantities = [
    { symbol: "v0", name: "Начальная скорость (v₀)", unit: "м/с" },
    { symbol: "v", name: "Скорость (v)", unit: "м/с" },
    { symbol: "a", name: "Ускорение (a)", unit: "м/с²" },
    { symbol: "t", name: "Время (t)", unit: "с" },
    { symbol: "S", name: "Путь (S)", unit: "м" },
    { symbol: "F", name: "Сила (F)", unit: "Н" },
    { symbol: "m", name: "Масса (m)", unit: "кг" },
    { symbol: "P", name: "Давление (P)", unit: "Па" },
    { symbol: "A", name: "Площадь (S)", unit: "м²" },
    { symbol: "I", name: "Сила тока (I)", unit: "А" },
    { symbol: "U", name: "Напряжение (U)", unit: "В" },
    { symbol: "R", name: "Сопротивление (R)", unit: "Ом" },
];

const physFormulas = [
    // Кинематика
    { expr: "S = v₀t + at²/2", needs: ["v0", "t", "a"], gives: "S", name: "Путь при равноускоренном движении" },
    { expr: "v = v₀ + at", needs: ["v0", "a", "t"], gives: "v", name: "Скорость при равноускоренном движении" },
    { expr: "S = vt", needs: ["v", "t"], gives: "S", name: "Путь при равномерном движении" },
    { expr: "v = S/t", needs: ["S", "t"], gives: "v", name: "Скорость при равномерном движении" },
    // Динамика
    { expr: "F = ma", needs: ["m", "a"], gives: "F", name: "Второй закон Ньютона" },
    { expr: "a = F/m", needs: ["F", "m"], gives: "a", name: "Ускорение по второму закону Ньютона" },
    // Давление
    { expr: "P = F/S", needs: ["F", "A"], gives: "P", name: "Давление" },
    // Электричество
    { expr: "I = U/R", needs: ["U", "R"], gives: "I", name: "Закон Ома" },
    { expr: "U = IR", needs: ["I", "R"], gives: "U", name: "Напряжение по закону Ома" },
];

// ==================== ОТРИСОВКА ====================
function renderPhysSolver() {
    const container = document.getElementById("physSolver");
    if (!container) return;
    
    let html = "";
    
    // Сообщение об ошибке
    if (physError) {
        html += `<div style="color:#FF5555; font-size:12px; margin-bottom:8px; text-align:center;">${physError}</div>`;
    }
    
    // === ДАНО ===
    html += `<div style="margin-bottom:15px;">
        <div style="font-weight:bold; color:#58A6FF; margin-bottom:8px;">📥 ДАНО</div>`;
    
    physGivens.forEach((g, i) => {
        html += `<div style="display:flex; align-items:center; gap:8px; background:#1A1A2E; padding:8px; border-radius:6px; margin-bottom:5px;">
            <span style="color:#FFD700; font-size:14px;">${g.name} =</span>
            <input type="number" value="${g.value}" 
                onchange="updateGiven(${i}, this.value)" 
                style="width:80px; background:#0A0A14; border:1px solid #3A5A6B; color:white; padding:6px; border-radius:4px; font-size:14px;"
                inputmode="decimal">
            <span style="color:#888; font-size:12px;">${g.unit}</span>
            <button onclick="removeGiven(${i})" style="background:none; border:none; color:#C72A2A; cursor:pointer; font-size:16px;">✕</button>
        </div>`;
    });
    
    html += `<div style="position:relative;">
        <button onclick="toggleAddGiven()" style="width:100%; padding:10px; background:#2A2A3E; border:1px dashed #58A6FF; color:#58A6FF; border-radius:6px; cursor:pointer;">+ Добавить</button>`;
    if (physShowAddGiven) {
        html += `<div style="position:absolute; top:100%; left:0; right:0; background:#1A1A2E; border:1px solid #3A5A6B; border-radius:6px; max-height:200px; overflow-y:auto; z-index:10;">
            <input type="text" placeholder="🔍 Поиск..." oninput="filterGiven(this.value)" style="width:100%; padding:8px; background:#0A0A14; border:none; color:white;">
            ${physQuantities.map(q => `
                <div onclick="addGiven('${q.symbol}', '${q.name}', '${q.unit}')" 
                    style="padding:8px; cursor:pointer; color:#CCC; border-bottom:1px solid #2A2A3E;"
                    onmouseover="this.style.background='#2A2A3E'" onmouseout="this.style.background=''">${q.name} (${q.unit})</div>
            `).join('')}
        </div>`;
    }
    html += `</div></div>`;
    
    // === НАЙТИ ===
    html += `<div style="margin-bottom:15px;">
        <div style="font-weight:bold; color:#58A6FF; margin-bottom:8px;">🔍 НАЙТИ</div>`;
    
    physFinds.forEach((f, i) => {
        html += `<div style="display:flex; align-items:center; justify-content:space-between; background:#1A1A2E; padding:8px; border-radius:6px; margin-bottom:5px;">
            <span style="color:#FFD700; font-size:14px;">${f.name}</span>
            <button onclick="removeFind(${i})" style="background:none; border:none; color:#C72A2A; cursor:pointer; font-size:16px;">✕</button>
        </div>`;
    });
    
    html += `<div style="position:relative;">
        <button onclick="toggleAddFind()" style="width:100%; padding:10px; background:#2A2A3E; border:1px dashed #58A6FF; color:#58A6FF; border-radius:6px; cursor:pointer;">+ Добавить</button>`;
    if (physShowAddFind) {
        html += `<div style="position:absolute; top:100%; left:0; right:0; background:#1A1A2E; border:1px solid #3A5A6B; border-radius:6px; max-height:200px; overflow-y:auto; z-index:10;">
            ${physQuantities.map(q => `
                <div onclick="addFind('${q.symbol}', '${q.name}')" 
                    style="padding:8px; cursor:pointer; color:#CCC; border-bottom:1px solid #2A2A3E;"
                    onmouseover="this.style.background='#2A2A3E'" onmouseout="this.style.background=''">${q.name}</div>
            `).join('')}
        </div>`;
    }
    html += `</div></div>`;
    
    // === РЕШЕНИЕ ===
    html += `<div style="margin-bottom:15px;">
        <div style="font-weight:bold; color:#58A6FF; margin-bottom:8px;">📤 РЕШЕНИЕ</div>
        <div style="color:#888; font-size:13px; min-height:50px;" id="physSolutionContent">Нажми "Решить"</div>
    </div>`;
    
    html += `<div style="display:flex; gap:10px;">
        <button class="calc-btn calc-btn-eq" onclick="physSolve()" style="flex:1;">🧠 Решить</button>
        <button class="calc-btn calc-btn-clear" onclick="physClear()" style="flex:1;">🗑 Очистить</button>
    </div>`;
    
    container.innerHTML = html;
}

// ==================== ДЕЙСТВИЯ ====================
function toggleAddGiven() { physShowAddGiven = !physShowAddGiven; physShowAddFind = false; renderPhysSolver(); }
function toggleAddFind() { physShowAddFind = !physShowAddFind; physShowAddGiven = false; renderPhysSolver(); }

function addGiven(symbol, name, unit) {
    // Проверка на повтор
    if (physGivens.find(g => g.symbol === symbol)) {
        physError = `⚠️ Величина "${name}" уже добавлена`;
        renderPhysSolver();
        setTimeout(() => { physError = ""; renderPhysSolver(); }, 2000);
        return;
    }
    physError = "";
    physGivens.push({ symbol, name, value: 0, unit });
    physShowAddGiven = false;
    renderPhysSolver();
}

function addFind(symbol, name) {
    if (!physFinds.find(f => f.symbol === symbol)) {
        physFinds.push({ symbol, name });
    } else {
        physError = `⚠️ Величина "${name}" уже в списке`;
        renderPhysSolver();
        setTimeout(() => { physError = ""; renderPhysSolver(); }, 2000);
        return;
    }
    physError = "";
    physShowAddFind = false;
    renderPhysSolver();
}

function updateGiven(index, value) { physGivens[index].value = parseFloat(value) || 0; }
function removeGiven(index) { physGivens.splice(index, 1); renderPhysSolver(); }
function removeFind(index) { physFinds.splice(index, 1); renderPhysSolver(); }

function physClear() {
    physGivens = [];
    physFinds = [];
    physError = "";
    document.getElementById("physSolutionContent").innerHTML = `Нажми "Решить"`;
    renderPhysSolver();
}

// ==================== РЕШАТЕЛЬ ====================
function physSolve() {
    const known = {};
    physGivens.forEach(g => { known[g.symbol] = g.value; });
    
    if (physFinds.length === 0) {
        document.getElementById("physSolutionContent").innerHTML = "❌ Выбери, что найти";
        return;
    }
    
    let steps = "";
    let changed = true;
    
    while (changed) {
        changed = false;
        for (let formula of physFormulas) {
            const { expr, needs, gives, name } = formula;
            if (known[gives] !== undefined) continue;
            if (needs.every(n => known[n] !== undefined)) {
                let result;
                switch(gives) {
                    case "S":
                        if (needs.length === 3) result = known["v0"] * known["t"] + known["a"] * known["t"] * known["t"] / 2;
                        else if (known["v"] !== undefined) result = known["v"] * known["t"];
                        break;
                    case "v":
                        if (known["v0"] !== undefined) result = known["v0"] + known["a"] * known["t"];
                        else result = known["S"] / known["t"];
                        break;
                    case "F": result = known["m"] * known["a"]; break;
                    case "a": result = known["F"] / known["m"]; break;
                    case "P": result = known["F"] / known["A"]; break;
                    case "I": result = known["U"] / known["R"]; break;
                    case "U": result = known["I"] * known["R"]; break;
                }
                
                if (result !== undefined) {
                    steps += `<div style="margin-bottom:10px; padding:10px; background:#1A1A2E; border-radius:8px;">
                        <div style="color:#FFD700; font-size:14px; font-weight:bold;">${name}</div>
                        <div style="color:#58A6FF; font-size:15px; margin-top:8px;">${expr}</div>
                        <div style="color:#CCC; font-size:13px; margin-top:5px;">${gives} = ${result.toFixed(2)} ${physQuantities.find(q => q.symbol === gives)?.unit || ''}</div>
                        <span onclick="showPhysDetail('${gives}', known, '${name}', '${expr}', ${result})" 
                            style="color:#888; font-size:11px; cursor:pointer; margin-top:8px; display:inline-block;">📋 Подробнее</span>
                    </div>`;
                    known[gives] = result;
                    changed = true;
                }
            }
        }
    }
    
    if (steps === "") {
        steps = "❌ Не удалось найти решение с текущими формулами";
    } else {
        physFinds.forEach(f => {
            if (known[f.symbol] !== undefined) {
                const q = physQuantities.find(q => q.symbol === f.symbol);
                steps += `<div style="margin-top:5px; padding:10px; background:#1A2E1A; border-radius:6px; color:#2D8A4E; font-weight:bold;">
                    ✅ ${f.name} = ${known[f.symbol].toFixed(2)} ${q ? q.unit : ''}
                </div>`;
            } else {
                steps += `<div style="margin-top:5px; padding:10px; background:#2E1A1A; border-radius:6px; color:#C72A2A;">
                    ❌ ${f.name} — недостаточно данных
                </div>`;
            }
        });
    }
    
    document.getElementById("physSolutionContent").innerHTML = steps;
}

function showPhysDetail(gives, known, name, expr, result) {
    const q = physQuantities.find(q => q.symbol === gives);
    
    let detailHtml = "";
    for (let [key, val] of Object.entries(known)) {
        const qty = physQuantities.find(q => q.symbol === key);
        if (qty) {
            detailHtml += `${qty.name} = ${val} ${qty.unit}\n`;
        }
    }
    
    const content = `
        <div style="text-align:center; margin-bottom:15px;">
            <div style="color:#FFD700; font-size:18px; font-weight:bold;">${name}</div>
            <div style="color:#58A6FF; font-size:16px; margin-top:8px;">${expr}</div>
        </div>
        <div style="border-top:1px solid #2A2A3E; padding-top:10px; color:#CCC; font-size:13px; white-space:pre-line;">
            Дано:
            ${detailHtml}
            Результат:
            ${gives} = ${result.toFixed(2)} ${q ? q.unit : ''} ✅
        </div>
    `;
    
    document.getElementById("calcModal").style.display = "none";
    document.getElementById("cheatsheetContent").innerHTML = content;
    document.getElementById("cheatsheetModal").style.display = "flex";
}
