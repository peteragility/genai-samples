const games = new Map();

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

function getComputerMoveOptimized(board) {
    const emptySpots = board.reduce((acc, cell, index) => {
        if (cell === ' ') acc.push(index);
        return acc;
    }, []);

    if (emptySpots.length === 225) {
        return 112; // Center of the board
    }

    let bestScore = -Infinity;
    let bestMove = emptySpots[0];

    for (const move of emptySpots) {
        const score = evaluateMove(board, move);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function evaluateMove(board, move) {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    const x = move % 15;
    const y = Math.floor(move / 15);
    let score = 0;

    for (const [dx, dy] of directions) {
        score += evaluateDirection(board, x, y, dx, dy, 'O');
        score += evaluateDirection(board, x, y, dx, dy, 'X');
    }

    return score;
}

function evaluateDirection(board, x, y, dx, dy, player) {
    let score = 0;
    let ownCount = 0;
    let emptyCount = 0;
    let blocked = false;

    for (let i = -4; i <= 4; i++) {
        const newX = x + dx * i;
        const newY = y + dy * i;
        if (newX < 0 || newX >= 15 || newY < 0 || newY >= 15) {
            blocked = true;
            break;
        }
        const cell = board[newY * 15 + newX];
        if (cell === player) ownCount++;
        else if (cell === ' ') emptyCount++;
        else {
            blocked = true;
            break;
        }
    }

    if (ownCount >= 4) score += 100000;
    else if (ownCount === 3 && !blocked) score += 10000;
    else if (ownCount === 2 && !blocked) score += 1000;
    else if (ownCount === 1 && !blocked) score += 100;

    return score;
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