# NWAPW_2020_Chess
"Chess played on a server"
MVP:
Two can play chess through their browser with each other as long as they have an internet connection.
One player will be white and move first, and when they make their move, the other players board will update and the new player will be able to make a move. A simple sign in system will be created to easily identify who is who, and can allow continuation of the game if a player accidently disconnects. A matchmaking system will be needed to be put into place to pair people up. All rules of chess will also need to be implemented, including castling and en passant.

Additional potential features (not in order):
1. Ranking system with smart matchmaking
2. Game clock system, limiting the amount of time players can spend thinking
3. Chess variants, such as sacrifice, crazy house, and horde, among others.
4. Improved UI (We're assuming the UI coming out of the MVP is gonna be pretty basic) and sounds
5. Potentially a tactics trainer, where chess puzzels are given to the player to solve. This would require a unique system for the computer to make pre determined moves based on the players moves, and a unique rating system as well. Each puzzel would have its own rating and act as a player. If it is solved, its rating goes down. If it is unsolved, its rating goes up.
6. If we can find a viable, free to use chess AI online then being able to play against the computer could be another feature.
7. Tournaments, multiple players join a tournament and play a certain number of rounds of games of a certain gamemode. Custom tournaments that could be shared with users friends is a possibility as well.
8. Improved accounts including sign-in with google, rating tracking, game logs, and friends. (is it ethical to put an enemies feature in a game???)
9. Notifications of tournaments, when its your move, etc.
10. Ability to play multiple games at a time, for example players may want to play games that allow for multiple days per move, and they ay want to play 5 of them at once.
11. Tutorials for each variant and the standard game.
12. Ability to customize UI with different boards, pieces, and/or colors.

We will use Amazon Web Services to host our website, in addition to being our backend database. We will be coding in nodejs/html for frontend and backend. For communication we will be using the ajax module or the express module.

The basic flow of a game might go something like this. After logging in, User1 connects to the server and clicks play. user1 is then put into a gameroom to await the arrival for User2. User2 logs in, connects to the server and clicks play. User2 is then put into an open game room if there is one with an opponent of appropriate rating (determined by some unknow rating system, probably an elo system), or is put into a new gameroom if there isnt. Once the room is full, a countdown to when User1's clock starts starts counting. It is interrupted if user1 makes a move. A similar timer is started for User2. After the first turn for each user, the real clocks start (when it is user1's turn, user1's clock is running). While it is user1's turn, user2 cannot move any pieces. Each client will have their own clock, however the server will have the master clocks that update the client's clocks each time a move is made. This is to ensure that if a user disconnects, their time is preserved. Once User1 drops a piece on a square, the client checks if it is a legal move. If it is, the move is sent to the server, which updates the board, stores the move, and sends the move back to both clients to update their boards. The turns is flipped, and it is User2's turn to make a move. Play proceeds like this until checkmate is acheived, one player runs out of time, stalemate is achieved, a draw is agreed upon, or a player resigns. Ratings are updated and both players are then sent back to the home screen to join another game or log off. If a user disconnect's at any point during the match they have an arbitrary amount of time allowed before the other user is allowed to claim victory. If both users disconnect the game is not counted towards rating.


On the addition of new features:
For each game variant there will need to be a separate rating system, matchmaking system, unique legal move verification, unique win conditions, and in some cases (like crazyhouse) new systems entirely (being able to place taken pieces on the board as your turn). Each gamemode should be completed before starting a new one.
Each unique allowed gametime (how much time each player has to make moves) must have a unique set of gamerooms. This ensures that each player gets to play with the unique settings they choose. A quickmatch option will also be added to let the server find any game room that is open to ensure a match is found quickly. There will be additional customization options for the quickmatch button to allow for certain parts to be determined by the user and other by whichever game room is open.