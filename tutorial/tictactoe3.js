var app = angular.module('tictactoe', ['ui.bootstrap']);

app.controller('game', function($scope) {
	// Track our current player, starting with X:
	var player_current = 'X';

	// This two-dimensional arrays is a simple way to 
	// track the game state:
	var board = [
		[' ', ' ', ' '],
		[' ', ' ', ' '],
		[' ', ' ', ' ']
	];

	// Handle cell clicks from the UI:
	$scope.move = function(row, col) {
		// Do nothing if game over:
		if (is_gamve_over()) return;

		// Do nothing if a cell is taken:
		if (board[row][col] != ' ') return;

		// Record the move in the board:
		board[row][col] = player_current;
		
		// Advance the player:
		if (player_current == 'X') player_current = 'O';
		else player_current = 'X';

		var winning_moves = find_winning_moves();
		if (winning_moves.length > 0) {
			$scope.winning_moves = winning_moves;
		}
		console.log('winner: ' + winning_moves);

		var tied = is_game_tied();
		console.log('game tied: ' + tied);
	};

	// Make the board visible to Angular's UI binding system
	$scope.winning_moves = [];
	$scope.board = board;

	function find_winning_moves() {
		var board_flat = board_flatten();
		var winning_paths = [
			[0,1,2], // by row
			[3,4,5],
			[6,7,8],
			[0,3,6], // by column
			[1,4,7],
			[2,5,8],
			[0,4,8], // by diagonal
			[6,4,2]
		];
		// Check for a winner amongst the potential winning
		// coordinates
		for (var i = 0; i < winning_paths.length; i++) {
			var coords = winning_paths[i]; 
			if (board_flat[coords[0]] != ' ' &&
				board_flat[coords[0]] == board_flat[coords[1]] &&
				board_flat[coords[1]] == board_flat[coords[2]]) {
				return coords;
			}
		}
		return [];
	}

	$scope.is_winning_move = function(row, col) {
		if ($scope.winning_moves.length > 0) {
			var flat_coord = row * 3 + col;
			return _.contains($scope.winning_moves, flat_coord);
		}
	}

	function board_flatten() {
		return _.flatten(board);
	}

	function is_game_tied() {
		return _.every(board_flatten(), function(cell) { return cell != ' ' });
	}

	function is_gamve_over() {
		if (is_game_tied()) return true;
		return $scope.winning_moves.length > 0;
	}
});






function TicTacToeGame(player_x_name, player_o_name) {

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