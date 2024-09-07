const games = new Map();

function getComputerMove(board) {
    const emptySpots = board.reduce((acc, cell, index) => {
        if (cell === ' ') acc.push(index);
        return acc;
    }, []);

    if (emptySpots.length === 225) {
        return 112; // Center of the board
    }

    let bestScore = -Infinity;
    let bestMove = null;

    for (const move of emptySpots) {
        const score = evaluateMove(board, move, 'O');
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function evaluateMove(board, move, player) {
    const opponent = player === 'O' ? 'X' : 'O';
    let score = 0;

    // Check for immediate win
    board[move] = player;
    if (checkWinnerOptimized(board, move, player)) {
        board[move] = ' ';
        return 100000;
    }
    board[move] = ' ';

    // Check for blocking opponent's win
    board[move] = opponent;
    if (checkWinnerOptimized(board, move, opponent)) {
        board[move] = ' ';
        return 10000;
    }
    board[move] = ' ';

    // Evaluate patterns
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dx, dy] of directions) {
        score += evaluateDirection(board, move, player, dx, dy);
        score += evaluateDirection(board, move, opponent, dx, dy) * 0.9; // Slightly less weight for blocking
    }

    return score;
}

function evaluateDirection(board, move, player, dx, dy) {
    const x = move % 15;
    const y = Math.floor(move / 15);
    let score = 0;
    let open = 0;
    let count = 0;

    for (let i = -4; i <= 4; i++) {
        const nx = x + i * dx;
        const ny = y + i * dy;
        if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) continue;

        const cell = board[ny * 15 + nx];
        if (cell === player) {
            count++;
        } else if (cell === ' ') {
            if (count > 0) {
                score += calculateScore(count, open);
                count = 0;
                open = 1;
            } else {
                open = 1;
            }
        } else {
            if (count > 0) {
                score += calculateScore(count, open);
                return score;
            }
            return 0;
        }
    }

    score += calculateScore(count, open);
    return score;
}

function calculateScore(count, open) {
    if (count >= 5) return 100000;
    const scores = [0, 1, 10, 100, 1000];
    return scores[count] * (open + 1);
}

function getComputerMoveOptimized(board) {
    return getComputerMove(board);
}

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const playerMove = body.move !== undefined ? parseInt(body.move) : null;
    const sessionId = event.headers['x-session-id'] || event.requestContext.requestId;

    let board = body.board || games.get(sessionId) || Array(225).fill(' ');

    if (playerMove !== null && isValidMove(board, playerMove)) {
        board[playerMove] = 'X';
        
        if (checkWinnerOptimized(board, playerMove, 'X')) {
            games.delete(sessionId);
            return response("You win!", board, getWinningLine(board, playerMove, 'X'));
        }
        
        if (isBoardFull(board)) {
            games.delete(sessionId);
            return response("It's a tie!", board);
        }
        
        const computerMove = getComputerMoveOptimized(board);
        board[computerMove] = 'O';
        
        if (checkWinnerOptimized(board, computerMove, 'O')) {
            games.delete(sessionId);
            return response("You lost!", board, getWinningLine(board, computerMove, 'O'));
        }
        
        if (isBoardFull(board)) {
            games.delete(sessionId);
            return response("It's a tie!", board);
        }
    } else if (playerMove !== null) {
        return response("Invalid move. Try again.", board);
    }
    
    games.set(sessionId, board);
    return response(`Make your move`, board);
};

function isValidMove(board, move) {
    return move >= 0 && move < 225 && board[move] === ' ';
}

function isBoardFull(board) {
    return !board.includes(' ');
}

function checkWinnerOptimized(board, lastMove, player) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    const x = lastMove % 15;
    const y = Math.floor(lastMove / 15);

    for (const [dx, dy] of directions) {
        let count = 1;
        for (let i = 1; i < 5; i++) {
            const newX = x + dx * i;
            const newY = y + dy * i;
            if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15 || board[newY * 15 + newX] !== player) break;
            count++;
        }
        for (let i = 1; i < 5; i++) {
            const newX = x - dx * i;
            const newY = y - dy * i;
            if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15 || board[newY * 15 + newX] !== player) break;
            count++;
        }
        if (count >= 5) return true;
    }
    return false;
}

function getWinningLine(board, lastMove, player) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    const x = lastMove % 15;
    const y = Math.floor(lastMove / 15);

    for (const [dx, dy] of directions) {
        let line = [lastMove];
        for (let i = 1; i < 5; i++) {
            const newX = x + dx * i;
            const newY = y + dy * i;
            if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15 || board[newY * 15 + newX] !== player) break;
            line.push(newY * 15 + newX);
        }
        for (let i = 1; i < 5; i++) {
            const newX = x - dx * i;
            const newY = y - dy * i;
            if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15 || board[newY * 15 + newX] !== player) break;
            line.unshift(newY * 15 + newX);
        }
        if (line.length >= 5) return line.slice(0, 5);
    }
    return null;
}

function response(message, board, winningLine = null) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Session-Id"
        },
        body: JSON.stringify({ message, board, winningLine })
    };
}