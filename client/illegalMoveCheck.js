function isLegalMove(board, move) {
    from = {x: move[0][0], y: move[0][1]};
    to = {x: move[1][0], y: move[1][1]};

    const color = board[from.y][from.x][0];
    const piece = board[from.y][from.x][1];

    if (kingInCheck(movepiece(board, from, to), color)) {
        return false;
    }

    switch (piece) {
        case 'p':
            return legalPawnMove(board, from, to, color);
        case 'n':
            return legalKnightMove(board, from, to, color);
        case 'b':
            return legalBishopMove(board, from, to, color);
        case 'r':
            return legalRookMove(board, from, to, color);
        case 'q':
            return legalQueenMove(board, from, to, color);
        case 'k':
            return legalKingMove(board, from, to, color);
        case '_':
            return false;
    }

}

function legalPawnMove(board, from, to, color) {

}

function legalKnightMove(board, from, to, color) {

}

function legalBishopMove(board, from, to, color) {

}

function legalRookMove(board, from, to, color) {

}

function legalQueenMove(board, from, to, color) {

}

function legalKingMove(board, from, to, color) {

}

function movePiece(board, from, to) {
    if ((board[from.y][from.x] == 'wk' || board[from.y][from.x] == 'bk') &&
                                                             (to.x == 6) && 
                                                          (from.x == 4)) {

        board[from.y][5] = board[from.y][from.x][0] + 'r';
        board[from.y][7] = '__';
    } else if ((board[from.x][from.y] == 'wk' || board[from.x][from.y] == 'bk') &&
                                                                    (to.x == 2) &&
                                                                 (from.x == 4)) {

        board[from.y][3] = board[from.y][from.x][0]+'r';
        board[from.y][0] = '__';
    } else if ((board[from.y][from.x] == 'wp') &&
                   (board[to.y][to.x] == '__') &&
              (board[to.y + 1][to.x] == 'bp')) {

        board[to.y+1][to.x]='__';
    }
    else if ((board[from.y][from.x] == 'bp') &&
                 (board[to.y][to.x] == '__') &&
              (board[to.y-1][to.x] == 'wp')) {

        board[to.y-1][to.x]='__';
    }

    board[to.y][to.x] = board[from.y][from.x];
    board[from.y][from.x] = '__';

    return board;
}

function kingInCheck(board, color){
    const horz = [{x: 0, y: 1},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: -1,y: 0}];
    const diag = [{x: 1, y: 1},
            {x: 1, y: -1},
            {x: -1, y: -1},
            {x: -1, y: 1}];
    const knight = [{x: 1, y: 2},
              {x: 2, y: 1},
              {x: 2, y: -1},
              {x: 1, y: -2},
              {x: -1, y: -2},
              {x: -2, y: -1},
              {x: -2, y: 1},
              {x: -1, y: 2}];
    var k = {x: -1, y: -1}
    var delta = {x: 0, y: 0};
	const oppo = (color == 'w') ? 'b' : 'w';
    

    for(y = 0; y < 8; y++){
		for(x = 0; x < 8; x++){
			if(board[y][x] == color + 'k'){
				k.x = x;
				k.y = y;
			}
		}
    }
    

	if(color == 'W'){
		if(board[k.y + 1][k.x + 1] == 'bp' || board[k.y + 1][k.x - 1] == 'bp'){
			return true;
		}
	} else {
		if(board[k.y - 1][k.x + 1] == 'wp' || board[k.y - 1][k.x - 1] == 'wp'){
			return true;
		}
	}
	for (h = 0; h < 4; h++) {
        while (onBoard(k.x + delta.x + horz[h].x, k.y + delta.y + horz[h].y)) {
			delta.x += horz[h].x;
			delta.y += horz[h].y;
            if (board[k.y + delta.y][k.x + delta.x] == oppo + 'R' ||
                board[k.y + delta.y][k.x + delta.x] == oppo + 'Q') {
				return true;
            } else if(board[k.y + delta.y][k.x + delta.x] != '__'){
				break;
			}
		}
		delta = {x: 0, y: 0};
    }
    
	for (d = 0; d < 4; d++){
		while (onBoard(k.x + delta.x + diag[d].x, k.y + delta.y + diag[d].y)) {
			delta.x += diag[d].x;
			delta.y += diag[d].y;
            if (board[k.y + delta.y][k.x + delta.x] == oppo + 'b' ||
                board[k.y + delta.y][k.x + delta.x] == oppo + 'q') {
				return true;
            } else if (board[k.y + delta.y][k.x + delta.x] != '__') {
				break;
			}
		}
		delta = {x: 0, y: 0};
    }
    
	for (k = 0; k < 8; k++){
		if (onBoard(k.x + knight[k].x, k.y + knight[k].y)) {
			if(board[k.y + knight[k].y][k.x + knight[k].x] == oppo + 'N'){
				return true;
			}
		}
    }
    
	for (alld = 0; alld < 4; alld++){
		if (onBoard(k.x + horz[alld].x, k.y + horz[alld].y)) {
			if(board[k.y + horz[alld].y][k.x + horz[alld].x] == oppo + 'K'){
				return true;
			}
		}
		if (onBoard(k.x + diag[alld].x, k.y + diag[alld].y)){
			if(board[k.y + diag[alld].y][k.x + diag[alld].x] == oppo + 'K'){
				return true;
			}
		}
    }
    
	return(false);
}

function onBoard(x, y) {
    if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
        return true;
    }
    return false;
}