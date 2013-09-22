function TicTacToeGame(player_x_name, player_o_name) {
	this.player_names = {'X':player_x_name, 'O': player_o_name};
	this.player_current = 'X';
	this.board = [
		['', '', ''],
		['', '', ''],
		['', '', '']
	];
	this.moves_count = 0;
	this.game_over = false;
}

TicTacToeGame.prototype.move = function(row, col) {
	if (this.game_over) return;
	if (this.board[row][col] != '') return;
	this.board[row][col] = this.player_current;
	this.moves_count++;
	var game_status = this.get_game_status();
	if (game_status.over && game_status.winner != '') {
		console.log('Game over! ' + game_status.winner + ' wins! Moves:' +
		JSON.stringify(game_status.moves));
	} else if (game_status.over && game_status.winner == '') {
		console.log('Tie game!');
	} 
	if (game_status.over) {
		this.game_over = true;
	}
	else {
		this.advance_player();
	}
};

TicTacToeGame.prototype.advance_player = function() {
	var next_players_map = {'X':'O', 'O':'X'};
	this.player_current = next_players_map[this.player_current];
	console.log(JSON.stringify(this.board, null, 4));
	console.log(this.player_names[this.player_current] + ' (' +
		this.player_current + ') is up...');
};

TicTacToeGame.prototype.get_game_status = function() {
	// Check rows
	var board = this.board;
	for (var row = 0; row < 3; row++) {
		if (board[row][0] != '' && 
			board[row][0] == board[row][1] && 
			board[row][1] == board[row][2]) {
			return {over:true, winner:board[row][0], moves:[[row, 0], [row, 1], [row, 2]]}
		}
	}
	// Check columns
	for (var col = 0; col < 3; col++) {
		if (board[0][col] != '' && 
			board[0][col] == board[1][col] 
			&& board[1][col] == board[2][col]) {
			return {over:true, winner:board[0][col], moves:[[0, col], [1, col], [2, col]]};
		}
	} // Check diagonals
	if (board[0][0] != '' && 
		board[0][0] == board[1][1] && 
		board[1][1] == board[2][2]){
		return {over:true, winner:board[0][0], moves:[[0,0], [1,1], [2,2]]};
	}
	if (board[2][0] != '' &&
		board[2][0] == board[1][1] &&
		board[1][1] == board[0][2]){
		return {over:true, winner: board[2][0], moves:[[2,0], [1,1], [0,2]]};
	}
	if (this.moves_count == 9) {
		return {over:true, winner:'', moves:[]};
	}
	else {
		return {over:false, winner:'', moves:[]};
	}
};