(function () {
  const displayEl = document.getElementById("display");
  const keys = document.querySelectorAll(".keys .btn");
  const toggleHistoryBtn = document.getElementById("toggle-history");
  const historyPane = document.getElementById("history");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history");
  const closeHistoryBtn = document.getElementById("close-history");

  let expr = "";
  const STORAGE_KEY = "calc_history_v1";

  function setDisplay(v) {
    displayEl.textContent = String(v);
  }

  // Append value to the expression and ensure proper formatting of decimal point
  function appendValue(val) {
    if (expr === "" && val === ".") expr = "0.";
    else expr += val;
    setDisplay(expr);
  }

  // Clear all
  function clearAll() {
    expr = "";
    setDisplay(0);
  }

  // Delete last character
  function del() {
    expr = expr.slice(0, -1);
    setDisplay(expr || 0);
  }

  // Purpose: it sanitizes the expression and prevents arbitrary JS execution by rejecting characters outside digits, operators, parentheses, dot and spaces, then evaluates the cleaned expression.
  function safeEvaluate(s) {
    // allow only digits, operators, parens, decimal and spaces
    if (!/^[0-9+\-*/().\s]+$/.test(s)) throw new Error("Invalid characters");
    // avoid sequences like /**/ or other surprises by using Function
    const cleaned = s.replace(/×/g, "*").replace(/÷/g, "/");
    // Evaluate
    // eslint-disable-next-line no-new-func
    const result = Function("return (" + cleaned + ")")();
    if (!isFinite(result)) throw new Error("Math error");
    return result;
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderHistory() {
    const items = loadHistory();
    historyList.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No history yet";
      li.style.justifyContent = "center";
      historyList.appendChild(li);
      return;
    }
    items
      .slice()
      .reverse()
      .forEach((it) => {
        const li = document.createElement("li");
        const left = document.createElement("span");
        left.textContent = it.expr;
        const right = document.createElement("strong");
        right.textContent = it.result;
        li.appendChild(left);
        li.appendChild(right);
        historyList.appendChild(li);
      });
  }

  function addHistoryEntry(exprText, result) {
    const items = loadHistory();
    items.push({ expr: exprText, result: String(result), when: Date.now() });
    saveHistory(items);
    renderHistory();
  }

  keys.forEach((k) => {
    k.addEventListener("click", () => {
      const v = k.dataset.value;
      const action = k.dataset.action;
      if (action === "clear") {
        clearAll();
        return;
      }
      if (action === "delete") {
        del();
        return;
      }
      if (action === "equals") {
        if (!expr) return;
        try {
          const res = safeEvaluate(expr);
          addHistoryEntry(expr, res);
          expr = String(res);
          setDisplay(expr);
        } catch (err) {
          setDisplay("Error");
          expr = "";
        }
        return;
      }
      if (v) appendValue(v);
    });
  });

  toggleHistoryBtn.addEventListener("click", () => {
    historyPane.classList.toggle("hide");
    renderHistory();
  });

  closeHistoryBtn.addEventListener("click", () => {
    historyPane.classList.add("hide");
  });

  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  });

  // init
  setDisplay(0);
  renderHistory();

  // ensure history visible by default on wide screens
  if (window.innerWidth > 720) historyPane.classList.remove("hide");
  else historyPane.classList.add("hide");
})();
