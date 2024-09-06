const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset');
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');

let gameBoard = Array(9).fill(' ');
let gameEnded = false;

function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }
}

function handleCellClick(event) {
    if (gameEnded) return;
    const index = event.target.dataset.index;
    if (gameBoard[index] === ' ') {
        makeMove(index);
    }
}

async function makeMove(index) {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    const response = await fetch('https://0dmo00xc6j.execute-api.ap-east-1.amazonaws.com/Prod/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://d3r8mfj7p1wjva.cloudfront.net'
        },
        body: JSON.stringify({ move: index, difficulty, board: gameBoard }),
    });
    const data = await response.json();
    updateBoard(data.board);
    updateMessage(data.message);
}

function updateBoard(newBoard) {
    gameBoard = newBoard;
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = newBoard[index];
    });
}

function updateMessage(newMessage) {
    message.textContent = newMessage;
    if (newMessage.includes("win")) {
        gameEnded = true;
        message.style.color = "green";
    } else if (newMessage.includes("lost")) {
        gameEnded = true;
        message.style.color = "red";
    } else if (newMessage.includes("tie")) {
        gameEnded = true;
        message.style.color = "black";
    }
}

function resetGame() {
    gameBoard = Array(9).fill(' ');
    gameEnded = false;
    updateBoard(gameBoard);
    message.textContent = '';
    message.style.color = "black";
}

createBoard();
resetButton.addEventListener('click', resetGame);