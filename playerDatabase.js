//    **NOT FINISHED**    //

var playerData = [];
var p1Location;
var p2Location;

 if (login){ //still need to figure out server communication for this part
    var rating = 0;
    var gamesWon = 0;
    var gamesLost = 0;
    var gamesDrawn = 0;
    newLogin = [username, rating, gamesWon, gamesLost, gamesDrawn]; //set newLogin array to new login info
    playerData.push(newLogin); //add new login info to database
}
if (player1win){
    for (var i = 0; i < playerData.length; i++){
        p1Location = function p1Loc(playerData, player1){
            if ((playerData[i])[1] == player1){
                return i;
            }
        } //find what array contains player 1 info
        p2Location = function p2Loc(playerData, player2){
            if ((playerData[i])[1] == player2){ //player2 = player 2 username
                return i;
            } //find what array contains player 2 info
        }
    }
    (playerData[p1Location])[1] += 10; //add 10 rating points to player 1
    (playerData[p1Location])[2] += 1; //add 1 to games won for player 1
    (playerData[p2Location])[1] -= 10; //subtract 10 rating points from player 2
    (playerData[p2Location])[3] += 1; //add 1 to games lost for player 2
}
else if (player2win){
    for (var i = 0; i < playerData.length; i++){
        p1Location = function p1Loc(playerData, player1){
            if ((playerData[i])[1] == player1){
                return i;
            }
        } //find what array contains player 1 info
        p2Location = function p2Loc(playerData, player2){
            if ((playerData[i])[1] == player2){ //player2 = player 2 username
                return i;
            } //find what array contains player 2 info
        }
    }
    (playerData[p1Location])[1] -= 10; //subtract 10 rating points to player 1
    (playerData[p1Location])[3] += 1; //add 1 to games lost for player 1
    (playerData[p2Location])[1] += 10; //add 10 rating points from player 2
    (playerData[p2Location])[2] += 1; //add 1 to games won for player 2
}
else if (draw){
    //get username of player 1
    //get username of player 2
    for (var i = 0; i < playerData.length; i++){
        p1Location = function p1Loc(playerData, player1){
            if ((playerData[i])[1] == player1){
                return i;
            }
        } //find what array contains player 1 info
        p2Location = function p2Loc(playerData, player2){
            if ((playerData[i])[1] == player2){ //player2 = player 2 username
                return i;
            } //find what array contains player 2 info
        }
    }
    (playerData[p1Location])[4] += 1; //add 1 to games drawn for player 1
	(playerData[p2Location])[4] += 1; //add 1 to games drawn for player 2
}