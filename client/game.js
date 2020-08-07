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
    game.style.height = (8.0 * squareSize + usernameTextHeight * 2).toString() + 'px';
    game.style.left = (window.window.innerWidth / 2.0 - 4.0 * squareSize).toString() + 'px';
    game.style.top = (window.window.innerHeight / 2.0 - 4.0 * squareSize - usernameTextHeight).toString() + 'px';
    
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