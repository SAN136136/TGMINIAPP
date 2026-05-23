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
