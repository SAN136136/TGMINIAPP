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
