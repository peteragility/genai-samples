const AWS = require('aws-sdk');

// Initialize an empty board
let board = Array(9).fill(' ');

exports.handler = async (event) => {
    // Get the player's move from the event body
    const body = JSON.parse(event.body);
    const playerMove = body.move !== undefined ? parseInt(body.move) : null;
    
    if (playerMove !== null) {
        // Player's move
        if (isValidMove(playerMove)) {
            board[playerMove] = 'X';
            if (checkWinner('X')) {
                return response("You win!");
            }
            if (isBoardFull()) {
                return response("It's a tie!");
            }
            
            // Computer's move
            const computerMove = getComputerMove();
            board[computerMove] = 'O';
            if (checkWinner('O')) {
                return response("Computer wins!");
            }
            if (isBoardFull()) {
                return response("It's a tie!");
            }
        } else {
            return response("Invalid move. Try again.");
        }
    }
    
    // Return the current board state
    return response(`Current board: ${board.join(' ')}`);
};

function isValidMove(move) {
    return move >= 0 && move < 9 && board[move] === ' ';
}

function isBoardFull() {
    return !board.includes(' ');
}

function checkWinner(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];
    return winningCombinations.some(combo => 
        combo.every(index => board[index] === player)
    );
}

function getComputerMove() {
    const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === ' ') acc.push(index);
        return acc;
    }, []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function response(message) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message, board })
    };
}