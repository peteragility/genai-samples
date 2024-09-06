// Use a Map to store game states for different sessions
const games = new Map();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const playerMove = body.move !== undefined ? parseInt(body.move) : null;
    const difficulty = body.difficulty || 'easy';
    const sessionId = event.requestContext.requestId; // Use request ID as session ID

    // Get the board state from the request or create a new one
    let board = body.board || Array(9).fill(' ');

    if (playerMove !== null) {
        if (isValidMove(board, playerMove)) {
            board[playerMove] = 'X';
            if (checkWinner(board, 'X')) {
                games.delete(sessionId); // End the game
                return response("You win!", board);
            }
            if (isBoardFull(board)) {
                games.delete(sessionId); // End the game
                return response("It's a tie!", board);
            }
            
            const computerMove = difficulty === 'hard' ? getHardComputerMove(board) : getEasyComputerMove(board);
            board[computerMove] = 'O';
            if (checkWinner(board, 'O')) {
                games.delete(sessionId); // End the game
                return response("Computer wins!", board);
            }
            if (isBoardFull(board)) {
                games.delete(sessionId); // End the game
                return response("It's a tie!", board);
            }
        } else {
            return response("Invalid move. Try again.", board);
        }
    }
    
    // Save the updated board state
    games.set(sessionId, board);
    
    return response(`Current board: ${board.join(' ')}`, board);
};

function isValidMove(board, move) {
    return move >= 0 && move < 9 && board[move] === ' ';
}

function isBoardFull(board) {
    return !board.includes(' ');
}

function checkWinner(board, player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winningCombinations.some(combo => 
        combo.every(index => board[index] === player)
    );
}

function getEasyComputerMove(board) {
    const emptyCells = board.reduce((acc, cell, index) => {
        if (cell === ' ') acc.push(index);
        return acc;
    }, []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getHardComputerMove(board) {
    return minimax(board, 'O').index;
}

function minimax(board, player) {
    const availableSpots = getEmptyCells(board);
    
    if (checkWinner(board, 'X')) {
        return { score: -10 };
    } else if (checkWinner(board, 'O')) {
        return { score: 10 };
    } else if (availableSpots.length === 0) {
        return { score: 0 };
    }
    
    const moves = [];
    
    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        board[availableSpots[i]] = player;
        
        if (player === 'O') {
            const result = minimax(board, 'X');
            move.score = result.score;
        } else {
            const result = minimax(board, 'O');
            move.score = result.score;
        }
        
        board[availableSpots[i]] = ' ';
        moves.push(move);
    }
    
    let bestMove;
    if (player === 'O') {
        let bestScore = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    
    return moves[bestMove];
}

function getEmptyCells(board) {
    return board.reduce((acc, cell, index) => {
        if (cell === ' ') acc.push(index);
        return acc;
    }, []);
}

function response(message, board) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ message, board })
    };
}