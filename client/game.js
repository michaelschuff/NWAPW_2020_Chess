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

    for (item of document.getElementsByClassName('promo')) {
        item.src = '/client/imgs/' + color[0] + item.id + '.png';
    }
    
    for (var y = 0; y < 8; y++) {
        var div = document.createElement('div');
        div.id = 'row' + y;
        document.getElementById('playingArea').appendChild(div);
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
            
            img.addEventListener('click', squareReleased, false);
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

function squareReleased() {
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
    var squareSize = 0.75 * Math.min(window.window.innerWidth, window.window.innerHeight) / 8.0;
    
    var game = document.getElementById('game');
    game.style.position = 'absolute';
    game.width = 9 * squareSize;
    game.height = 8 * squareSize;
    game.style.left = (((window.window.innerWidth - htmlBoard.width) / 2.0) - 4.5 * squareSize) + 'px';
    game.style.top = (((window.window.innerHeight - htmlBoard.height) / 2.0) - 4.5 * squareSize) + 'px';
    
    var htmlBoard = document.getElementById('playingArea');
    htmlBoard.height = 8 * squareSize;
    htmlBoard.width = 8 * squareSize;

    var promoDiv = document.getElementById('PromoDiv');
    promoDiv.width = squareSize;
    promoDiv.height = 4 * squareSize;

    var pieces = document.getElementsByClassName('piece');
    var promoPieces = document.getElementsByClassName('promo');
    
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
    // promoDiv.style.left = (8 * squareSize + ((window.window.innerWidth - htmlBoard.width) / 2.0)).toString() + 'px';
    // promoDiv.style.top = ((window.window.innerHeight - htmlBoard.height) / 2.0).toString() + 'px';

    for (var i = 0; i < promoPieces.length; i++) {
        promoPieces[i].width = squareSize;
        promoPieces[i].height = squareSize;
        // promoPieces[i].style.left = (8 * squareSize + ((window.window.innerWidth - htmlBoard.width) / 2.0)).toString() + 'px';
        // var offset = 0;
        // switch(promoPieces[i].id) {
        //     case 'q':
        //         offset = 0;
        //         break;
        //     case 'r':
        //         offset = 1;
        //         break;
        //     case 'b':
        //         offset = 2;
        //         break;
        //     case 'n':
        //         offset = 3;
        //         break;
        // }   
        // promoPieces[i].style.top = (offset * squareSize + (window.window.innerHeight - htmlBoard.height) / 2.0).toString() + 'px';
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