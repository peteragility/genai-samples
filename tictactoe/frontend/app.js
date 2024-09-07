const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset');

let gameBoard = Array(225).fill(' ');
let gameEnded = false;
let sessionId = localStorage.getItem('gomokuSessionId') || generateSessionId();

function generateSessionId() {
    const id = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('gomokuSessionId', id);
    return id;
}

function createBoard() {
    board.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        fragment.appendChild(cell);
    }
    board.appendChild(fragment);
    updateBoard(gameBoard);
}

function handleCellClick(event) {
    if (gameEnded) return;
    const index = event.target.dataset.index;
    if (gameBoard[index] === ' ') {
        makeMove(index);
    }
}

async function makeMove(index) {
    try {
        const response = await fetch('https://og0ocod3yc.execute-api.ap-east-1.amazonaws.com/Prod/play', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId
            },
            body: JSON.stringify({ move: parseInt(index), board: gameBoard }),
        });
        const data = await response.json();
        gameBoard = data.board;
        updateBoard(gameBoard);
        updateMessage(data.message);
        if (data.winningLine) {
            highlightWinningLine(data.winningLine, data.message.includes("win"));
        }
    } catch (error) {
        console.error('Error:', error);
        updateMessage('An error occurred. Please try again.');
    }
}

function updateBoard(newBoard) {
    const cells = board.children;
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('black', 'white', 'winning', 'winning-green', 'winning-red');
        if (newBoard[i] === 'X') {
            cells[i].classList.add('black');
        } else if (newBoard[i] === 'O') {
            cells[i].classList.add('white');
        }
    }
}

function updateMessage(newMessage) {
    message.textContent = newMessage;
    message.classList.remove('win', 'lose');
    if (newMessage.includes("win")) {
        message.classList.add('win');
        gameEnded = true;
    } else if (newMessage.includes("lost")) {
        message.classList.add('lose');
        gameEnded = true;
    } else if (newMessage.includes("tie")) {
        gameEnded = true;
    }
}

function highlightWinningLine(winningLine, isWin) {
    const cells = board.children;
    const className = isWin ? 'winning-green' : 'winning-red';
    for (const index of winningLine) {
        cells[index].classList.add('winning', className);
    }
}

function resetGame() {
    gameBoard = Array(225).fill(' ');
    gameEnded = false;
    updateBoard(gameBoard);
    message.textContent = '';
    message.classList.remove('win', 'lose');
    sessionId = generateSessionId();
}

createBoard();
resetButton.addEventListener('click', resetGame);