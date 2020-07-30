(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var legalmoves = require('./illegalMoveCheck.js');
const SSID = document.cookie.split(';').find(row => row.startsWith('sessionID')).split('=')[1];
var fromSquare = '';
var toSquare = '';
const alphabet = 'abcdefgh';
var socket = io();
var color;
var myMove = false;
var leftCastle = true;
var rightCastle = true;
var lMoves = [];
var outlinedID = '';
var board = [
    ['wr','wn','wb','wq','wk','wb','wn','wr'],
    ['wp','wp','wp','wp','wp','wp','wp','wp'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['__','__','__','__','__','__','__','__'],
    ['bp','bp','bp','bp','bp','bp','bp','bp'],
    ['br','bn','bb','bq','bk','bb','bn','br']];


function logoutPressed() {
    socket.emit('logout', {sessionID: SSID});
    document.cookie = 'sessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

socket.on('connect', function() {
    connection_successful(socket);
    window.addEventListener('resize', resized, true);
    document.getElementById('logout').addEventListener('click', logoutPressed, true);
});
socket.on('reconnect', function() {reconnection_successful(socket);});
socket.on('connect_error', function() {connection_failed();});
socket.on('connect_timeout', function() {connection_timeout();});
socket.on('reconnect_attempt', function() {attempting_reconnection();});
socket.on('reconnect_error', function() {reconnection_failed();});
socket.on('validation_success', function(data) {validation_success(data);});
socket.on('validation_failed', function() {validation_failed()});
socket.on('redirect', function(path) {redirect(path);});

socket.on('make_a_move', function(data) {
    board = legalmoves.movepiece(board, data.lastMove.from, data.lastMove.to);
    redrawBoard();
    myMove = true;
    lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
});

socket.on('play_game', function(data) {
    myMove = data.yourMove;
    color = data.color;
    board = data.board;
    rightCastle = data.rightCastle;
    leftCastle = data.leftCastle;

    if (myMove) {
        lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
    }

    for (var y = 0; y < 8; y++) {
        var div = document.createElement('div');
        div.id = 'row' + y;
        document.getElementById('chessboard').appendChild(div);
        for (var x = 0; x < 8; x++) {
            var img = document.createElement('img');
            img.src = '/client/imgs/' + board[y][x].toLowerCase() + '.png';
            img.className = 'piece';
            img.id = alphabet[x] + (y + 1).toString();
            if (color == 'white') {
                img.style.top = (7-y).toString() + '00px';
                img.style.left = x.toString() + '00px';
            } else {
                img.style.top = y.toString() + '00px';
                img.style.left = (7-x).toString() + '00px';
            }
            
            img.addEventListener('click', squareClicked, false);
            document.getElementById('row' + y.toString()).appendChild(img);
        }
    }
    resized();
});

function promoPieceClicked() {
    var z = {
        from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
        to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1},
        piece: this.id
    }
    board = legalmoves.movepiece(board, z.from, z.to, z.piece);
    redrawBoard();
    myMove = false;
    socket.emit(color + '_moved', {move: z, sessionID: SSID});
    if (color == 'white') {
        if (fromSquare == 'e1') {
            leftCastle = false;
            rightCastle = false;
        }
        if (fromSquare == 'a1') {
            leftCastle = false;
        }
        if (fromSquare == 'h1') {
            rightCastle = false;
        }
    } else {
        if (fromSquare = 'e8') {
            leftCastle = false;
            rightCastle = false;
        }
        if (fromSquare == 'a8') {
            leftCastle = false;
        }
        if (fromSquare == 'h8') {
            rightCastle = false;
        }
    }
    fromSquare = '';
    toSquare = ''
}

function squareClicked() {
    var promo = false;
    if (myMove) {
        if (fromSquare == '') {
            fromSquare = this.id;
            outlinedID = this.id;
            addBorder(this.id);
        } else {
            toSquare = this.id;
            var z = {
                from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
                to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1}
            }
            if (board[z.to.y][z.to.x][0] == color[0]) {
                removeBorder(outlinedID);
                fromSquare = toSquare;
                addBorder(fromSquare);
                outlinedID = fromSquare;
                toSquare = '';
            } else {
                for (item of lMoves) {
                    if (item.from.x == z.from.x && item.from.y == z.from.y && item.to.x == z.to.x && item.to.y == z.to.y) {
                        if (board[z.from.y][z.from.x][1] == 'p' && (z.to.y == 7 || z.to.y == 0)) {
                            promo = true;
                        } else {
                            board = legalmoves.movepiece(board, z.from, z.to);
                            redrawBoard();
                            myMove = false;
                            socket.emit(color + '_moved', {move: z, sessionID: SSID});
                            if (color == 'white') {
                                if (fromSquare == 'e1') {
                                    leftCastle = false;
                                    rightCastle = false;
                                }
                                if (fromSquare == 'a1') {
                                    leftCastle = false;
                                }
                                if (fromSquare == 'h1') {
                                    rightCastle = false;
                                }
                            } else {
                                if (fromSquare = 'e8') {
                                    leftCastle = false;
                                    rightCastle = false;
                                }
                                if (fromSquare == 'a8') {
                                    leftCastle = false;
                                }
                                if (fromSquare == 'h8') {
                                    rightCastle = false;
                                }
                            }
                        }
                        
                    }
                }
                
                if (!promo) {
                    removeBorder(outlinedID);
                    outlinedID = '';
                    fromSquare = '';
                    toSquare = '';
                }
            }

            

            
        
        }
    }
}

function redrawBoard() {
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            if (board[y][x] == color[0] + 'k') {
                if (legalmoves.kingInCheck(board, color[0])) {
                
                }
                document.getElementById(alphabet[x] + (y + 1).toString()).style['background-color'] = rgba(184, 57, 57, 5);
            }
            
            
        }
    }
    if (color == 'white') {
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                document.getElementById(alphabet[x] + (y + 1).toString()).src = '/client/imgs/' + board[y][x] + '.png';
            }
        }
    } else {
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                document.getElementById(alphabet[x] + (y + 1).toString()).src = '/client/imgs/' + board[y][x] + '.png';
            }
        }
    }
}

function enablePromoPieces() {

}

function resized() {
    const alphabet = 'abcdefgh';
    var promoDiv = document.getElementById('PromoDiv');
    var htmlBoard = document.getElementById('board');
    var squareSize = 0.75 * Math.min(window.window.innerWidth, window.window.innerHeight) / 8.0;
    htmlBoard.height = 8 * squareSize;
    htmlBoard.width = 8 * squareSize;
    htmlBoard.style.left = ((window.window.innerWidth - htmlBoard.width) / 2.0) + 'px';
    htmlBoard.style.top = ((window.window.innerHeight - htmlBoard.height) / 2.0) + 'px';
    promoDiv.width = squareSize;
    promoDiv.height = 4 * squareSize;
    var pieces = document.getElementsByClassName('piece');
    
    for (var i = 0; i < pieces.length; i++) {
        pieces[i].width = squareSize;
        pieces[i].height = squareSize;
        if (color == 'white') {
            pieces[i].style.left = ((7 - alphabet.indexOf(pieces[i].id[0])) * squareSize + (window.window.innerWidth - htmlBoard.width) / 2.0).toString() + 'px';
            pieces[i].style.top = ((8 - parseInt(pieces[i].id[1])) * squareSize + (window.window.innerHeight - htmlBoard.height) / 2.0).toString() + 'px';
        } else {
            pieces[i].style.left = ((7 - alphabet.indexOf(pieces[i].id[0])) * squareSize + (window.window.innerWidth - htmlBoard.width) / 2.0).toString() + 'px';
            pieces[i].style.top = ((parseInt(pieces[i].id[1]) - 1) * squareSize + (window.window.innerHeight - htmlBoard.height) / 2.0).toString() + 'px';
        }
        
    }
}

function addBorder(id) {
    obj = document.getElementById(id);
    obj.style['outline-style'] = 'solid';
    obj.style['outline-width'] = '3px';
    obj.style['outline-color'] = 'black';
    obj.style['outline-offset'] = '-2px';
    obj.style['outline-radius'] = '2px';
}

function removeBorder(id) {
    document.getElementById(id).style['outline-width'] = '0px';
}
},{"./illegalMoveCheck.js":2}],2:[function(require,module,exports){
function getLegalMoves(tempboard, color, lastmove, castleleft, castleright) {
    var legalmoves = [];
    var temp;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (tempboard[row][col][0] == color) {
                switch (tempboard[row][col][1]) {
                    case 'p':
                        temp = getLegalPawnMoves(tempboard, {x: col, y: row}, lastmove);
                        for (var i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'n':
                        temp = getLegalKnightMoves(tempboard, {x: col, y: row});
                        for (var i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'b':
                        temp = getLegalBishopMoves(tempboard, {x: col, y: row});
                        for (var i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'r':
                        temp = getLegalRookMoves(tempboard, {x: col, y: row});
                        for (var i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'q':
                        temp = getLegalQueenMoves(tempboard, {x: col, y: row});
                        for (var i = 0; i < temp.length; i++) {
                            legalmoves.push(temp[i]);
                        }
                        break;
                    case 'k':
                        temp = getLegalKingMoves(tempboard, {x: col, y: row}, castleleft, castleright);
                        for (var i = 0; i < temp.length; i++) {
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
	for (var n = 0; n < 8; n++) {
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
	for (var b = 0; b < 4; b++) {
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
    for (var r = 0; r < 4; r++) {
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
    for (var i = 0; i < temp.length; i++) {
        
        lmoves.push(temp[i]);
    }

    temp = getLegalBishopMoves(tempboard, piece);
    for (var i = 0; i < temp.length; i++) {
        
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
	for (var d = 0; d < 8; d++) {
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
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
		if(rightcastle && tempboard[0][5] == '__' && tempboard[0][6] == '__') {
			temp = castling(tempboard, 'r', 'w');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
	} else {
		if(leftcastle && tempboard[7][3] == '__' && tempboard[7][2] == '__' && tempboard[7][1] == '__'){
			temp = castling(tempboard, 'r', 'w');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
		if(rightcastle && tempboard[7][5] == '__' && tempboard[7][6] == '__'){
            temp = castling(tempboard, 'r', 'b');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
	}
	return lmoves;
}

function castling(tempboard, dir, color) {
    var b = [];
    for (var y = 0; y < 8; y++) {
        b.push([])
        for (var x = 0; x < 8; x++) {
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

function movepiece(tempboard, from, to, promoPiece = '') {
    var b = [];
    for (var y = 0; y < 8; y++) {
        b.push([])
        for (var x = 0; x < 8; x++) {
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
            (b[to.y - 1][to.x] == 'bp') &&
            from.x != to.x) {

        b[to.y - 1][to.x]='__';
    }
    else if ((b[from.y][from.x] == 'bp') &&
            (b[to.y][to.x] == '__') &&
            (b[to.y + 1][to.x] == 'wp') &&
            from.x != to.x) {

        b[to.y + 1][to.x]='__';
    }

    if (promoPiece != '') {
        for (var x = 0; x < 8; x++) {

        }
    }

    b[to.y][to.x] = b[from.y][from.x];
    b[from.y][from.x] = '__';

    if (b[to.y][to.x][1] == 'p' && (to.y == 7 || to.y == 0)) {
        b[to.y][to.x][1] == promoPiece;
    }
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
    

    for(var y = 0; y < 8; y++){
		for(var x = 0; x < 8; x++){
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
    
	for (var h = 0; h < 4; h++) {
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
    
	for (var di = 0; di < 4; di++){
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
    
	for (var k = 0; k < 8; k++){
		if (onBoard(k.x + knight[k].x, k.y + knight[k].y)) {
			if(tempboard[k.y + knight[k].y][k.x + knight[k].x] == oppo + 'n'){
				return true;
			}
		}
    }
    
	for (var alld = 0; alld < 4; alld++){
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

module.exports = {
    getLegalMoves: getLegalMoves,
    movepiece: movepiece,
    kingInCheck: kingInCheck,
};
},{}]},{},[1]);
