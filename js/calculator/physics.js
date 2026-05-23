// ==================== ФИЗИКА v2.0 — Решатель ====================
let physGivens = [];  // [{ symbol: "v0", name: "Нач. скорость", value: 10, unit: "м/с" }]
let physFinds = [];   // [{ symbol: "S", name: "Путь" }]
let physShowAddGiven = false;
let physShowAddFind = false;

const physQuantities = [
    { symbol: "v0", name: "Начальная скорость (v₀)", unit: "м/с" },
    { symbol: "v", name: "Скорость (v)", unit: "м/с" },
    { symbol: "a", name: "Ускорение (a)", unit: "м/с²" },
    { symbol: "t", name: "Время (t)", unit: "с" },
    { symbol: "S", name: "Путь (S)", unit: "м" },
    { symbol: "F", name: "Сила (F)", unit: "Н" },
    { symbol: "m", name: "Масса (m)", unit: "кг" },
];

// Формулы (пока одна для теста)
const physFormulas = [
    { expr: "S = v0*t + a*t*t/2", needs: ["v0", "t", "a"], gives: "S" },
];

// ==================== ОТРИСОВКА ====================
function renderPhysSolver() {
    const container = document.getElementById("physSolver");
    if (!container) return;
    
    let html = `<div style="display:grid; grid-template-columns: 1fr 2px 1fr; gap:15px; min-height:300px;">`;
    
    // === ЛЕВЫЙ СТОЛБЕЦ: ДАНО + НАЙТИ ===
    html += `<div style="display:flex; flex-direction:column; gap:10px;">`;
    html += `<div style="font-weight:bold; color:#58A6FF; margin-bottom:5px;">📥 ДАНО</div>`;
    
    // Список данных
    physGivens.forEach((g, i) => {
        html += `<div style="display:flex; align-items:center; gap:8px; background:#1A1A2E; padding:8px; border-radius:6px;">
            <span style="color:#FFD700; font-size:14px;">${g.name} =</span>
            <input type="number" value="${g.value}" 
                onchange="updateGiven(${i}, this.value)" 
                style="width:80px; background:#0A0A14; border:1px solid #3A5A6B; color:white; padding:6px; border-radius:4px; font-size:14px;"
                inputmode="decimal">
            <span style="color:#888; font-size:12px;">${g.unit}</span>
            <button onclick="removeGiven(${i})" style="background:none; border:none; color:#C72A2A; cursor:pointer; font-size:16px;">✕</button>
        </div>`;
    });
    
    // Кнопка "+ Добавить"
    html += `<div style="position:relative;">
        <button onclick="toggleAddGiven()" style="width:100%; padding:10px; background:#2A2A3E; border:1px dashed #58A6FF; color:#58A6FF; border-radius:6px; cursor:pointer;">+ Добавить</button>`;
    if (physShowAddGiven) {
        html += `<div style="position:absolute; top:100%; left:0; right:0; background:#1A1A2E; border:1px solid #3A5A6B; border-radius:6px; max-height:200px; overflow-y:auto; z-index:10;">`;
        html += `<input type="text" placeholder="🔍 Поиск..." oninput="filterGiven(this.value)" style="width:100%; padding:8px; background:#0A0A14; border:none; color:white;">`;
        physQuantities.forEach(q => {
            html += `<div onclick="addGiven('${q.symbol}', '${q.name}', '${q.unit}')" 
                style="padding:8px; cursor:pointer; color:#CCC; border-bottom:1px solid #2A2A3E;"
                onmouseover="this.style.background='#2A2A3E'" onmouseout="this.style.background=''">${q.name} (${q.unit})</div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;
    
    // Разделитель
    html += `<div style="border-bottom:2px solid #3A5A6B; margin:5px 0;"></div>`;
    
    // Секция НАЙТИ
    html += `<div style="font-weight:bold; color:#58A6FF; margin-bottom:5px;">🔍 НАЙТИ</div>`;
    physFinds.forEach((f, i) => {
        html += `<div style="display:flex; align-items:center; justify-content:space-between; background:#1A1A2E; padding:8px; border-radius:6px;">
            <span style="color:#FFD700; font-size:14px;">${f.name}</span>
            <button onclick="removeFind(${i})" style="background:none; border:none; color:#C72A2A; cursor:pointer; font-size:16px;">✕</button>
        </div>`;
    });
    
    // Кнопка "+ Добавить" для НАЙТИ
    html += `<div style="position:relative;">
        <button onclick="toggleAddFind()" style="width:100%; padding:10px; background:#2A2A3E; border:1px dashed #58A6FF; color:#58A6FF; border-radius:6px; cursor:pointer;">+ Добавить</button>`;
    if (physShowAddFind) {
        html += `<div style="position:absolute; top:100%; left:0; right:0; background:#1A1A2E; border:1px solid #3A5A6B; border-radius:6px; max-height:200px; overflow-y:auto; z-index:10;">`;
        physQuantities.forEach(q => {
            html += `<div onclick="addFind('${q.symbol}', '${q.name}')" 
                style="padding:8px; cursor:pointer; color:#CCC; border-bottom:1px solid #2A2A3E;"
                onmouseover="this.style.background='#2A2A3E'" onmouseout="this.style.background=''">${q.name}</div>`;
        });
        html += `</div>`;
    }
    html += `</div>`;
    
    html += `</div>`; // конец левого столбца
    
    // === РАЗДЕЛИТЕЛЬ ===
    html += `<div style="background:#3A5A6B; width:2px; border-radius:1px;"></div>`;
    
    // === ПРАВЫЙ СТОЛБЕЦ: РЕШЕНИЕ ===
    html += `<div style="display:flex; flex-direction:column; gap:5px;" id="physSolution">`;
    html += `<div style="font-weight:bold; color:#58A6FF; margin-bottom:5px;">📤 РЕШЕНИЕ</div>`;
    html += `<div style="color:#888; font-size:13px;" id="physSolutionContent">Нажми "Решить"</div>`;
    html += `</div>`;
    
    html += `</div>`; // конец grid
    
    // Кнопки
    html += `<div style="display:flex; gap:10px; margin-top:15px;">
        <button class="calc-btn calc-btn-eq" onclick="physSolve()" style="flex:1;">🧠 Решить</button>
        <button class="calc-btn calc-btn-clear" onclick="physClear()" style="flex:1;">🗑 Очистить</button>
    </div>`;
    
    container.innerHTML = html;
}

// ==================== ДЕЙСТВИЯ ====================
function toggleAddGiven() { physShowAddGiven = !physShowAddGiven; physShowAddFind = false; renderPhysSolver(); }
function toggleAddFind() { physShowAddFind = !physShowAddFind; physShowAddGiven = false; renderPhysSolver(); }

function addGiven(symbol, name, unit) {
    physGivens.push({ symbol, name, value: 0, unit });
    physShowAddGiven = false;
    renderPhysSolver();
}

function addFind(symbol, name) {
    if (!physFinds.find(f => f.symbol === symbol)) {
        physFinds.push({ symbol, name });
    }
    physShowAddFind = false;
    renderPhysSolver();
}

function updateGiven(index, value) {
    physGivens[index].value = parseFloat(value) || 0;
}

function removeGiven(index) { physGivens.splice(index, 1); renderPhysSolver(); }
function removeFind(index) { physFinds.splice(index, 1); renderPhysSolver(); }

function physClear() {
    physGivens = [];
    physFinds = [];
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
            const { expr, needs, gives } = formula;
            if (known[gives] !== undefined) continue; // уже знаем
            if (needs.every(n => known[n] !== undefined)) {
                const v0 = known["v0"] || 0;
                const t = known["t"] || 0;
                const a = known["a"] || 0;
                let result;
                if (gives === "S") {
                    result = v0 * t + a * t * t / 2;
                    steps += `<div style="margin-bottom:10px; padding:8px; background:#1A1A2E; border-radius:6px;">
                        <div style="color:#FFD700; font-size:13px;">${expr}</div>
                        <div style="color:#58A6FF; font-size:14px; margin-top:5px;">S = ${v0}·${t} + ${a}·${t}²/2 = ${result.toFixed(2)} м ✅</div>
                        <span onclick="showPhysDetail('${gives}', ${v0}, ${t}, ${a}, ${result})" 
                            style="color:#888; font-size:11px; cursor:pointer; margin-top:5px; display:inline-block;">📋 Подробнее</span>
                    </div>`;
                }
                known[gives] = result;
                changed = true;
                break;
            }
        }
    }
    
    // Показываем результаты
    if (steps === "") {
        steps = "❌ Не удалось найти решение с текущими формулами";
    } else {
        // Показываем найденные значения
        physFinds.forEach(f => {
            if (known[f.symbol] !== undefined) {
                const q = physQuantities.find(q => q.symbol === f.symbol);
                steps += `<div style="margin-top:5px; padding:8px; background:#1A2E1A; border-radius:6px; color:#2D8A4E; font-weight:bold;">
                    ✅ ${f.name} = ${known[f.symbol].toFixed(2)} ${q ? q.unit : ''}
                </div>`;
            } else {
                steps += `<div style="margin-top:5px; padding:8px; background:#2E1A1A; border-radius:6px; color:#C72A2A;">
                    ❌ ${f.name} — недостаточно данных
                </div>`;
            }
        });
    }
    
    document.getElementById("physSolutionContent").innerHTML = steps;
}

function showPhysDetail(gives, v0, t, a, result) {
    const content = `
        <div style="margin-bottom:10px; color:#FFD700; font-size:14px;">Формула: S = v₀t + at²/2</div>
        <div style="color:#58A6FF; font-size:14px; white-space:pre-line;">
            Дано:
            v₀ = ${v0} м/с
            t = ${t} с
            a = ${a} м/с²
            
            Подставляем:
            S = ${v0}·${t} + ${a}·${t}²/2
            S = ${v0*t} + ${a*t*t/2}
            S = ${result.toFixed(2)} м
        </div>
    `;
    
    document.getElementById("cheatsheetContent").innerHTML = content;
    document.getElementById("cheatsheetModal").style.display = "flex";
}
