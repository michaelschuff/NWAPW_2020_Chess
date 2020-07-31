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
    document.cookie = 'sessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    socket.emit('logout', {sessionID: SSID});
}

socket.on('connect', function() {
    connection_successful(socket);
    window.addEventListener('resize', resized, true);
    document.getElementById('logout').addEventListener('click', logoutPressed, true);
    document.getElementById('board').setAttribute('draggable', false);
    document.getElementById('home').addEventListener('click', function() {redirect('/client/home.html');}, true);
    document.getElementById('newgame').addEventListener('click', function() {socket.emit('wish_to_play', {sessionID: SSID});}, true);
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
    board = legalmoves.movepiece(board, data.lastMove.from, data.lastMove.to, data.lastMove.piece);
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

    

    for (item of document.getElementsByClassName('promo')) {
        item.src = '/client/imgs/' + color[0] + item.id + '.png';
    }
    
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var img = document.createElement('img');
            img.src = '/client/imgs/' + board[y][x].toLowerCase() + '.png';
            img.className = 'piece';
            img.id = alphabet[x] + (y + 1).toString();
            img.setAttribute('draggable', false);
            
            
            img.addEventListener('click', squareReleased, false);
            document.getElementById('playingArea').appendChild(img);
        }
    }

    var possiblePromoPieces = 'qrbn';
    for (var i = 0; i < 4; i++) {
        var img = document.createElement('img');
        img.src = '/client/imgs/' + color[0] + possiblePromoPieces[i] + '.png';
        img.className = 'promo';
        img.id = possiblePromoPieces[i];
        img.setAttribute('draggable', false);
        
        img.addEventListener('click', promoPieceClicked, false);
        document.getElementById('PromoDiv').appendChild(img);
    }


    document.getElementById('PromoDiv').style.display = 'none';
    resized();
    if (myMove) {
        lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
    }
});

socket.on('gameover', function(data) {
    document.getElementById('result').innerText = data.textResult;
    document.getElementById('gameover').style.display = 'inline-block';
})

function promoPieceClicked() {
    document.getElementById('PromoDiv').style.display = 'none';
    var z = {
        from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
        to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1},
        piece: this.id
    }

    for (var x = 0; x < 8; x++) {
        if (board[color == 'white' ? 7 : 0][x] == color[0] + 'p') {
            board[color == 'white' ? 7 : 0][x] = color[0] + z.piece;
        }
    }
    redrawBoard();
    myMove = false;
    socket.emit(color + '_moved', {move: z, sessionID: SSID});
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
                            // var p = document.getElementsByClassName('promo');
                            // for (item of p) {
                            //     item.style.display = 'inline-block';
                            // }
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
    var squareSize = 0.75 * Math.min(window.window.innerWidth, window.window.innerHeight) / 8.0;
    
    var game = document.getElementById('game');
    game.style.width = (9.0 * squareSize).toString() + 'px';
    game.style.height = (8.0 * squareSize).toString() + 'px';
    game.style.left = (window.window.innerWidth / 2.0 - 4.5 * squareSize).toString() + 'px';
    game.style.top = (window.window.innerHeight / 2.0 - 4.0 * squareSize).toString() + 'px';
    
    var playingArea = document.getElementById('playingArea');
    playingArea.style.height = (8 * squareSize).toString() + 'px';
    playingArea.style.width = (8 * squareSize).toString() + 'px';

    var htmlBoard = document.getElementById('board');
    htmlBoard.style.width = (8 * squareSize).toString() + 'px';
    htmlBoard.style.height = (8 * squareSize).toString() + 'px';


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
    promoDiv.style.top = '0px';

    var promoPieces = document.getElementsByClassName('promo');

    for (var i = 0; i < promoPieces.length; i++) {
        promoPieces[i].style.width = squareSize.toString() + 'px';
        promoPieces[i].style.height = squareSize.toString() + 'px';
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