var app = angular.module('tictactoe', ['ui.bootstrap']);

app.controller('player', function($scope){
  $scope.players = [];
  $scope.playerAdd = function(playerName) {
    $scope.players.push(playerName);
  }
});

app.controller('game', function($scope) {
  var X = 'X',
      O = 'O',
      s = ' ',
      player_current = X;

  var board = [      
    [s, s, s],
    [s, s, s],
    [s, s, s]
  ];

  $scope.move = function(row, col) {
    if (board[row][col] != s) return;
    board[row][col] = player_current;
    player_current = player_current == X ? O : X;
  };

  $scope.board = board;
});