// CHESS LOGIC CODE
//
//
//
//

function illegalMoveCheck (board, move){
	function findColor(piece){
		var white = ['wk', 'wq', 'wb', 'wn', 'wr', 'wp'];
		var black = ['bk', 'bq', 'bb', 'bn', 'br', 'bp'];
		for (var i = 0; i < 6; i++){
			if (tempboard[squareLoc] == white[i]){
				return 'w';
			}
			if (tempboard[squareLoc] == black[i]){
				return 'b';
			}
		}
	}

	function addmove(legalmoves, pieceLoc, squareLoc){//this adds a move to the vector of legal moves, very similar to the change notation function
		var move = [pieceLoc, squareLoc];
		legalmoves.push(move);
		return legalmoves;
	}

	function kingincheck(board, color){
		var horizontal = [8, 1, -8, -1];
		var diagonal = [9, -7, -9, 7];
		var knight = [17, 10, -6, -15, -17, -10, 6, 15];
		var oppo, kLoc, changeLoc = 0;

		for (var y = 0; y < 64; y++){
			if (board[y] == color + 'k'){
				kLoc = y;
			}
		}
		if (color == 'w'){
			oppo = 'b';
			if (board[kLoc + 7] == 'bp'){
				return true;
			}
			else if (board[kLoc + 9] == 'bp'){
				return true;
			}
		}
		else {
			oppo = 'w';
			if (board[kLoc - 7] == 'wp'){
				return true;
			}
			else if (board[kLoc - 9] == 'wp'){
				return true;
			}
		}
		for (var h = 0; h < 4; h++){
			while ((kLoc + changeLoc + horizontal[h] >= 0) && (kLoc + changeLoc + horizontal[h] <= 7)){
				changeLoc += horizontal[h];

				if (board[kLoc + changeLoc] == oppo + 'r'){
					return true;
				}
				else if (board[kLoc + changeLoc] == oppo + 'q'){
					return true;
				}
				else if (board[kLoc + changeLoc] != '__'){
					break;
				}
			}
			changeLoc = 0;
		}
		for (var d = 0; d < 4; d++){
			while ((kLoc + changeLoc + diagonal[d] >= 0) && (kLoc + changeLoc + diagonal[d] <= 7)){
				changeLoc += diagonal[d];
				if (board[kLoc + changeLoc] == oppo + 'b'){
					return true;
				}
				else if (board[kLoc + changeLoc] == oppo + 'q'){
					return true;
				}
				else if (board[kLoc + changeLoc] == '__'){
					break;
				}
			}
			changeLoc = 0;
		}


		for(var k = 0; k < 8; k++){
			if ((kLoc + knight[k] >= 0) && (kLoc + knight[k] <=7)){
				if (board[kLoc + knight[k]] == oppo + 'n'){
					return true;
				}
			}
		}
		for (var alld = 0; alld < 4; alld++){
			if ((kloc + horizontal[alld] >= 0) && (kLoc + horizontal[alld] <= 7)){
				if (board[kLoc + horizontal[alld]] == oppo + 'k'){
					return true;
				}
			}
			if ((kLoc + diagonal[alld] >= 0) && (kLoc + diagonal[alld] <= 7)){
				if (board[kLoc + diagonal[alld]] == oppo + 'k'){
					return true;
				}
			}
		}
		return false;
	
    }
	function legalmovesincheck(legalmoves, board, pieceLoc, squareLoc){
		
		if ((tempboard[pieceLoc] == 'wk' || tempboard[pieceLoc] == 'bk') && (squareLoc % 8) == 6 && (pieceLoc % 8) == 4){
			tempboard[(Math.floor(pieceLoc / 8) * 8) + 5] = 'wr';
			tempboard[(Math.floor(pieceLoc / 8) * 8) + 7] = '__';
		}
		else if ((tempboard[pieceLoc] == 'wk' || tempboard[pieceLoc] == 'bk') && ((squareLoc % 8) == 2) && ((pieceLoc % 8) == 4)){
			tempboard[(Math.floor(pieceLoc / 8) * 8) + 3]= 'wr';
			tempboard[(Math.floor(pieceLoc / 8) * 8) + 0]= '__';
		}
		else if (tempboard[pieceLoc]== 'wp' && tempboard[squareLoc] == '__' && tempboard[squareLoc + 8] == 'bp'){
			tempboard[squareLoc + 8] = '__';
		}
		else if (tempboard[pieceLoc]== 'bp' && tempboard[squareLoc] == '__' && tempboard[squareLoc - 8] == 'wp'){
			tempboard[squareLoc - 8] = '__';
		}
		tempboard[squareLoc] = tempboard[pieceLoc];
		tempboard[pieceLoc] = '__'; //move the piece on the temporary board, same code as the movepiece funciton
		
		
		if (!kingincheck(tempboard, findColor(tempboard[squareLoc]))){//check if the king is in check
			legalmoves = addmove(legalmoves, pieceLoc, squareLoc);//send the move to the function above
		}
		return legalmoves;
	}

	function castling(board, legalmoves, leftORright, color){//this checks if the king can castle, but only checks if the king is in check. The other requirements for castling are held in the main king legal moves function
		var tempboard;//temporary board
		for(var y = 0; y < 64; y++){
			tempboard[y]=board[y];
		}
		var ncolor=0;//this is a number color, which is 0 or 7, based on what color. Basically lets us not have to write the same code with the numbers changed
		if(color == 'w'){
			ncolor = 7;
		}
		if(!kingincheck(board,color)){//if the king isnt in check
			if(leftORright == 'L'){//if he passed all the requirements for calstling to the left
				tempboard[(ncolor * 8) + 3] = tempboard[(ncolor* 8) + 4];
				tempboard[(ncolor * 8) + 4]= '__';//move the king one to the left
				if(!kingincheck(tempboard, color)){//if hes not in check
					tempboard[(ncolor * 8) + 2] = tempboard[(ncolor * 8) + 3];//move him again
					tempboard[(ncolor * 8) + 3] = '__';
					if(!kingincheck(tempboard, color)){//if hes not in check
						legalmoves = addmove(legalmoves, (4 + 8 * ncolor), 2 + (8 * ncolor));//add castling to the left as a legal move
					}
				}
			}
			if(leftORright == 'r'){//basically the same code as the above, but it check to the right
				tempboard[(ncolor * 8) + 5]=tempboard[(ncolor * 8) + 4];
				tempboard[(ncolor * 8) + 4]='__';
				if(!kingincheck(tempboard, color)){
					tempboard[(ncolor * 8) + 6] = tempboard[(ncolor * 8) + 5];
					tempboard[(ncolor * 8) + 5] = '__';
					if(!kingincheck(tempboard, color)){
						legalmoves = addmove(legalmoves, 4 + (8 * ncolor), 6 + (8 * ncolor));
					}
				}
			}
		}
		return legalmoves;
	}

	function pawnlegalmoves(board, legalmoves, pieceLoc){//gets the legal pawn moves if the piece you have selected is a pawn
		var color = findColor(board[pieceLoc]);//get the color of the piece you have selected
		if(color == 'w'){//pawns move differently based on color so we have to have 2 seperate legal move finders
			if(board[pieceLoc + 8] == '__'){// if the square in front of it is empty
				legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + 8);//and when you move the piece it isnt in check, add the move
				if(board[pieceLoc + 16] == '__' && Math.floor(pieceLoc / 8) == 6){//if the square 2 squares in front isnt occupied and the pawn is on its starting square, then it can move two squares
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + 16);
				}
			}
			if(pieceLoc % 8 > 0){//if it isnt on the left edge, check if it can take a piece diagonally to the left
				if(findColor(board[pieceLoc + 7]) == 'b'){//if that square is black
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + 7);// if its not in check move the piece
				}
			}
			if(pieceLoc % 8 < 7){//same code as above, but checks the right side
				if(findColor(board[pieceLoc + 9]) == 'b'){
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + 9);
				}
			}
		}
		else{//same code as above but for black pawns
			if(board[pieceLoc - 8] == '__'){
				legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc - 8);
				if(board[pieceLoc - 16] == '__' && Math.floor(pieceLoc / 8) == 1){
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc - 16);
				}
			}
			if(pieceLoc % 8 > 0){
				if(findColor(board[pieceLoc - 9]) == 'w'){
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc - 9);
				}
			}
			if(pieceLoc % 8 < 7){
				if(findColor(board[pieceLoc - 7]) == 'w'){
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc - 7);
				}
			}
		}
		return legalmoves;
	}

	function knightlegalmoves( board, legalmoves, pieceLoc){//gets knights legal moves
		var knightmoves = [17, 10, -6, -15, -17, -10, 6, 15];//list of knight move directions assuming board is a coordinate grid
		for(var k = 0;k < 8; k++){// for each direction
			if(((pieceLoc + knightmoves[k]) % 8 >= 0) && ((pieceLoc + knightmoves[k]) % 8 <= 7) && (Math.floor((pieceLoc + knightmoves[k]) / 8) >= 0) && (Math.floor((pieceLoc + knightmoves[k]) / 8) <= 7)){//if the square is on the board
				if(findColor(board[pieceLoc]) != findColor(board[pieceLoc + knightmoves[k]])){//if the square we are checking is empty of has a opposite color piece on it
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + knightmoves[k]);// add the move if you arent in check
				}
			}
		}
		return legalmoves;
	}

	function rooklegalmoves(board, legalmoves,pieceLoc){//gets legal rook moves
		var rookmoves = [8, 1, -8, -1];//rook move directions
		var changeLoc = 0;
		for(var r = 0; r < 4; r++){
			while(((pieceLoc + changeLoc + rookmoves[r]) % 8 >= 0) && ((pieceLoc + changeLoc + rookmoves[r]) % 8 < 8) && (Math.floor((pieceLoc + changeLoc + rookmoves[r]) / 8) >= 0) && (Math.floor((pieceLoc + changeLoc + rookmoves[r]) / 8) < 8)){//if the square you are checking is on the board
				changeLoc += rookmoves[r];
				if(findColor(board[pieceLoc]) != findColor(board[pieceLoc + changeLoc])){//if the square you are checking is empty or of opposite color
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + changeLoc);//add the moves
				}
				if(board[pieceLoc + changeLoc] != '__'){//if the square isnt empty, meaning the rook cannot move to any square beyond this one (because pieces cant jump over pieces), break out of the loop
					break;
				}
			}
			changeLoc = 0;//reset changeLoc
		}
		return legalmoves;
	}

	function bishoplegalmoves( board, legalmoves,pieceLoc){// same code as above but for diagonal moves for bishops
		var bishopmoves = [9, -7, -9, 7];
		var changeLoc = 0;
		for(var b = 0; b < 4; b++){
			while(((pieceLoc + changeLoc + bishopmoves[0]) % 8 >= 0) && ((pieceLoc + changeLoc + bishopmoves[b]) % 8 < 8) && (Math.floor((pieceLoc + changeLoc + bishopmoves[b]) / 8) >= 0) && (Math.floor((pieceLoc + changeLoc + bishopmoves[b]) / 8) < 8)){
				changeLoc += bishopmoves[b];
				if(findColor(board[pieceLoc]) != findColor(board[pieceLoc + changeLoc])){
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + changeLoc);
				}
				if(board[pieceLoc + changeLoc] != '__'){
					break;
				}
			}
			changeLoc = 0;
		}
		return legalmoves;
	}

	function queenlegalmoves( board, legalmoves, pieceLoc){//queen legal moves are easy, just get the legal moves for the rook and bishop
		legalmoves = rooklegalmoves(board, legalmoves, pieceLoc);
		legalmoves = bishoplegalmoves(board, legalmoves, pieceLoc);
		return legalmoves ;
	}

	function kinglegalmoves(board, legalmoves, pieceLoc){//gets king legal moves
		var directions =[8, 9, 1, -7, -8, -9, -1, 7];//each horzintla vertical and diagonal direction
        var left = true, right = true;// bools to tell if the king can castle to the right and/or the left
		legalmoves.clear();//clear any legal moves. For some reason I still don't know, even though in the function right before this I clear the legal moves, I am getting extra moves
		for(var d = 0; d < 8; d++){//for each direction
			if(((pieceLoc + directions[d]) % 8 >= 0) && ((pieceLoc + directions[d]) % 8 <= 7) && (Math.floor((pieceLoc + directions[d]) / 8) >= 0) && (Math.floor((pieceLoc + directions[d]) / 8) <= 7)){//if its on the board
				if(findColor(board[pieceLoc]) != findColor(board[pieceLoc + directions[d]])){//if the square is empty or of opposite color
					legalmoves = legalmovesincheck(board, legalmoves, pieceLoc, pieceLoc + directions[d]);//if you arent in check afterwards, add the legal move
				}
			}
		}
		if(board[pieceLoc] == 'wk'){//if the piece is white
			for(var n = 0; n < 64; n++){//this basically says if you moved your rook or king before, you cant castle
				if(board[n] == 'wk' && n != 4){
					left = false;
					right = false;
					break;
				}
				if(board[n] == 'wr'){
					if(n != 0){
						left = false;
						break;
					}
					else if (n != 7){
						right = false;
						break;
					}
				}
			}
			if(left && board[3] == '__' && board[2] == '__' && board[1] == '__'){ //this checks if the square between castling are empty
				legalmoves = castling(board, legalmoves, 'l', 'w');
			}
			if(right && board[5] == '__' && board[6] == '__'){// same but for the other side
				legalmoves = castling(board, legalmoves, 'r', 'w');
			}
		}
		else{ //if the piece is black, same code but different values
			for(var n = 0; n < 64; n++){
				if(board[n] == 'bk'){
					if (n != 60){
						left = false;
						right = false;
						break;
					}
				}
				if(board[n] == 'br'){
					if  (n != 56){
						left = false;
						break;
					}
					else if(n != 63){
						right = false;
						break;
					}
				}
				
			}
			if(left && board[59] == '__' && board[58] == '__' && board[57] == '__'){
				legalmoves = castling(board, legalmoves, 'l', 'B');
			}
			if(right && board[61] == '__' && board[62] == '__'){
				legalmoves = castling(board, legalmoves, 'r', 'b');
			}
		}
        return legalmoves;
    }

	function getlegalmoves(board, legalmoves, pieceLoc){// this takes in the piece you have selected
		legalmoves.clear();
		var piece = board[pieceLoc];//set the piece
		if(piece == 'wp' || piece == 'bp'){//if it piece is == n, then send it to function that finds piece n's legal moves
			legalmoves = pawnlegalmoves(board, legalmoves, pieceLoc);
		}
		else if(piece == 'wr' || piece == 'br'){
			legalmoves = rooklegalmoves(board, legalmoves, pieceLoc);
		}
		else if(piece == 'wn' || piece == 'bn'){
			legalmoves = knightlegalmoves(board, legalmoves, pieceLoc);
		}
		else if(piece == 'wb' || piece == 'bb'){
			legalmoves = bishoplegalmoves(board, legalmoves, pieceLoc);
		}
		else if(piece == 'wq' || piece == 'bq'){
			legalmoves = queenlegalmoves(board, legalmoves, pieceLoc);
		}
		else if(piece == 'wk' || piece == 'bk'){
			legalmoves = kinglegalmoves(board, legalmoves, pieceLoc);
		}
		return legalmoves;
	}

	function checkmate(board, color){ //check if the game is over
		var checkmatemoves;//new vector of legal moves, if it is empty when we get all the legal moves, than the person cannot
		for(var y = 0; y < 64; y++){// go through the board
			if(findColor(board[y]) == color){//if the square has one of your pieces on it
				checkmatemoves = getlegalmoves(board, checkmatemoves, y);//get the legal moves for that piece and put it in checkmate moves
				if(checkmatemoves.size() > 0){//if you have at least one possible legal move then you arent in checkmate
					return false;
				}
			}
		}
		return true;//if you have no legal moves, you are in checkmate
	}
}