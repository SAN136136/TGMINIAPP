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
