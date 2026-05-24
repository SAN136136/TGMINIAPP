// ==================== ЯДРО КАЛЬКУЛЯТОРА ====================
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
    document.getElementById("calcDisplay").style.display = "block";
    document.getElementById("calcResult").style.display = "block";
    switchCalcMode("basic");
    document.getElementById("calcGraphInputs").style.display = "none";
}

function closeCalc() {
    document.getElementById("calcModal").style.display = "none";
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

function calcClear() {
    calcExpression = "";
    document.getElementById("calcDisplay").textContent = "0";
    document.getElementById("calcResult").textContent = "";
}

function switchCalcMode(mode) {
    calcMode = mode;
    document.querySelectorAll(".calc-mode-btn").forEach(btn => btn.classList.remove("active"));
    let activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add("active");
    
    document.getElementById("calcMainButtons").style.display = "none";
    document.getElementById("calcExtraBtns").style.display = "none";
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
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
    } else if (mode === "graph") {
    document.getElementById("calcGraphInputs").style.display = "block";
    document.getElementById("calcDisplay").style.display = "none";
    document.getElementById("calcResult").style.display = "none";
    switchToGraph();
}
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
        renderPhysSolver();
    } else if (mode === "converter") {
        document.getElementById("calcConverterOutput").style.display = "block";
        document.getElementById("calcDisplay").style.display = "none";
        document.getElementById("calcResult").style.display = "none";
    }
    
    calcClear();
}
