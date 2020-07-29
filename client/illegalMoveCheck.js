function getLegalMoves(tempboard, color, lastmove, castleleft, castleright) {
    var legalmoves = [];
    var temp;
    for (row = 0; row < 8; row++) {
        for (col = 0; col < 8; col++) {
            if (tempboard[row][col][0] == color) {
                switch (tempboard[row][col][1]) {
                    case 'p':
                        temp = getLegalPawnMoves(tempboard, {x: col, y: row}, lastmove);
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'n':
                        temp = getLegalKnightMoves(tempboard, {x: col, y: row});
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'b':
                        temp = getLegalBishopMoves(tempboard, {x: col, y: row});
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'r':
                        temp = getLegalRookMoves(tempboard, {x: col, y: row});
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'q':
                        temp = getLegalQueenMoves(tempboard, {x: col, y: row});
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'k':
                        temp = getLegalKingMoves(tempboard, {x: col, y: row}, castleleft, castleright);
                        for (i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    return legalmoves;

}

function getLegalPawnMoves(tempboard, piece, lastmove) {
    const color = tempboard[piece.y][piece.x][0];
    var lmoves = [];
	if (color == 'w') {
		if (tempboard[piece.y + 1][piece.x] == '__') {
			if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y + 1}), 'w')) {
                lmoves.push({from: piece, to: {x: piece.x, y: piece.y + 1}});
            }
			if (tempboard[piece.y + 2][piece.x] == '__' && piece.y == 1) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y + 2}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x, y: piece.y + 2}});
                }
            }
        }
        
		if (piece.x > 0) {
			if (tempboard[piece.y + 1][piece.x - 1][0] == 'b') {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y + 1}});
                }
			}
            if (lastmove.from.x == piece.x - 1 &&
                lastmove.from.y == 6 &&
                lastmove.to.x == piece.x - 1 &&
                lastmove.to.y == 4 &&
                piece.y == 4 && 
                tempboard[piece.y][piece.x - 1] == 'bp') {

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y + 1}});
                }
			}
		}
        
        if (piece.x < 7) {
			if (tempboard[piece.y + 1][piece.x + 1][0] == 'b') {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y + 1}});
                }
			}
            if (lastmove.from.x == piece.x + 1 &&
                lastmove.from.y == 6 &&
                lastmove.to.x == piece.x + 1 &&
                lastmove.to.y == 4 &&
                piece.y == 4 && 
                tempboard[piece.y][piece.x + 1] == 'bp') {

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y + 1}});
                }
			}
        }
        
	} else {
		if (tempboard[piece.y - 1][piece.x] == '__') {
			if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y - 1}), 'b')) {
                lmoves.push({from: piece, to: {x: piece.x, y: piece.y - 1}});
            }
			if (tempboard[piece.y - 2][piece.x] == '__' && piece.y == 6) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y - 2}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x, y: piece.y - 2}});
                }
            }
        }
        
		if (piece.x > 0) {
			if (tempboard[piece.y - 1][piece.x - 1][0] == 'w') {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y - 1}});
                }
			}
            if (lastmove.from.x == piece.x - 1 &&
                lastmove.from.y == 1 &&
                lastmove.to.x == piece.x - 1 &&
                lastmove.to.y == 3 &&
                piece.y == 3 && 
                tempboard[piece.y][piece.x - 1] == 'wp') {

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y - 1}});
                }
			}
		}
        
        if (piece.x < 7) {
			if (tempboard[piece.y - 1][piece.x + 1][0] == 'w') {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y - 1}});
                }
			}
            if (lastmove.from.x == piece.x + 1 &&
                lastmove.from.y == 1 &&
                lastmove.to.x == piece.x + 1 &&
                lastmove.to.y == 3 &&
                piece.y == 3 && 
                tempboard[piece.y][piece.x + 1] == 'wp') {

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y - 1}});
                }
			}
		}
    }
    
	return lmoves;
}

function getLegalKnightMoves(tempboard, piece) {
    var lmoves = [];
    const knight = [{x: 1, y: 2},
        {x: 2, y: 1},
        {x: 2, y: -1},
        {x: 1, y: -2},
        {x: -1, y: -2},
        {x: -2, y: -1},
        {x: -2, y: 1},
        {x: -1, y: 2}];
	for (n = 0; n < 8; n++) {
		if(onBoard(piece.x + knight[n].x, piece.y + knight[n].y)) {
			if(tempboard[piece.y][piece.x][0] != tempboard[piece.y + knight[n].y][piece.x + knight[n].x][0]) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + knight[n].x, y: piece.y + knight[n].y}), tempboard[piece.y][piece.x][0])) {
                    lmoves.push({from: piece, to: {x: piece.x + knight[n].x, y: piece.y + knight[n].y}});
                }
			}
		}
	}
	return lmoves;
}

function getLegalBishopMoves(tempboard, piece) {
    var lmoves = [];
    const bishop = [{x: 1, y: 1},
                    {x: 1, y: -1},
                    {x: -1, y: -1},
                    {x: -1, y: 1}];
	var delta = {x: 0, y: 0};
	for (b = 0; b < 4; b++) {
		while(onBoard(piece.x + delta.x + bishop[b].x, piece.y + delta.y + bishop[b].y)) {
			delta.x += bishop[b].x;
			delta.y += bishop[b].y;
            if (tempboard[piece.y + delta.y][piece.x + delta.x][0] == tempboard[piece.y][piece.x][0]){
                break;
            }
			if(tempboard[piece.y][piece.x][0] != tempboard[piece.y + delta.y][piece.x + delta.x][0]) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + delta.x, y: piece.y + delta.y}), tempboard[piece.y][piece.x][0])) {
                    lmoves.push({from: piece, to: {x: piece.x + delta.x, y: piece.y + delta.y}});
                }
			}
			if(tempboard[piece.y + delta.y][piece.x + delta.x] != '__'){
				break;
			}
		}
        delta = {x: 0, y: 0};
	}
	return lmoves;
}

function getLegalRookMoves(tempboard, piece) {
    var lmoves = [];
    const rook = [{x: 0, y: 1},
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: -1,y: 0}];
    var delta = {x: 0, y: 0};
    for (r = 0; r < 4; r++) {
        while(onBoard(piece.x + delta.x + rook[r].x, piece.y + delta.y + rook[r].y)) {
            delta.x += rook[r].x;
            delta.y += rook[r].y;
            if (tempboard[piece.y + delta.y][piece.x + delta.x][0] == tempboard[piece.y][piece.x][0]){
                break;
            }
            if (tempboard[piece.y][piece.x][0] != tempboard[piece.y + delta.y][piece.x + delta.x][0]) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + delta.x, y: piece.y + delta.y}), tempboard[piece.y][piece.x][0])) {
                    lmoves.push({from: piece, to: {x: piece.x + delta.x, y: piece.y + delta.y}});
                }
            }
            
            if (tempboard[piece.y + delta.y][piece.x + delta.x] != '__'){
                break;
            }
        }
        delta = {x: 0, y: 0};
    }
    return lmoves;
}

function getLegalQueenMoves(tempboard, piece) {
    var lmoves = [];

    var temp = getLegalRookMoves(tempboard, piece);
    for (i = 0; i < temp.length; i++) {
        
        lmoves.push(temp[i]);
    }

    temp = getLegalBishopMoves(tempboard, piece);
    for (i = 0; i < temp.length; i++) {
        
        lmoves.push(temp[i]);
    }

	return lmoves;
}

function getLegalKingMoves(tempboard, piece, leftcastle, rightcastle) {
    var lmoves = [];
    const dirs = [{x: 0, y: 1},
                  {x: 1, y: 0},
                  {x: 0, y: -1},
                  {x: -1, y: 0},
                  {x: 1, y: 1},
                  {x: 1, y: -1},
                  {x: -1, y: -1},
                  {x: -1, y: 1}];
	for (d = 0; d < 8; d++) {
		if (onBoard(piece.x + dirs[d].x, piece.y + dirs[d].y)) {
			if (tempboard[piece.y][piece.x][0] != tempboard[piece.y + dirs[d].y][piece.x + dirs[d].x][0]) {
                var c = movepiece(tempboard, piece, {x: piece.x + dirs[d].x, y: piece.y + dirs[d].y});
				if (!kingInCheck(c, tempboard[piece.y][piece.x][0])) {
                    lmoves.push({from: piece, to: {x: piece.x + dirs[d].x, y: piece.y + dirs[d].y}});
                }
			}
        }
    }
    var temp;
	if (tempboard[piece.y][piece.x] == 'wk') {
		if (leftcastle && tempboard[0][3] == '__' && tempboard[0][2] == '__' && tempboard[0][1] == '__') {
            temp = castling(tempboard, 'l', 'w');
			for (i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
		if(rightcastle && tempboard[0][5] == '__' && tempboard[0][6] == '__') {
			temp = castling(tempboard, 'r', 'w');
			for (i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
	} else {
		if(leftcastle && tempboard[7][3] == '__' && tempboard[7][2] == '__' && tempboard[7][1] == '__'){
			temp = castling(tempboard, 'r', 'w');
			for (i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
		if(rightcastle && tempboard[7][5] == '__' && tempboard[7][6] == '__'){
            temp = castling(tempboard, 'r', 'b');
			for (i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
	}
	return lmoves;
}

function castling(tempboard, dir, color) {
    var b = [];
    for (y = 0; y < 8; y++) {
        b.push([])
        for (x = 0; x < 8; x++) {
            b[y].push(tempboard[y][x])
        }
    }
    var lmoves = [];
	const ncolor = (color == 'w') ? 0 : 7;
	if(!kingInCheck(b, color)) {
		if (dir == 'l') {
			b[ncolor][3] = b[ncolor][4];
			b[ncolor][4] = '__';
			if(!kingInCheck(b, color)){
				b[ncolor][2] = b[ncolor][3];
				b[ncolor][3] = '__';
				if(!kingInCheck(b, color)){
					lmoves.push({x: 4, ncolor}, {x: 2, y: ncolor});
				}
			}
		}
		if (dir == 'r'){
			b[ncolor][5] = b[ncolor][4];
			b[ncolor][4] = '__';
			if (!kingInCheck(b, color)) {
				b[ncolor][6] = b[ncolor][5];
				b[ncolor][5] = '__';
				if (!kingInCheck(b, color)) {
					lmoves.push({x: 4, ncolor}, {x: 6, y: ncolor});
				}
			}
		}
	}
	return lmoves;
}

function movepiece(tempboard, from, to) {
    var b = [];
    for (y = 0; y < 8; y++) {
        b.push([])
        for (x = 0; x < 8; x++) {
            b[y].push(tempboard[y][x]);
        }
    }
    if ((b[from.y][from.x] == 'wk' || b[from.y][from.x] == 'bk') &&
            (to.x == 6) && 
            (from.x == 4)) {

        b[from.y][5] = b[from.y][from.x][0] + 'r';
        b[from.y][7] = '__';
    } else if ((b[from.x][from.y] == 'wk' ||
            b[from.x][from.y] == 'bk') &&
            (to.x == 2) &&
            (from.x == 4)) {

        b[from.y][3] = b[from.y][from.x][0]+'r';
        b[from.y][0] = '__';
    } else if ((b[from.y][from.x] == 'wp') &&
            (b[to.y][to.x] == '__') &&
            (b[to.y + 1][to.x] == 'bp')) {

        b[to.y + 1][to.x]='__';
    }
    else if ((b[from.y][from.x] == 'bp') &&
            (b[to.y][to.x] == '__') &&
            (b[to.y - 1][to.x] == 'wp')) {

        b[to.y-1][to.x]='__';
    }

    b[to.y][to.x] = b[from.y][from.x];
    b[from.y][from.x] = '__';
    return b;
}

function kingInCheck(tempboard, color) {
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
			if(tempboard[y][x] == color + 'k'){
				k.x = x;
				k.y = y;
			}
		}
    }
    

	if (color == 'w') {
        if (onBoard(k.x + 1, k.y + 1)) {
            if (tempboard[k.y + 1][k.x + 1] == 'bp'){
                return true;
            }
        }
        if (onBoard(k.x - 1, k.y + 1)) {
            if (tempboard[k.y + 1][k.x - 1] == 'bp') {
                return true;
            }
        }
	} else {
        if (onBoard(k.x + 1, k.y - 1)) {
            if (tempboard[k.y - 1][k.x + 1] == 'wp'){
                return true;
            }
        }
        if (onBoard(k.x - 1, k.y - 1)) {
            if (tempboard[k.y - 1][k.x - 1] == 'wp') {
                return true;
            }
        }
    }
    
	for (h = 0; h < 4; h++) {
        while (onBoard(k.x + delta.x + horz[h].x, k.y + delta.y + horz[h].y)) {
			delta.x += horz[h].x;
			delta.y += horz[h].y;
            if (tempboard[k.y + delta.y][k.x + delta.x] == oppo + 'r' ||
                tempboard[k.y + delta.y][k.x + delta.x] == oppo + 'q') {
				return true;
            } 
            
            if(tempboard[k.y + delta.y][k.x + delta.x] != '__'){
				break;
			}
		}
		delta = {x: 0, y: 0};
    }
    
	for (di = 0; di < 4; di++){
		while (onBoard(k.x + delta.x + diag[di].x, k.y + delta.y + diag[di].y)) {
			delta.x += diag[di].x;
			delta.y += diag[di].y;
            if (tempboard[k.y + delta.y][k.x + delta.x] == oppo + 'b' ||
                tempboard[k.y + delta.y][k.x + delta.x] == oppo + 'q') {
				return true;
            }
            
            if (tempboard[k.y + delta.y][k.x + delta.x] != '__') {
				break;
			}
		}
		delta = {x: 0, y: 0};
    }
    
	for (k = 0; k < 8; k++){
		if (onBoard(k.x + knight[k].x, k.y + knight[k].y)) {
			if(tempboard[k.y + knight[k].y][k.x + knight[k].x] == oppo + 'n'){
				return true;
			}
		}
    }
    
	for (alld = 0; alld < 4; alld++){
		if (onBoard(k.x + horz[alld].x, k.y + horz[alld].y)) {
			if(tempboard[k.y + horz[alld].y][k.x + horz[alld].x] == oppo + 'k'){
				return true;
			}
		}
		if (onBoard(k.x + diag[alld].x, k.y + diag[alld].y)){
			if(tempboard[k.y + diag[alld].y][k.x + diag[alld].x] == oppo + 'k'){
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