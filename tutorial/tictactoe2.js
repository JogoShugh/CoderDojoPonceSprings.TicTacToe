var app = angular.module('tictactoe', ['ui.bootstrap']);

app.controller('game', function($scope) {
	var game = new TicTacToeGame('Josh', 'Danae');
	$scope.board = game.board;	
});

function TicTacToeGame(player_x_name, player_o_name) {
	this.player_names = {'X':player_x_name, 'O': player_o_name};
	this.player_current = 'X';
	this.board = [
		[' ', ' ', ' '],
		[' ', ' ', ' '],
		[' ', ' ', ' ']
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
	function all_same(coords) {
		return 	board[coords[0][0]][coords[0][1]] != '' 
				&& board[coords[0][0]][coords[0][1]] == board[coords[1][0]][coords[1][1]]
				&& board[coords[1][0]][coords[1][1]] == board[coords[2][0]][coords[2][1]]
	}

	var winning_coords = [
		// rows
		[[0,0],[0,1],[0,2]],
		[[1,0],[1,1],[1,2]],
		[[2,0],[2,1],[2,2]],
		// columns
		[[0,0],[1,0],[2,0]],
		[[0,1],[1,1],[2,1]],
		[[0,2],[1,2],[2,2]],
		// diagonals
		[[0,0],[1,1],[2,2]],
		[[2,0],[1,1],[0,2]]
	];
	for (var i = 0; i < winning_coords.length; i++) {
		var coords = winning_coords[i];
		if(all_same(coords)) {
			return {over:true,winner:board[coords[0][0]][coords[0][1]],moves:coords}
		}
	}
	if (this.moves_count == 9) {
		return {over:true, winner:'', moves:[]};
	}
	else {
		return {over:false, winner:'', moves:[]};
	}
};