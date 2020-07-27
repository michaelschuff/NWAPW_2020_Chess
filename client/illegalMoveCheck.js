function getLegalMoves(board, color, lastmove) {
    var legalMoves = [];
    for (y = 0; y < 8; y++) {
        for (x = 0; x < 8; x++) {
            if (board[y][x][0] == color) {
                switch (board[y][x][1]) {
                    case 'p':
                        for (item of getLegalPawnMoves(board, {x: x, y: y}, lastmove)) {
                            legalMoves.push(item);
                        }
                    case 'n':
                        for (item of getLegalKnightMoves(board, {x: x, y: y})) {
                            legalMoves.push(item);
                        }
                    case 'b':
                        for (item of getLegalBishopMoves(board, {x: x, y: y})) {
                            legalMoves.push(item);
                        }
                    case 'r':
                        for (item of getLegalRookMoves(board, {x: x, y: y})) {
                            legalMoves.push(item);
                        }
                    case 'q':
                        for (item of getLegalQueenMoves(board, {x: x, y: y})) {
                            legalMoves.push(item);
                        }
                    case 'k':
                        for (item of getLegalKingMoves(board, {x: x, y: y})) {
                            legalMoves.push(item);
                        }
                    case '_':
                        break;
                }
            }
        }
    }
    

}

function getLegalPawnMoves(board, square) {
    color=findwb(board[piecey][piecex]);
	if(color=="W"){
		if(board[piecey-1][piecex]=="  "){
			legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex,piecey-1);
			if(board[piecey-2][piecex]=="  "&&piecey==6){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex,piecey-2);
			}
		}
		if(piecex>0){
			if(findwb(board[piecey-1][piecex-1])=="B"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex-1,piecey-1);
			}
			if(notation[notation.size()-1][0]==piecex-1&&notation[notation.size()-1][1]==1&&notation[notation.size()-1][2]==piecex-1&&notation[notation.size()-1][3]==3&&piecey==3&&board[piecey][piecex-1]=="BP"){//complicated if statement that just checks if you can take a pawn using en passant
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex-1,piecey-1);
			}
		}
		if(piecex<7){
			if(findwb(board[piecey-1][piecex+1])=="B"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex+1,piecey-1);
			}
			if(notation[notation.size()-1][0]==piecex+1&&notation[notation.size()-1][1]==1&&notation[notation.size()-1][2]==piecex+1&&notation[notation.size()-1][3]==3&&piecey==3&&board[piecey][piecex+1]=="BP"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex+1,piecey-1);
			}
		}
	}
	else{
		if(board[piecey+1][piecex]=="  "){
			legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex,piecey+1);
			if(board[piecey+2][piecex]=="  "&&piecey==1){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex,piecey+2);
			}
		}
		if(piecex>0){
			if(findwb(board[piecey+1][piecex-1])=="W"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex-1,piecey+1);
			}
			if(notation[notation.size()-1][0]==piecex-1&&notation[notation.size()-1][1]==6&&notation[notation.size()-1][2]==piecex-1&&notation[notation.size()-1][3]==4&&piecey==4&&board[piecey][piecex-1]=="WP"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex-1,piecey+1);
			}
		}
		if(piecex<7){
			if(findwb(board[piecey+1][piecex+1])=="W"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex+1,piecey+1);
			}
			if(notation[notation.size()-1][0]==piecex+1&&notation[notation.size()-1][1]==6&&notation[notation.size()-1][2]==piecex+1&&notation[notation.size()-1][3]==4&&piecey==4&&board[piecey][piecex+1]=="WP"){
				legalmoves=legalmovesincheck(board,legalmoves,piecex,piecey,piecex+1,piecey+1);
			}
		}
	}
	return(legalmoves);
}

function getLegalKnightMoves(board, square) {

}

function getLegalBishopMoves(board, square) {

}

function getLegalRookMoves(board, square) {

}

function getLegalQueenMoves(board, square) {

}

function getLegalKingMoves(board, square) {

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