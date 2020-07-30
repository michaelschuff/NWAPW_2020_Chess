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
});



function squareClicked() {
    if (myMove) {
        if (fromSquare == '') {
            fromSquare = this.id;
        } else {
            toSquare = this.id;
            var z = {
                from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
                to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1}
            }

            for (item of lMoves) {
                if (item.from.x == z.from.x && item.from.y == z.from.y && item.to.x == z.to.x && item.to.y == z.to.y) {
                    board = legalmoves.movepiece(board, z.from, z.to);
                    redrawBoard();
                    myMove = false;
                    socket.emit(color + '_moved', {move: z, sessionID: SSID});
                    if (color == 'white'){
                        if (fromSquare == 'e1'){
                            leftCastle = false;
                            rightCastle = false;
                        }
                        if (fromSquare == 'a1'){
                            leftCastle = false;
                        }
                        if (fromSquare == 'h1'){
                            rightCastle = false;
                        }
                    }
                    else {
                        if (fromSquare = 'e8'){
                            leftCastle = false;
                            rightCastle = false;
                        }
                        if (fromSquare == 'a8'){
                            leftCastle = false;
                        }
                        if (fromSquare == 'h8'){
                            rightCastle = false;
                        }
                    }
                }
            }
            
            fromSquare = '';
            toSquare = '';
        
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