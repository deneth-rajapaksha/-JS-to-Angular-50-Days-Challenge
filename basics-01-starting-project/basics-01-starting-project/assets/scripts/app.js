alert("This works XD!");

let currentResult = 0;

function add() {
    currentResult = currentResult + parseInt(userInput.value);
    outputResult(currentResult, ' ')
}

addBtn.addEventListener('click', add);

