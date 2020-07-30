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
var board;


function logoutPressed() {
    socket.emit('logout', {sessionID: SSID});
    document.cookie = 'sessionID=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
    
function moveMade() {
    var promoPiece='';
    var move = document.getElementById('input').value;
    document.getElementById('input').value = '';
    if (myMove) {
        if (move.length != 4) {
            promoPiece = move[5];
            move = move.slice(0, 3);
        }
        
        var z = {
            from: {x: alphabet.indexOf(move[0]), y: parseInt(move[1]) - 1},
            to: {x: alphabet.indexOf(move[2]), y: parseInt(move[3]) - 1}
        }

        var fromSquare = move[0] + move[1];

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
                } else {
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
    }   
}
socket.on('connect', function() {
    connection_successful(socket);
    document.getElementById('submit').addEventListener('click', moveMade, true);
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
    redrawBoard();

    if (myMove) {
        lMoves = legalmoves.getLegalMoves(board, color[0], data.lastMove, leftCastle, rightCastle);
    }

    // for (var y = 0; y < 8; y++) {
    //     var div = document.createElement('div');
    //     div.id = 'row' + y;
    //     document.getElementById('chessboard').appendChild(div);
    //     for (var x = 0; x < 8; x++) {
    //         var img = document.createElement('img');
    //         img.src = '/client/imgs/' + board[y][x].toLowerCase() + '.png';
    //         img.className = 'piece';
    //         img.id = alphabet[x] + (y + 1).toString();
    //         if (color == 'white') {
    //             img.style.top = (7-y).toString() + '00px';
    //             img.style.left = x.toString() + '00px';
    //         } else {
    //             img.style.top = y.toString() + '00px';
    //             img.style.left = (7-x).toString() + '00px';
    //         }
            
    //         img.addEventListener('click', squareClicked, false);
    //         document.getElementById('row' + y.toString()).appendChild(img);
    //     }
    // }
});



// function squareClicked() {
//     if (myMove) {
//         if (fromSquare == '') {
//             fromSquare = this.id;
//         } else {
//             toSquare = this.id;
//             var z = {
//                 from: {x: alphabet.indexOf(fromSquare[0]), y: parseInt(fromSquare[1]) - 1},
//                 to: {x: alphabet.indexOf(toSquare[0]), y: parseInt(toSquare[1]) - 1}
//             }

//             for (item of legalMoves) {
//                 if (item.from.x == z.from.x && item.from.y == z.from.y && item.to.x == z.to.x && item.to.y == z.to.y) {
//                     updateboard(fromSquare, toSquare);
//                     myMove = false;
//                     socket.emit(color + '_moved', {to: toSquare, from: fromSquare, sessionID: SSID});
//                     if (color == 'white'){
//                         if (fromSquare == 'e1'){
//                             leftCastle = false;
//                             rightCastle = false;
//                         }
//                         if (fromSquare == 'a1'){
//                             leftCastle = false;
//                         }
//                         if (fromSquare == 'h1'){
//                             rightCastle = false;
//                         }
//                     }
//                     else {
//                         if (fromSquare = 'e8'){
//                             leftCastle = false;
//                             rightCastle = false;
//                         }
//                         if (fromSquare == 'a8'){
//                             leftCastle = false;
//                         }
//                         if (fromSquare == 'h8'){
//                             rightCastle = false;
//                         }
//                     }
//                 }
//             }
            
//             fromSquare = '';
//             toSquare = '';
        
//         }
//     }
// }

function redrawBoard() {
    if (color == 'white') {
        var str = "+--+--+--+--+--+--+--+--+\n";
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                str += '|' + board[7-y][x];
            }
            str += '|\n+--+--+--+--+--+--+--+--+\n'
        }
        document.getElementById('boardid').innerText = str;
        // for (var y = 0; y < 8; y++) {
        //     for (var x = 0; x < 8; x++) {
        //         document.getElementById(alphabet[x] + (y + 1).toString()).src = '/client/imgs/' + board[y][x] + '.png';
        //     }
        // }
    } else {
        var str = "+--+--+--+--+--+--+--+--+\n";
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                str += '|' + board[y][7-x];
            }
            str += '|\n+--+--+--+--+--+--+--+--+\n'
        }
        document.getElementById('boardid').innerText = str;
        // for (var y = 0; y < 8; y++) {
        //     for (var x = 0; x < 8; x++) {
        //         document.getElementById(alphabet[x] + (y + 1).toString()).src = '/client/imgs/' + board[y][x] + '.png';
        //     }
        // }
    }
}