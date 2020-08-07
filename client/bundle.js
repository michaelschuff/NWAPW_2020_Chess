(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*  This file gets bundled into the same file with illegalMoveCheck. This is necessary to allow us to call
    functions from this file on the server or on the client. To bundle together use the module 'browserify'.

    1. navigate to /client
    2. run the command 'browserify game.js > bundle.js'
    3. navigate back and start server
*/

// vars
var legalmoves = require('./illegalMoveCheck.js');
const SSID = document.cookie.split(';').find(row => row.startsWith('sessionID')).split('=')[1];
var fromSquare = '';
var toSquare = '';
var squareSize = 100;
const alphabet = 'abcdefgh';
var socket = io();
var color;
var myMove = false;
var leftCastle = true;
var rightCastle = true;
var lMoves = [];
var outlinedID = '';
var isGameover = false;
var opponent;
var username;
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
    //clear the sessionID cookie
    document.cookie = 'sessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    socket.emit('logout', {sessionID: SSID});
}

socket.on('connect', function() {
    connection_successful(socket);
    //event listeners
    window.addEventListener('resize', resized, true);
    document.getElementById('logout').addEventListener('click', logoutPressed, true);
    // document.getElementById('board').setAttribute('draggable', false);
    document.getElementById('home').addEventListener('click', function() {redirect('/client/home.html');}, true);
    document.getElementById('newgame').addEventListener('click', function() {socket.emit('wish_to_play', {sessionID: SSID});}, true);
});

//based on connection status call corresponding functions from socketFunctions.js
socket.on('reconnect', function() {reconnection_successful(socket);});
socket.on('connect_error', function() {connection_failed();});
socket.on('connect_timeout', function() {connection_timeout();});
socket.on('reconnect_attempt', function() {attempting_reconnection();});
socket.on('reconnect_error', function() {reconnection_failed();});
socket.on('validation_success', function(data) {validation_success(data);});
socket.on('validation_failed', function() {validation_failed()});
socket.on('redirect', function(path) {redirect(path);});

socket.on('make_a_move', function(data) {//update the board with opponents move and let the client make a move
    board = legalmoves.movepiece(board, data.lastMove.from, data.lastMove.to, data.lastMove.piece);
    redrawBoard();
    myMove = true;
    lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
});

socket.on('play_game', function(data) {//called whenever client connects to /client/game.html
    myMove = data.yourMove;
    color = data.color;
    board = data.board;
    rightCastle = data.rightCastle;
    leftCastle = data.leftCastle;//get game info from server
    opponent = data.opponent;
    username = data.user;
    addUserNames();

    // for (item of document.getElementsByClassName('promo')) {//set source images of promotion pieces
    //     item.src = '/client/imgs/' + color[0] + item.id + '.png';
    // }
    
    for (var y = 0; y < 8; y++) {//create all piece images 
        for (var x = 0; x < 8; x++) {
            var img = document.createElement('img');
            img.src = '/client/imgs/' + board[y][x].toLowerCase() + '.png';
            img.className = 'piece';
            img.id = alphabet[x] + (y + 1).toString();
            //dont let user drag the images and save them to their desktop
            //this isnt for security reasons, just aesthetic and function
            img.setAttribute('draggable', false);
            
            
            img.addEventListener('click', squareReleased, false);
            document.getElementById('playingArea').appendChild(img);
        }
    }

    var possiblePromoPieces = 'qrbn';// Q ueen R ook B ishop K night
    for (var i = 0; i < 4; i++) {//setup promotion piece choice images
        var img = document.createElement('img');
        img.src = '/client/imgs/' + color[0] + possiblePromoPieces[i] + '.png';
        img.className = 'promo';
        img.id = possiblePromoPieces[i];
        //dont let user drag the images and save them to their desktop
        //this isnt for security reasons, just aesthetic and function
        img.setAttribute('draggable', false);
        
        img.addEventListener('click', promoPieceClicked, false);
        document.getElementById('PromoDiv').appendChild(img);
    }


    document.getElementById('PromoDiv').style.display = 'none';//hide promotion piece choices until needed
    resized();//call function to set size of all pieces/board etc
    if (myMove) {
        lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
    }
});


/*  called when server determines the game has ended.
    set the result text and display the gameover popup
*/
socket.on('gameover', function(data) {
    isGameover = true;
    document.getElementById('result').innerText = data.textResult;
    document.getElementById('gameover').style.display = 'block';
})

function promoPieceClicked() {
    document.getElementById('PromoDiv').style.display = 'none';
    var z = {//convert piece notation (ex: e2e4 or f7f6) into index notation (ex: e2e4 -> 4143)
        from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
        to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1},
        piece: this.id//id of piece, used when promoting
    }

    for (var x = 0; x < 8; x++) {//check back ranks, if there is a pawn there it needs to be promoted
        if (board[color == 'white' ? 7 : 0][x] == color[0] + 'p') {
            board[color == 'white' ? 7 : 0][x] = color[0] + z.piece;
        }
    }
    redrawBoard();//update visuals
    myMove = false;
    socket.emit(color + '_moved', {move: z, sessionID: SSID});//send move to server
    removeBorder(outlinedID);
    outlinedID = '';
    fromSquare = '';
    toSquare = '';
}

function squareReleased() {
    var promo = false;
    if (myMove) {
        if (fromSquare == '') {
            fromSquare = this.id;
            if (board[parseInt(fromSquare[1]) - 1][alphabet.indexOf(fromSquare[0])][0] == color[0]) {
                outlinedID = this.id;
                addBorder(this.id);
            } else {
                fromSquare = '';
            }
        } else {
            toSquare = this.id;
            var z = {
                from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
                to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1},
                piece: ''
            }
            if (board[z.to.y][z.to.x][0] == color[0]) {
                removeBorder(outlinedID);
                fromSquare = toSquare;
                addBorder(fromSquare);
                outlinedID = fromSquare;
                toSquare = '';
            } else if (fromSquare == toSquare) {
                removeBorder(outlinedID);
                outlinedID = '';
                fromSquare = '';
                toSquare = '';
            } else {
                for (item of lMoves) {
                    if (item.from.x == z.from.x && item.from.y == z.from.y && item.to.x == z.to.x && item.to.y == z.to.y) {
                        if (board[z.from.y][z.from.x][1] == 'p' && (z.to.y == 7 || z.to.y == 0)) {
                            promo = true;
                            board = legalmoves.movepiece(board, z.from, z.to);
                            redrawBoard();
                            removeBorder(outlinedID);
                            outlinedID = toSquare;
                            addBorder(outlinedID);

                            document.getElementById('PromoDiv').style.display = 'inline-block';
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
                                if (fromSquare == 'e8') {
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

function resized() {
    const alphabet = 'abcdefgh';
    squareSize = 0.75 * Math.min(window.window.innerWidth, window.window.innerHeight) / 8.0;
    var usernameTextHeight = document.getElementById('opponent').offsetHeight;

    var game = document.getElementById('game');
    game.style.width = (9.0 * squareSize).toString() + 'px';
    game.style.height = (8.0 * squareSize).toString() + 'px';
    game.style.left = (window.window.innerWidth / 2.0 - 4.0 * squareSize).toString() + 'px';
    game.style.top = (window.window.innerHeight / 2.0 - 4.0 * squareSize).toString() + 'px';
    
    var playingArea = document.getElementById('playingArea');
    playingArea.style.height = (8 * squareSize).toString() + 'px';
    playingArea.style.width = (8 * squareSize).toString() + 'px';
    playingArea.style.top = usernameTextHeight.toString() + 'px';


    var pieces = document.getElementsByClassName('piece');
    
    for (var i = 0; i < pieces.length; i++) {
        pieces[i].style.width = squareSize.toString() + 'px';
        pieces[i].style.height = squareSize.toString() + 'px';
        if (color == 'white') {
            pieces[i].style.left = (alphabet.indexOf(pieces[i].id[0]) * squareSize).toString() + 'px';
            pieces[i].style.top = ((8 - parseInt(pieces[i].id[1])) * squareSize).toString() + 'px';
        } else {
            pieces[i].style.left = ((7 - alphabet.indexOf(pieces[i].id[0])) * squareSize).toString() + 'px';
            pieces[i].style.top = ((parseInt(pieces[i].id[1]) - 1) * squareSize).toString() + 'px';
        }
    }

    var promoDiv = document.getElementById('PromoDiv');
    promoDiv.style.width = squareSize.toString() + 'px';
    promoDiv.style.height = (4.0 * squareSize).toString() + 'px';
    promoDiv.style.left = (8.0 * squareSize).toString() + 'px';
    promoDiv.style.top = document.getElementById('opponent').offsetHeight.toString() + 'px';

    var promoPieces = document.getElementsByClassName('promo');

    for (var i = 0; i < promoPieces.length; i++) {
        promoPieces[i].style.width = squareSize.toString() + 'px';
        promoPieces[i].style.height = squareSize.toString() + 'px';
    }

    document.getElementById('player').style.top = (usernameTextHeight + 8 * squareSize).toString() + 'px';

    var gameover = document.getElementById('gameover');
    gameover.style.width = (3.0 * squareSize).toString() + 'px';
    gameover.style.height = (3.0 * squareSize).toString() + 'px';
    gameover.style.left = (2.5 * squareSize).toString() + 'px';
    gameover.style.top = (2.5 * squareSize + usernameTextHeight).toString() + 'px';
    if (!isGameover) {
        gameover.style.display = 'none';
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

function addUserNames() {
    var par = document.getElementById('opponent');
    par.innerText = opponent.toString();
    par.style['position'] = 'absolute';
    par.style['float'] = 'left';
    par.style['text-align'] = 'center';
    par.style['font-size'] = '20px';
    par.style['color'] = 'rgb(0,0,0)';
    par.style['fontFamily'] = 'Nova Round';
    par.style['margin'] = '0';

    var userPar = document.getElementById('player');
    userPar.innerText = username.toString();
    userPar.style['position'] = 'absolute';
    userPar.style.top = 'px';
    userPar.style['float'] = 'left';
    userPar.style['text-align'] = 'center';
    userPar.style['font-size'] = '20px';
    userPar.style['color'] = 'rgb(0,0,0)';
    userPar.style['margin'] = '0';
}
},{"./illegalMoveCheck.js":2}],2:[function(require,module,exports){
function getLegalMoves(tempboard, color, lastmove, castleleft, castleright) { //get all legal moves for the selected piece
    var legalmoves = [];
    var temp;
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (tempboard[row][col][0] == color) { //if this piece is the correct color
                switch (tempboard[row][col][1]) { //detect which piece we are checking and call the corresponding function
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
	if (color == 'w') { //pawns move weirdly so code is different for white pawn vs black pawn
		if (tempboard[piece.y + 1][piece.x] == '__') {
			if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y + 1}), 'w')) { //checks if king is in check after pawn is moved
                lmoves.push({from: piece, to: {x: piece.x, y: piece.y + 1}});
            }
            if (piece.y == 1) {
                if (tempboard[piece.y + 2][piece.x] == '__') {
                    if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y + 2}), 'w')) {
                        lmoves.push({from: piece, to: {x: piece.x, y: piece.y + 2}});
                    }
                }
            }
        }
        
		if (piece.x > 0) {
			if (tempboard[piece.y + 1][piece.x - 1][0] == 'b') { //checks if there's a black pawn that the pawn can take
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y + 1}});
                }
			}
            if (lastmove.from.x == piece.x - 1 &&
                lastmove.from.y == 6 &&
                lastmove.to.x == piece.x - 1 &&
                lastmove.to.y == 4 &&
                piece.y == 4 && 
                tempboard[piece.y][piece.x - 1] == 'bp') { //checks if en passant is legal by checking black's last move

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y + 1}});
                }
			}
		}
        
        if (piece.x < 7) {
			if (tempboard[piece.y + 1][piece.x + 1][0] == 'b') { //checks if there's a black pawn that the pawn can take
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y + 1}});
                }
			}
            if (lastmove.from.x == piece.x + 1 &&
                lastmove.from.y == 6 &&
                lastmove.to.x == piece.x + 1 &&
                lastmove.to.y == 4 &&
                piece.y == 4 && 
                tempboard[piece.y][piece.x + 1] == 'bp') { //checks if en passant is legal by checking black's last move

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y + 1}), 'w')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y + 1}});
                }
			}
        }
        
	} else { //pawns move weirdly so code is different for white pawn vs black pawn
		if (tempboard[piece.y - 1][piece.x] == '__') {
			if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y - 1}), 'b')) { //checks if king is in check after pawn is moved
                lmoves.push({from: piece, to: {x: piece.x, y: piece.y - 1}});
            }
            if (piece.y == 6) {
                if (tempboard[piece.y - 2][piece.x] == '__') {
                    if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x, y: piece.y - 2}), 'b')) {
                        lmoves.push({from: piece, to: {x: piece.x, y: piece.y - 2}});
                    }
                }
            }
			
        }
        
		if (piece.x > 0) {
			if (tempboard[piece.y - 1][piece.x - 1][0] == 'w') {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y - 1}), 'b')) { //checks if there's a white pawn that the pawn can take
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y - 1}});
                }
			}
            if (lastmove.from.x == piece.x - 1 &&
                lastmove.from.y == 1 &&
                lastmove.to.x == piece.x - 1 &&
                lastmove.to.y == 3 &&
                piece.y == 3 && 
                tempboard[piece.y][piece.x - 1] == 'wp') { //checks if en passant is legal by checking white's last move

				if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x - 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x - 1, y: piece.y - 1}});
                }
			}
		}
        
        if (piece.x < 7) { 
			if (tempboard[piece.y - 1][piece.x + 1][0] == 'w') { //checks if there's a white pawn that the pawn can take
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + 1, y: piece.y - 1}), 'b')) {
                    lmoves.push({from: piece, to: {x: piece.x + 1, y: piece.y - 1}});
                }
			}
            if (lastmove.from.x == piece.x + 1 &&
                lastmove.from.y == 1 &&
                lastmove.to.x == piece.x + 1 &&
                lastmove.to.y == 3 &&
                piece.y == 3 && 
                tempboard[piece.y][piece.x + 1] == 'wp') { //checks if en passant is legal by checking white's last move

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
    const knight = [{x: 1, y: 2}, //list of all possible knight moves
        {x: 2, y: 1},
        {x: 2, y: -1},
        {x: 1, y: -2},
        {x: -1, y: -2},
        {x: -2, y: -1},
        {x: -2, y: 1},
        {x: -1, y: 2}];
	for (var n = 0; n < 8; n++) {
		if(onBoard(piece.x + knight[n].x, piece.y + knight[n].y)) { //checks which knight moves are on the board
			if(tempboard[piece.y][piece.x][0] != tempboard[piece.y + knight[n].y][piece.x + knight[n].x][0]) { //checks if square knight is moving to doesn't have same color piece on it
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
    const bishop = [{x: 1, y: 1}, //list of possible directions bishop can move
                    {x: 1, y: -1},
                    {x: -1, y: -1},
                    {x: -1, y: 1}];
	var delta = {x: 0, y: 0};
	for (var b = 0; b < 4; b++) {
		while(onBoard(piece.x + delta.x + bishop[b].x, piece.y + delta.y + bishop[b].y)) { //gets all possible bishop moves from directions
			delta.x += bishop[b].x;
			delta.y += bishop[b].y;
            if (tempboard[piece.y + delta.y][piece.x + delta.x][0] == tempboard[piece.y][piece.x][0]){ //checks if square has same color piece
                break;
            }
			if(tempboard[piece.y][piece.x][0] != tempboard[piece.y + delta.y][piece.x + delta.x][0]) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + delta.x, y: piece.y + delta.y}), tempboard[piece.y][piece.x][0])) { //checks if king is in check after bishop moves
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
    const rook = [{x: 0, y: 1}, //list of possible directions rook can move
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: -1,y: 0}];
    var delta = {x: 0, y: 0};
    for (var r = 0; r < 4; r++) {
        while(onBoard(piece.x + delta.x + rook[r].x, piece.y + delta.y + rook[r].y)) { //gets all possible rook moves from directions
            delta.x += rook[r].x;
            delta.y += rook[r].y;
            if (tempboard[piece.y + delta.y][piece.x + delta.x][0] == tempboard[piece.y][piece.x][0]){ //checks if square has same color piece
                break;
            }
            if (tempboard[piece.y][piece.x][0] != tempboard[piece.y + delta.y][piece.x + delta.x][0]) {
                if (!kingInCheck(movepiece(tempboard, piece, {x: piece.x + delta.x, y: piece.y + delta.y}), tempboard[piece.y][piece.x][0])) { //checks if king is in check after rook moves
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

function getLegalQueenMoves(tempboard, piece) { //queen can move like bishop and rook
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
    const dirs = [{x: 0, y: 1}, //list of directions king can move
                  {x: 1, y: 0},
                  {x: 0, y: -1},
                  {x: -1, y: 0},
                  {x: 1, y: 1},
                  {x: 1, y: -1},
                  {x: -1, y: -1},
                  {x: -1, y: 1}];
	for (var d = 0; d < 8; d++) {
		if (onBoard(piece.x + dirs[d].x, piece.y + dirs[d].y)) { //gets all possible king moves from directions
			if (tempboard[piece.y][piece.x][0] != tempboard[piece.y + dirs[d].y][piece.x + dirs[d].x][0]) {
                var c = movepiece(tempboard, piece, {x: piece.x + dirs[d].x, y: piece.y + dirs[d].y}); 
				if (!kingInCheck(c, tempboard[piece.y][piece.x][0])) { 
                    lmoves.push({from: piece, to: {x: piece.x + dirs[d].x, y: piece.y + dirs[d].y}});
                }
			}
        }
    }
    var temp;//temporary storage for list of legal moves

    //castling is different for white king vs black king
    if (tempboard[piece.y][piece.x] == 'wk') {
        //checks if squares between king and rook are empty
		if (leftcastle && tempboard[0][3] == '__' && tempboard[0][2] == '__' && tempboard[0][1] == '__') { 
            temp = castling(tempboard, 'l', 'w');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
        }
        
        //checks if squares between king and rook are empty
		if(rightcastle && tempboard[0][5] == '__' && tempboard[0][6] == '__') { 
			temp = castling(tempboard, 'r', 'w');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
		}
    } else { //castling is different for white king vs black king
        //checks if squares between king and rook are empty
		if(leftcastle && tempboard[7][3] == '__' && tempboard[7][2] == '__' && tempboard[7][1] == '__'){ 
			temp = castling(tempboard, 'l', 'b');
			for (var i = 0; i < temp.length; i++) {
                lmoves.push(temp[i]);
            }
        }
        
        //checks if squares between king and rook are empty
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
            b[y].push(tempboard[y][x]); //creates a temporary board
        }
    }
    var lmoves = [];
    /*
        if color is white ncolor = 0, if color is black ncolor = 7
        
        represents each color's back rank
    */
	const ncolor = (color == 'w') ? 0 : 7; 
	if(!kingInCheck(b, color)) {
		if (dir == 'l') { //if king is castling to the left
			b[ncolor][3] = b[ncolor][4];
			b[ncolor][4] = '__';
			if(!kingInCheck(b, color)){ //checks if king is in check after moving 1 square
				b[ncolor][2] = b[ncolor][3];
				b[ncolor][3] = '__';
				if(!kingInCheck(b, color)){ //checks if king is in check after moving 2 squares
					lmoves.push({from: {x: 4, y: ncolor}, to: {x: 2, y: ncolor}});
				}
			}
		}
		if (dir == 'r'){ //if king is castling to the right
			b[ncolor][5] = b[ncolor][4];
			b[ncolor][4] = '__';
			if (!kingInCheck(b, color)) { //checks if king is in check after moving 1 square
				b[ncolor][6] = b[ncolor][5];
				b[ncolor][5] = '__';
				if (!kingInCheck(b, color)) { //checks if king is in check after moving 2 squares
					lmoves.push({from: {x: 4, y: ncolor}, to: {x: 6, y: ncolor}});
				}
			}
		}
	}
	return lmoves;
}

function movepiece(tempboard, from, to, promoPiece = '') {
    var color = tempboard[from.y][from.x][0];
    var b = [];//create a temporary board
    for (var y = 0; y < 8; y++) {
        b.push([])
        for (var x = 0; x < 8; x++) {
            b[y].push(tempboard[y][x]); 
        }
    }

    if ((b[from.y][from.x] == 'wk' || b[from.y][from.x] == 'bk') &&
            (to.x == 6) && 
            (from.x == 4)) { //if king is castling to the right

        b[from.y][5] = color + 'r';
        b[from.y][7] = '__';
    } else if ((b[from.y][from.x] == 'wk' ||
            b[from.y][from.x] == 'bk') &&
            (to.x == 2) &&
            (from.x == 4)) { //if king is castling to the left

        b[from.y][3] = color + 'r';
        b[from.y][0] = '__';
    } else if ((b[from.y][from.x] == 'wp') &&
            (b[to.y][to.x] == '__') &&
            (b[to.y - 1][to.x] == 'bp') &&
            from.x != to.x) { //if white pawn is capturing en passant

        b[to.y - 1][to.x]='__';
    }
    else if ((b[from.y][from.x] == 'bp') &&
            (b[to.y][to.x] == '__') &&
            (b[to.y + 1][to.x] == 'wp') &&
            from.x != to.x) { //if black pawn is capturing en passant

        b[to.y + 1][to.x]='__';
    }

    b[to.y][to.x] = b[from.y][from.x];
    b[from.y][from.x] = '__';
    if (promoPiece != '') {
        b[to.y][to.x] = color + promoPiece;
    }

    return b;
}

function kingInCheck(tempboard, color) {
    const horz = [{x: 0, y: 1}, //vertical & horizontal directions
            {x: 1, y: 0},
            {x: 0, y: -1},
            {x: -1,y: 0}];
    const diag = [{x: 1, y: 1}, //diagonal directions
            {x: 1, y: -1},
            {x: -1, y: -1},
            {x: -1, y: 1}];
    const knight = [{x: 1, y: 2}, //knight directions
              {x: 2, y: 1},
              {x: 2, y: -1},
              {x: 1, y: -2},
              {x: -1, y: -2},
              {x: -2, y: -1},
              {x: -2, y: 1},
              {x: -1, y: 2}];
    var k = {x: -1, y: -1}
    var delta = {x: 0, y: 0};
	const oppo = (color == 'w') ? 'b' : 'w'; //if color is white oppo = b, if color is black oppo = w
    

    for(var y = 0; y < 8; y++){
		for(var x = 0; x < 8; x++){
			if(tempboard[y][x] == color + 'k'){ //finds where king is on the board
				k.x = x;
				k.y = y;
			}
		}
    }
    

	if (color == 'w') { //checks if a pawn is putting white king in check
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
	} else { //checks if a pawn is putting black king in check
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
    
	for (var h = 0; h < 4; h++) { //checks if a rook or a queen are putting king in check
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
    
	for (var di = 0; di < 4; di++) { //checks if a bishop or a queen is putting king in check
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
    
	for (var kn = 0; kn < 8; kn++){ //checks if a knight is putting king in check
		if (onBoard(k.x + knight[kn].x, k.y + knight[kn].y)) {
			if(tempboard[k.y + knight[kn].y][k.x + knight[kn].x] == oppo + 'n'){
				return true;
			}
		}
    }
    
	for (var alld = 0; alld < 4; alld++){ //checks if a king is putting king in check
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

//check if square is on the board to prevent index error
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
